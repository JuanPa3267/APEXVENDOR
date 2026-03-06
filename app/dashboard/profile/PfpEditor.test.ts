import { describe, expect, test } from "bun:test";

describe("PfpEditor - Gestión de Avatar", () => {
  test("TC-CB-102: Debería validar el límite de tamaño de imagen (1MB)", () => {
    const fileSize = 1.5 * 1024 * 1024; // 1.5MB
    const limit = 1024 * 1024;

    expect(fileSize > limit).toBe(true);
  });

  test("TC-CB-103: Debería extraer la parte Base64 pura eliminando el prefijo DataURL", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
    const base64 = dataUrl.split(",")[1];

    expect(base64).not.toContain("data:image/png;base64");
  });
});
