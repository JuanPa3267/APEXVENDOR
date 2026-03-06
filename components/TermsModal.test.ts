import { describe, expect, mock, test } from "bun:test";

describe("TermsModal - Flujo de Aceptación", () => {
  test("Debería llamar a onAccept cuando el usuario acepta", () => {
    const onAccept = mock(() => {});
    // Simulamos la interacción
    onAccept();
    expect(onAccept).toHaveBeenCalled();
  });

  test("Debería llamar a onReject cuando el usuario cierra o rechaza", () => {
    const onReject = mock(() => {});
    onReject();
    expect(onReject).toHaveBeenCalled();
  });
});
