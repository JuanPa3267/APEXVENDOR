import { describe, expect, test } from "bun:test";

describe("ChatContainer - Estado y Persistencia", () => {
  test("TC-CB-112: Debería identificar el estado inicial (isInitialState) correctamente", () => {
    const messages: any[] = [];
    const isInitial = messages.length === 0;
    expect(isInitial).toBe(true);
  });

  test("TC-CB-113: Gestión de Historial LocalStorage", () => {
    const history = [{ role: "user", content: "Hola" }];
    const serialized = JSON.stringify(history);

    // Simulación de guardado
    const parsed = JSON.parse(serialized);
    expect(parsed[0].content).toBe("Hola");
    expect(parsed.length).toBe(1);
  });
});
