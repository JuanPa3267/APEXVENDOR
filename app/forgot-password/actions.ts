"use server";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function requestPasswordResetAction(formData: FormData) {
    const email = (formData.get("email") as string)?.trim().toLowerCase();

    if (!email) {
        return { error: "El correo electrónico es obligatorio." };
    }

    try {
        const user = await db.usuario.findUnique({
            where: { correo: email },
        });

        if (!user) {
            // Por seguridad, no revelamos si el correo existe o no al usuario final, sino que simulamos éxito siempre.
            return { success: true };
        }

        // 1. Delete previous reset tokens for this email to prevent spam issues
        await db.passwordResetToken.deleteMany({
            where: { correo: email },
        });

        // 2. Create un token nuevo seguro
        const token = crypto.randomBytes(32).toString("hex");

        // 3. Save el token temporal a la BD, expires in default 10 mins (set on DB directly from schema)
        await db.passwordResetToken.create({
            data: {
                correo: email,
                token,
            },
        });

        // 4. Send email
        await sendPasswordResetEmail(email, token);

        return { success: true };
    } catch (err: any) {
        console.error("Error in requestPasswordResetAction:", err);
        return { error: "Ocurrió un error al procesar la solicitud. Inténtalo más tarde." };
    }
}
