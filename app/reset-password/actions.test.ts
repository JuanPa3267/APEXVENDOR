import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { resetPasswordAction } from "./actions";

// Mockeamos el DB de Prisma
mock.module("@/lib/db", () => ({
  db: {
    passwordResetToken: {
      findUnique: mock(() => Promise.resolve(null)),
      delete: mock(() => Promise.resolve({})),
    },
    usuario: {
      update: mock(() => Promise.resolve({})),
    },
  },
}));

describe("Reset Password Action - Caja Blanca (Seguridad)", () => {
  test("Debería fallar si las contraseñas no coinciden", async () => {
    const formData = new FormData();
    formData.append("token", "token123");
    formData.append("password", "clave12345");
    formData.append("confirm", "claveDIFERENTE");

    const result = await resetPasswordAction(formData);
    expect(result.error).toBe("Las contraseñas no coinciden.");
  });

  test("Debería fallar si el token ha expirado", async () => {
    const formData = new FormData();
    formData.append("token", "token_viejo");
    formData.append("password", "NuevaClave123");
    formData.append("confirm", "NuevaClave123");

    // Simulamos un token que expiró hace 1 hora
    const expiredDate = new Date(Date.now() - 3600000);
    (db.passwordResetToken.findUnique as any).mockResolvedValue({
      token: "token_viejo",
      expires: expiredDate,
      correo: "test@example.com",
    });

    const result = await resetPasswordAction(formData);
    expect(result.error).toContain("ha expirado");
  });
});
