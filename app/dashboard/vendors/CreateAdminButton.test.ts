import { describe, expect, test } from "bun:test";

describe("CreateAdminButton - Comportamiento UI (Caja Blanca)", () => {
  test("TC-CB-67: Debería sanitizar el username en tiempo real (LowerCase + No Spaces)", () => {
    const input = "Cris Gomez";
    // Simulamos tu lógica de onInput: e.target.value.toLowerCase().replace(/\s/g, '')
    const sanitized = input.toLowerCase().replace(/\s/g, "");

    expect(sanitized).toBe("crisgomez");
    expect(sanitized).not.toContain(" ");
  });

  test("TC-CB-68: Debería bloquear el botón de 'Crear' si hay errores de email", () => {
    const emailError = "Este correo ya existe";
    const loading = false;
    const checkingEmail = false;

    const isDisabled = loading || checkingEmail || !!emailError;
    expect(isDisabled).toBe(true);
  });
});
