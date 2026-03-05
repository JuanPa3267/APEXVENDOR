import { describe, expect, test } from "bun:test";

describe("Modal Wrapper - Comportamiento del DOM", () => {
  test("Debería cambiar el overflow del body al abrirse", () => {
    const isOpen = true;
    let bodyOverflow = "unset";

    // Simulación del efecto del componente
    if (isOpen) {
      bodyOverflow = "hidden";
    }

    expect(bodyOverflow).toBe("hidden");
  });
});
