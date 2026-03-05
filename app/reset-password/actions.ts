"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function resetPasswordAction(formData: FormData) {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (!token || !password || !confirm) {
        return { error: "Todos los campos son obligatorios." };
    }

    if (password !== confirm) {
        return { error: "Las contraseñas no coinciden." };
    }

    if (password.length < 8) {
        return { error: "La contraseña debe tener mínimo 8 caracteres" };
    }

    try {
        // 1. Verify token exists and is not expired
        const resetTokenRecord = await db.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetTokenRecord) {
            return { error: "El enlace es inválido o ha expirado." };
        }

        if (new Date() > resetTokenRecord.expires) {
            // Borrar token expirado por limpieza
            await db.passwordResetToken.delete({ where: { token } });
            return { error: "El enlace ha expirado. Por favor, solicita uno nuevo." };
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Update User's password
        await db.usuario.update({
            where: { correo: resetTokenRecord.correo },
            data: { passwordHash: hashedPassword },
        });

        // 4. Delete the token so it cannot be reused
        await db.passwordResetToken.delete({
            where: { token },
        });

        return { success: true };
    } catch (err: any) {
        console.error("Error in resetPasswordAction:", err);
        return { error: "Ocurrió un error al restablecer la contraseña." };
    }
}
