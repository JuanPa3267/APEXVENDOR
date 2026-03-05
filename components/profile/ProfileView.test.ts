import { describe, expect, test } from "bun:test";

describe("ProfileView Logic - Performance Score", () => {
  test("El ancho de la barra (ratingWidth) debe ser score * 20", () => {
    const score = 4.5;
    const ratingWidth = score * 20;
    expect(ratingWidth).toBe(90);
  });

  test("Debería ocultar el score si es menor o igual a 3.0 para el proveedor", () => {
    const score = 2.8;
    const isAdminViewing = false;
    const canSeeScore = isAdminViewing || score > 3.0;
    expect(canSeeScore).toBe(false);
  });
});
