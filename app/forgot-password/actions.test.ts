import { db } from "@/lib/db";
import * as mail from "@/lib/mail";
import { describe, expect, mock, spyOn, test } from "bun:test";
import { requestPasswordResetAction } from "./actions";

mock.module("@/lib/db", () => ({
  db: {
    usuario: { findUnique: mock() },
    passwordResetToken: {
      deleteMany: mock(() => Promise.resolve()),
      create: mock(() => Promise.resolve()),
    },
  },
}));

describe("Forgot Password Action - Caja Blanca (Seguridad)", () => {
  test("TC-CB-51: Debería simular éxito aunque el correo no exista (Privacidad)", async () => {
    (db.usuario.findUnique as any).mockResolvedValue(null);

    const formData = new FormData();
    formData.append("email", "no-existe@test.com");

    const result = await requestPasswordResetAction(formData);

    expect(result.success).toBe(true);
    // Verificamos que NO se cree un token si el usuario no existe
    expect(db.passwordResetToken.create).not.toHaveBeenCalled();
  });

  test("TC-CB-52: Debería generar un token y enviar correo si el usuario existe", async () => {
    (db.usuario.findUnique as any).mockResolvedValue({
      correo: "cris@test.com",
    });
    const sendMailSpy = spyOn(mail, "sendPasswordResetEmail").mockResolvedValue(
      {} as any,
    );

    const formData = new FormData();
    formData.append("email", "CRIS@test.com "); // Con espacios y mayúsculas

    await requestPasswordResetAction(formData);

    // Validamos normalización de email
    expect(db.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { correo: "cris@test.com" },
    });
    expect(sendMailSpy).toHaveBeenCalled();
  });
});
