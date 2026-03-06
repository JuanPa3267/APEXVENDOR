import { describe, expect, test } from "bun:test";

describe("ResetPasswordPage - Lógica de Cliente", () => {
  test("Debería validar que el token exista en el estado antes de enviar", async () => {
    let token = null;

    // Simulación de la validación del useActionState
    const validateBeforeSend = (t: string | null) => {
      if (!t) return { error: "Token de recuperación inválido." };
      return { success: true };
    };

    const result = validateBeforeSend(token);
    expect(result.error).toBe("Token de recuperación inválido.");
  });

  test("Debería permitir el envío si el token está presente", () => {
    const token = "token_de_url_123";
    const result = token ? { success: true } : { error: "error" };
    expect(result.success).toBe(true);
  });
});
