"use server";

import { db } from "@/lib/db"; // Asegúrate de que esta ruta sea correcta
import { authService } from "@/services/authService";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;

  const result = await authService.authenticateUser(
    usernameInput,
    passwordInput
  );

  // Validación de seguridad para TypeScript
  if (!result.success || !result.user) {
    return { error: result.error || "Credenciales incorrectas" };
  }

  const user = result.user;

  // Buscamos el rol en la base de datos de Azure
  const userWithRoles = await db.usuario.findUnique({
    where: { username: user.username as string },
    include: {
      roles: {
        include: {
          rol: true,
        },
      },
    },
  });

  // Verificamos si es "Admin" (Coincidiendo con tu tabla 'rol')
  const isAdmin = userWithRoles?.roles.some(
    (r: any) => r.rol.nombre === "Admin"
  );

  const cookieStore = await cookies();
  const duration = 60 * 60 * 24; // 24 horas

  // Seteamos las cookies para el Middleware
  cookieStore.set("session_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: duration,
  });

  cookieStore.set("username", user.username as string, {
    path: "/",
    maxAge: duration,
  });

  cookieStore.set("user_role", isAdmin ? "Admin" : "Proveedor", {
    path: "/",
    maxAge: duration,
  });

  // REDIRECCIÓN DINÁMICA INICIAL
  if (isAdmin) {
    redirect("/dashboard/chat");
  } else {
    redirect("/dashboard/profile");
  }
}
