import { describe, expect, test } from "bun:test";
import { generateUsername } from "./utils";

describe("Utils - generateUsername (Caja Blanca)", () => {
  test("Debería generar un formato válido {base}-{name}-{hash}", () => {
    const name = "Cristian";
    const result = generateUsername(name, "p", 8);

    // Verificamos la estructura con un Regex
    // ^p-cristian- seguido de exactamente 8 caracteres hexadecimales
    expect(result).toMatch(/^p-cristian-[a-f0-9]{8}$/);
  });

  test("Debería usar valores por defecto si no se pasan argumentos", () => {
    const result = generateUsername();
    // Por defecto: base="p", name="user", length=8
    expect(result).toMatch(/^p-user-[a-f0-9]{8}$/);
  });

  test("Debería manejar nombres con espacios tomando solo el primero", () => {
    const name = "Cristian Gomez";
    const result = generateUsername(name);
    // Debe ser p-cristian, no p-cristian gomez
    expect(result).toContain("p-cristian-");
  });

  test("Debería respetar el largo del hash solicitado", () => {
    const customLength = 12;
    const result = generateUsername("Cris", "v", customLength);
    const parts = result.split("-");
    const hashPart = parts[2];

    expect(hashPart.length).toBe(customLength);
  });

  test("Debería convertir el nombre a minúsculas", () => {
    const result = generateUsername("ALLISON");
    expect(result).toContain("-allison-");
  });
});
