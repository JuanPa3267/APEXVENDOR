"use server";

import { uploadToAzureBlob } from "@/lib/azureBlob";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/mail";
import { generateUsername } from "@/lib/utils";
import { userService } from "@/services/userService";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-");
}

function assertPdf(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const email = (formData.get("correo") as string) || "";
  const password = (formData.get("password") as string) || "";

  const name = (formData.get("name") as string) || "";
  const tipo_proveedor = ((formData.get("tipo_proveedor") as string) ||
    "Persona") as "Persona" | "Empresa";
  const is_admin = formData.get("is_admin") === "true";

  const nit = (formData.get("nit") as string) || "";
  const city = (formData.get("city") as string) || "";

  // Extras (perfil proveedor)
  const telefono = (formData.get("telefono") as string) || null;
  const direccion = (formData.get("direccion") as string) || null;
  const portafolio_resumen =
    (formData.get("portafolio_resumen") as string) || null;

  // Redes (Usuario)
  const linkedin = (formData.get("linkedin") as string) || null;
  const github = (formData.get("github") as string) || null;
  const website = (formData.get("website") as string) || null;
  const instagram = (formData.get("instagram") as string) || null;

  if (!email || !password)
    return { error: "Correo y contraseña son obligatorios." };
  if (password.length < 8)
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!name) return { error: "El nombre es obligatorio." };
  if (!nit || !city) return { error: "NIT/Cédula y ciudad son obligatorios." };

  // Username autogenerado
  const basePrefix = is_admin ? "a" : "p";
  const username = generateUsername(name, basePrefix);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 0) Verificar si el correo ya existe
    const existingUser = await db.usuario.findUnique({
      where: { correo: email },
    });

    if (existingUser) {
      return { error: "Este correo ya está registrado." };
    }

    // 1) Crear usuario + perfil (retorna Usuario con id_usuario)
    const user = await userService.registerUser({
      username,
      correo: email,
      passwordHash: hashedPassword,
      name,
      nit,
      city,
      tipo_proveedor,
      is_admin,
      telefono,
      direccion,
      portafolio_resumen,
      linkedin,
      github,
      website,
      instagram,
    });

    const idProveedor = user.id_usuario;

    // 2) Subir CV (opcional)
    const cvFile = formData.get("hoja_vida_pdf") as File | null;
    if (cvFile && cvFile.size > 0) {
      assertPdf(cvFile);

      const cvContainer = process.env.AZURE_STORAGE_CV_CONTAINER || "cvs";
      const cvBlobName = `${idProveedor}/${Date.now()}-cv-${safeFileName(
        cvFile.name
      )}`;

      const uploadedCv = await uploadToAzureBlob({
        containerName: cvContainer,
        blobName: cvBlobName,
        file: cvFile,
      });

      await userService.addProveedorCv({
        id_proveedor: idProveedor,
        url_pdf: uploadedCv.url,
      });
    }

    // 3) Certificaciones (dinámicas) con archivo PDF por certificación
    const certNombres = formData.getAll("cert_nombre[]") as string[];
    const certEmisores = formData.getAll("cert_emisor[]") as string[];
    const certNiveles = formData.getAll("cert_nivel[]") as string[];
    const certFechasEmision = formData.getAll(
      "cert_fecha_emision[]"
    ) as string[];
    const certFechasExp = formData.getAll(
      "cert_fecha_expiracion[]"
    ) as string[];
    const certFiles = formData.getAll("cert_file[]") as File[];

    const certContainer =
      process.env.AZURE_STORAGE_CERTS_CONTAINER || "certificaciones";

    // Recorre por índice (se asume que vienen alineados)
    const max = Math.max(
      certNombres.length,
      certEmisores.length,
      certNiveles.length,
      certFechasEmision.length,
      certFechasExp.length,
      certFiles.length
    );

    for (let i = 0; i < max; i++) {
      const nombre = (certNombres[i] || "").trim();
      const emisor = (certEmisores[i] || "").trim();
      const nivel = (certNiveles[i] || "").trim() || null;
      const fecha_emision = certFechasEmision[i] || "";
      const fecha_expiracion = (certFechasExp[i] || "").trim() || null;

      const file = certFiles[i];

      // Si fila vacía, ignora
      const filaVacia =
        !nombre && !emisor && !fecha_emision && (!file || file.size === 0);

      if (filaVacia) continue;

      // Si no está vacía, exige los obligatorios
      if (!nombre || !emisor || !fecha_emision) {
        throw new Error(
          `Faltan datos obligatorios en la certificación #${i + 1}.`
        );
      }
      if (!file || file.size === 0) {
        throw new Error(`Falta el PDF en la certificación #${i + 1}.`);
      }

      assertPdf(file);

      const certBlobName = `${idProveedor}/${Date.now()}-cert-${safeFileName(
        file.name
      )}`;

      const uploadedCert = await uploadToAzureBlob({
        containerName: certContainer,
        blobName: certBlobName,
        file,
      });

      await userService.addProveedorCertificacion({
        id_proveedor: idProveedor,
        nombre_certificacion: nombre,
        emisor,
        nivel_categoria: nivel,
        fecha_emision,
        fecha_expiracion,
        url_archivo: uploadedCert.url,
      });
    }

    // 4) Email bienvenida
    sendWelcomeEmail(email, name);
  } catch (error: any) {
    console.error("DETALLE DEL ERROR:", error);
    return { error: error?.message ?? "Error registrando el usuario." };
  }

  redirect("/login?success=true");
}
