"use server";

import { updatePfp } from "@/services/profileService";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function uploadPfpAction(base64Image: string) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) return { error: "Sesión no válida" };

  try {
    // Enviamos el username y la imagen limpia
    await updatePfp(username, base64Image);

    // Forzamos a Next.js a refrescar los datos del perfil
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error pfp upload:", error);
    return { error: "No se pudo guardar la imagen" };
  }
}
