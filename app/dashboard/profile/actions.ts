"use server";

import { db } from "@/lib/db";
import { updatePfp } from "@/services/profileService";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function uploadPfpAction(base64Image: string) {
  const cookieStore = await cookies();
  const sessionUsername = cookieStore.get("sessionUsername")?.value;

  if (!sessionUsername) return { error: "No autorizado" };
  try {
    // Enviamos el username y la imagen limpia
    await updatePfp(sessionUsername, base64Image);

    // Forzamos a Next.js a refrescar los datos del perfil
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error pfp upload:", error);
    return { error: "No se pudo guardar la imagen" };
  }
}

export async function updatePortfolioAction(content: string) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) return { error: "No autorizado" };

  try {
    // 1. Buscamos al usuario para obtener su ID real
    const user = await db.usuario.findUnique({
      where: { username },
    });

    if (!user) return { error: "Usuario no encontrado" };

    // 2. Actualizamos el perfil asociado a ese ID de usuario
    await db.perfilProveedor.update({
      where: { id_proveedor: user.id_usuario },
      data: { portafolio_resumen: content },
    });

    // 3. Limpiamos la caché para que el cambio se vea reflejado
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e) {
    console.error("Error saving portfolio:", e);
    return { error: "Error al guardar en la base de datos" };
  }
}
