"use server";

import { sendWelcomeEmail } from "@/lib/mail";
import { generateUsername } from "@/lib/utils";
import { userService } from "@/services/userService";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get("correo") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string; // Nombres y Apellidos
  const tipo_proveedor = formData.get("tipo_proveedor") as string;
  const is_admin = formData.get("is_admin") === "true";

  // LÓGICA MIGRADA: Autogeneración de username
  const basePrefix = is_admin ? "a" : "p";
  const username = generateUsername(name, basePrefix);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await userService.registerUser({
      username, // El username generado automáticamente
      correo: email,
      passwordHash: hashedPassword,
      name,
      nit: formData.get("nit") as string,
      city: formData.get("city") as string,
      tipo_proveedor,
      is_admin,
    });
    sendWelcomeEmail(email, name);
    // Aquí podrías añadir la lógica de envío de email más adelante
  } catch (error: any) {
    console.error("DETALLE DEL ERROR:", error); // Esto saldrá en tu terminal de VS Code
    return { error: `Error de Prisma: ${error.message}` };
  }

  redirect("/login?success=true");
}
