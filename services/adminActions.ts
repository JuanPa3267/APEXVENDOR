"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteVendorAction(username: string) {
  try {
    // Buscamos al usuario
    const user = await db.usuario.findUnique({
      where: { username },
    });

    if (!user) return { error: "Usuario no encontrado" };

    // Eliminamos al usuario (Prisma eliminará en cascada los perfiles
    // si las relaciones están configuradas así, o lo hacemos manual)
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
