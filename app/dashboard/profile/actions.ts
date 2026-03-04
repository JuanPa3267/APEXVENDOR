"use server";

import {
  deleteBlobByUrl,
  getReadSasUrlFromBlobUrl,
  uploadToAzureBlob,
} from "@/lib/azureBlob";
import { db } from "@/lib/db";
import { updatePfp } from "@/services/profileService";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-");
}

function assertPdf(file: File) {
  if (file.type !== "application/pdf")
    throw new Error("Solo se permiten PDFs.");
}

async function getSessionUsername() {
  const cookieStore = await cookies();
  return cookieStore.get("username")?.value; // ✅ cookie unificada
}

async function getSessionUser() {
  const username = await getSessionUsername();
  if (!username) return null;
  return await db.usuario.findUnique({ where: { username } });
}

export async function updatePersonalDataAction(formData: FormData) {
  const username = await getSessionUsername();
  if (!username) return { error: "No autorizado" };

  try {
    const user = await db.usuario.findUnique({
      where: { username },
      include: { perfilProveedor: true },
    });

    if (!user || !user.perfilProveedor) {
      return { error: "Perfil no encontrado" };
    }

    // ✅ Ahora TODO (contacto + redes) se guarda en PerfilProveedor
    // Construimos el objeto de actualización dinámicamente según lo que venga en el formData
    const updateData: any = {};

    // Campos de contacto
    if (formData.has("telefono"))
      updateData.telefono = (formData.get("telefono") as string) || null;
    if (formData.has("direccion"))
      updateData.direccion = (formData.get("direccion") as string) || null;
    if (formData.has("ciudad"))
      updateData.ciudad = (formData.get("ciudad") as string) || null;
    if (formData.has("tarifa_hora")) {
      const val = formData.get("tarifa_hora") as string;
      updateData.tarifa_hora = val ? parseFloat(val) : null;
    }
    if (formData.has("dias_disponibles")) {
      const val = formData.get("dias_disponibles") as string;
      updateData.dias_disponibles = val ? JSON.parse(val) : [];
    }
    if (formData.has("horas_disponibles")) {
      const val = formData.get("horas_disponibles") as string;
      updateData.horas_disponibles = val ? JSON.parse(val) : [];
    }

    // Campos de redes sociales
    if (formData.has("linkedin"))
      updateData.linkedin = (formData.get("linkedin") as string) || null;
    if (formData.has("github"))
      updateData.github = (formData.get("github") as string) || null;
    if (formData.has("website"))
      updateData.website = (formData.get("website") as string) || null;
    if (formData.has("instagram"))
      updateData.instagram = (formData.get("instagram") as string) || null;

    await db.perfilProveedor.update({
      where: { id_proveedor: user.id_usuario },
      data: updateData,
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e) {
    console.error("Error updating personal data:", e);
    return { error: "Error al actualizar los datos" };
  }
}

export async function uploadPfpAction(base64Image: string) {
  const sessionUsername = await getSessionUsername();
  if (!sessionUsername) return { error: "No autorizado" };

  try {
    await updatePfp(sessionUsername, base64Image);
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error pfp upload:", error);
    return { error: "No se pudo guardar la imagen" };
  }
}

export async function updatePortfolioAction(content: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autorizado" };

  try {
    await db.perfilProveedor.update({
      where: { id_proveedor: user.id_usuario },
      data: { portafolio_resumen: content },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e) {
    console.error("Error saving portfolio:", e);
    return { error: "Error al guardar en la base de datos" };
  }
}

/** SAS solo lectura para ver/descargar */
export async function getSasUrlAction(blobUrl: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autorizado" };

  try {
    // 1) Validar si es Admin
    const userWithRoles = await db.usuario.findUnique({
      where: { id_usuario: user.id_usuario },
      include: { roles: { include: { rol: true } } },
    });

    const isAdmin =
      userWithRoles?.roles?.some((r: any) => r.rol.nombre === "Admin") ?? false;

    // 2) Verificar que esa URL exista en la BD
    //    (así no se genera SAS para un archivo que no esté registrado)
    const cvRecord = await db.hoja_vida_proveedor.findFirst({
      where: { url_pdf: blobUrl },
      select: { id_proveedor: true },
    });

    const certRecord = await db.certificacion.findFirst({
      where: { url_archivo: blobUrl },
      select: { id_proveedor: true },
    });

    const contractRecord = await db.contrato_participacion.findFirst({
      where: { url_archivo: blobUrl },
      include: {
        participacion_proveedor: {
          select: { id_proveedor: true }
        }
      }
    });

    const ownerId = cvRecord?.id_proveedor ?? certRecord?.id_proveedor ?? contractRecord?.participacion_proveedor?.id_proveedor ?? null;

    if (!ownerId) {
      return { error: "Documento no encontrado en la base de datos" };
    }

    // 3) Si no es admin, solo permitir si el documento es suyo
    if (!isAdmin && ownerId !== user.id_usuario) {
      return { error: "No autorizado para ver este documento" };
    }

    // 4) Generar SAS temporal de solo lectura
    const sasUrl = getReadSasUrlFromBlobUrl(blobUrl, 10);
    return { url: sasUrl };
  } catch (e: any) {
    console.error(e);
    return { error: "No se pudo generar el enlace temporal" };
  }
}

/** Subir CV (solo proveedor dueño) */
export async function uploadCvAction(file: File) {
  const user = await getSessionUser();
  if (!user) return { error: "No autorizado" };

  try {
    if (!file || file.size === 0) return { error: "Selecciona un archivo" };
    assertPdf(file);

    // Verifica que tenga perfil proveedor (no admin)
    const proveedor = await db.perfilProveedor.findUnique({
      where: { id_proveedor: user.id_usuario },
    });
    if (!proveedor) return { error: "Solo proveedores pueden subir CV" };

    const container = process.env.AZURE_STORAGE_CV_CONTAINER || "cvs";
    const blobName = `${user.id_usuario}/${Date.now()}-cv-${safeFileName(
      file.name,
    )}`;

    // 1. Buscar y eliminar CV anterior si existe
    const existingCvs = await db.hoja_vida_proveedor.findMany({
      where: { id_proveedor: user.id_usuario },
    });

    for (const oldCv of existingCvs) {
      try {
        await deleteBlobByUrl(oldCv.url_pdf);
        await db.hoja_vida_proveedor.delete({
          where: { id_hojavida: oldCv.id_hojavida },
        });
      } catch (err) {
        console.error("Error deleting old CV:", err);
      }
    }

    // 2. Subir nuevo CV
    const uploaded = await uploadToAzureBlob({
      containerName: container,
      blobName,
      file,
    });

    await db.hoja_vida_proveedor.create({
      data: {
        id_proveedor: user.id_usuario,
        url_pdf: uploaded.url,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e?.message ?? "No se pudo subir el CV" };
  }
}

/** Eliminar CV (solo proveedor dueño) */
export async function deleteCvAction(id_hojavida: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autorizado" };

  try {
    const cv = await db.hoja_vida_proveedor.findUnique({
      where: { id_hojavida },
    });
    if (!cv) return { error: "CV no encontrado" };
    if (cv.id_proveedor !== user.id_usuario) return { error: "No autorizado" };

    // Borra blob y registro
    await deleteBlobByUrl(cv.url_pdf);
    await db.hoja_vida_proveedor.delete({ where: { id_hojavida } });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e?.message ?? "No se pudo eliminar el CV" };
  }
}

/** Subir certificación (solo proveedor dueño) */
export async function uploadCertAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: "No autorizado" };

  try {
    const proveedor = await db.perfilProveedor.findUnique({
      where: { id_proveedor: user.id_usuario },
    });
    if (!proveedor)
      return { error: "Solo proveedores pueden agregar certificaciones" };

    const nombre = (formData.get("nombre") as string) || "";
    const emisor = (formData.get("emisor") as string) || "";
    const nivel = (formData.get("nivel") as string) || "";
    const fecha_emision = (formData.get("fecha_emision") as string) || "";
    const fecha_expiracion = (formData.get("fecha_expiracion") as string) || "";
    const file = formData.get("file") as File | null;

    if (!nombre || !emisor || !fecha_emision) {
      return { error: "Nombre, emisor y fecha de emisión son obligatorios" };
    }
    if (!file || file.size === 0) return { error: "Adjunta el PDF" };
    assertPdf(file);

    const container =
      process.env.AZURE_STORAGE_CERTS_CONTAINER || "certificaciones";
    const blobName = `${user.id_usuario}/${Date.now()}-cert-${safeFileName(
      file.name,
    )}`;

    const uploaded = await uploadToAzureBlob({
      containerName: container,
      blobName,
      file,
    });

    await db.certificacion.create({
      data: {
        id_proveedor: user.id_usuario,
        nombre_certificacion: nombre,
        emisor,
        nivel_categoria: nivel || null,
        fecha_emision: new Date(fecha_emision),
        fecha_expiracion: fecha_expiracion ? new Date(fecha_expiracion) : null,
        url_archivo: uploaded.url,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e?.message ?? "No se pudo agregar la certificación" };
  }
}

/** Eliminar certificación (solo proveedor dueño) */
export async function deleteCertAction(id_cert: string) {
  const user = await getSessionUser();
  if (!user) return { error: "No autorizado" };

  try {
    const cert = await db.certificacion.findUnique({ where: { id_cert } });
    if (!cert) return { error: "Certificación no encontrada" };
    if (cert.id_proveedor !== user.id_usuario)
      return { error: "No autorizado" };

    await deleteBlobByUrl(cert.url_archivo);
    await db.certificacion.delete({ where: { id_cert } });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e?.message ?? "No se pudo eliminar la certificación" };
  }
}



import bcrypt from "bcryptjs";

export async function updateEmailAction(newEmail: string) {
  const username = await getSessionUsername();
  if (!username) return { error: "No autorizado" };

  try {
    const email = newEmail.trim().toLowerCase().replace(/\s/g, "");
    if (!email) return { error: "Correo inválido" };

    const existingUser = await db.usuario.findUnique({
      where: { correo: email },
    });

    if (existingUser && existingUser.username !== username) {
      return { error: "El correo ya está en uso por otro usuario" };
    }

    await db.usuario.update({
      where: { username },
      data: { correo: email },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e) {
    console.error("Error updating email:", e);
    return { error: "Error al actualizar el correo" };
  }
}

export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  const username = await getSessionUsername();
  if (!username) return { error: "No autorizado" };

  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  }

  try {
    const user = await db.usuario.findUnique({
      where: { username },
    });

    if (!user || !user.passwordHash) {
      return { error: "Usuario no encontrado" };
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return { error: "La contraseña actual es incorrecta" };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await db.usuario.update({
      where: { username },
      data: { passwordHash: newHashedPassword },
    });

    return { success: true };
  } catch (e) {
    console.error("Error updating password:", e);
    return { error: "Error al actualizar la contraseña" };
  }
}
