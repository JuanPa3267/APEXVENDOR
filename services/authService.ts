import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authService = {
  async authenticateUser(username: string, password: string) {
    const user = await db.usuario.findUnique({
      where: { correo: username || undefined },
    });

    console.log("User: " + user);

    if (!user || !user.passwordHash) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    console.log("isValid: " + isValid);
    console.log("Password Hash: " + user.passwordHash);
    console.log("Password: " + password);

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
