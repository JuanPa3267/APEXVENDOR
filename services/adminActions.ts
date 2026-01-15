"use server";

import { db } from "@/lib/db";
import { deleteBlobByUrl } from "@/lib/azureBlob";
import { revalidatePath } from "next/cache";

export async function deleteVendorAction(username: string) {
  try {
    // 1. Buscamos al usuario y sus documentos
    const user = await db.usuario.findUnique({
      where: { username },
      include: {
        perfilProveedor: {
          include: {
            certificaciones: true,
            hoja_vida_proveedor: true,
          },
        },
      },
    });

    if (!user) return { error: "Usuario no encontrado" };

    // 2. Eliminamos archivos de Azure (CVs y Certificaciones)
    // Usamos Promise.allSettled para intentar borrar todo aunque alguno falle
    const deletionPromises: Promise<any>[] = [];

    // CVs
    if (user.perfilProveedor?.hoja_vida_proveedor) {
      for (const cv of user.perfilProveedor.hoja_vida_proveedor) {
        if (cv.url_pdf) {
          deletionPromises.push(deleteBlobByUrl(cv.url_pdf));
        }
      }
    }

    // Certificaciones
    if (user.perfilProveedor?.certificaciones) {
      for (const cert of user.perfilProveedor.certificaciones) {
        if (cert.url_archivo) {
          deletionPromises.push(deleteBlobByUrl(cert.url_archivo));
        }
      }
    }

    // Ejecutamos borrado de blobs en paralelo
    if (deletionPromises.length > 0) {
      const results = await Promise.allSettled(deletionPromises);
      // Opcional: Loguear errores si alguno falló
      results.forEach((res, index) => {
        if (res.status === "rejected") {
          console.error(`Failed to delete blob #${index}:`, res.reason);
        }
      });
    }

    // 3. Eliminamos al usuario de la BD
    await db.usuario.delete({
      where: { id_usuario: user.id_usuario },
    });

    revalidatePath("/dashboard/vendors");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return { error: "No se pudo eliminar al proveedor" };
  }
}
