import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authService = {
  async authenticateUser(username: string, password: string) {
    const user = await db.usuario.findUnique({
      where: { correo: username || undefined },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: "Contraseña incorrecta" };
    }

    return {
      success: true,
      user: {
        id: user.id_usuario,
        username: user.username,
        email: user.correo,
      },
    };
  },
};
