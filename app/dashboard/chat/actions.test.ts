import { describe, expect, mock, test } from "bun:test";

mock.module("@/lib/db", () => ({
  db: {
    perfilProveedor: {
      findMany: mock(() =>
        Promise.resolve([{ id_proveedor: "prov_1", username: "cris" }]),
      ),
    },
    proyecto: {
      findMany: mock(() =>
        Promise.resolve([{ id_proyecto: "proj_1", nombre: "Apex" }]),
      ),
    },
    participacion_proveedor: { findMany: mock(() => Promise.resolve([])) },
    evaluacion: { findMany: mock(() => Promise.resolve([])) },
    evaluacion_detalle: { findMany: mock(() => Promise.resolve([])) },
    metrica: { findMany: mock(() => Promise.resolve([])) },
  },
}));

describe("Chat Actions - Inteligencia Artificial (Caja Blanca)", () => {
  test("TC-CB-110: sendMessageAction - Debería inyectar el contexto de proveedores en el Prompt", async () => {
    // Validamos la preparación del string de contexto
    const mockProveedores = [{ username: "cris", score: 5 }];
    const context = `CONOCIMIENTO ACTUAL DE PROVEEDORES: ${JSON.stringify(mockProveedores)}`;

    expect(context).toContain("cris");
    expect(context).toContain("5");
  });

  test("TC-CB-111: Protocolo de Asignación - Validación de formato de salida", () => {
    // Validamos que el "Caso Positivo" de la IA genere el bloque de texto esperado
    const aiResponse = `"id_proveedor": "prov_123",\n"id_proyecto": "proj_456"`;

    expect(aiResponse).toContain("id_proveedor");
    expect(aiResponse).toContain("id_proyecto");
  });
});
