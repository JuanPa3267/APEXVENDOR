import { describe, expect, test } from "bun:test";
// No ejecutaremos la llamada real, solo probaremos lógica de datos si fuera necesario
// Pero podemos probar la estructura que espera tu función

describe("Gemini Integration Logic", () => {
  test("Debería formatear correctamente el historial de 'ai' a 'model'", () => {
    const rawHistory = [
      { role: "ai", content: "Hola" },
      { role: "user", content: "Mundo" },
    ];

    // Aquí puedes exportar la lógica de mapeo o testear el comportamiento interno
    const formatted = rawHistory.map((msg) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    expect(formatted[0].role).toBe("model");
    expect(formatted[1].role).toBe("user");
  });
});
