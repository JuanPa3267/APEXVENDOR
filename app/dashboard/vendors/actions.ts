"use server";

import { db } from "@/lib/db";
import { generateUsername } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createAdminAction(formData: FormData) {
  const cookieStore = await cookies();
  const sessionUsername = cookieStore.get("username")?.value;

  if (!sessionUsername) return { error: "No autorizado" };

  // 1) Validar que quien crea sea Admin
  const requester = await db.usuario.findUnique({
    where: { username: sessionUsername },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = requester?.roles?.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) return { error: "No autorizado" };

  // 2) Datos del formulario
  const correo = (formData.get("correo") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!correo || !password || !confirm) {
    return { error: "Completa todos los campos" };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden" };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener mínimo 8 caracteres" };
  }

  // Usamos "admin" como nombre base para generar el username
  const username = generateUsername("admin", "a");
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.$transaction(async (tx) => {
      // Crear Usuario
      const user = await tx.usuario.create({
        data: {
          username,
          correo,
          passwordHash: hashedPassword,
        },
      });

      // (Eliminado) Ya no se crea PerfilAdmin

      // Asignar rol Admin
      const role = await tx.rol.findUnique({ where: { nombre: "Admin" } });
      if (!role) throw new Error('No existe el rol "Admin" en la tabla rol');

      await tx.usuarioRol.create({
        data: {
          id_usuario: user.id_usuario,
          id_rol: role.id_rol,
        },
      });
    });

    revalidatePath("/dashboard/vendors");
    return { success: true };
  } catch (e: any) {
    console.error("createAdminAction error:", e);
    return { error: e.message || "Error creando administrador" };
  }
}

import { projectService } from "@/services/projectService";

export async function assignVendorFromProfileAction(prev: any, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value;
    if (!username) return { error: "No autorizado" };

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const id_proveedor = String(formData.get("id_proveedor") || "");
    const rol_en_proyecto = String(formData.get("rol_en_proyecto") || "");
    const inicio = (formData.get("inicio") as string) || "";
    const fin = (formData.get("fin") as string) || "";
    const currentPath = (formData.get("currentPath") as string) || ""; // Para revalidar

    if (!id_proyecto || !id_proveedor || !rol_en_proyecto) {
      return { error: "Proyecto, proveedor y rol son obligatorios" };
    }

    await projectService.assignVendorToProject({
      id_proyecto,
      id_proveedor,
      rol_en_proyecto,
      inicio: inicio || null,
      fin: fin || null,
    });

    if (currentPath) revalidatePath(currentPath);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Error al asignar proyecto" };
  }
}
