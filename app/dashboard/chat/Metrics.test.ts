import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { deleteMetricAction } from "./actions";

describe("Chat Metrics - Reglas de Integridad", () => {
  test("TC-CB-114: deleteMetricAction - Debería bloquear el borrado si la métrica tiene uso (usageCount > 0)", async () => {
    // Mock de conteo de uso en base de datos
    (db.evaluacion_detalle.count as any) = mock(() => Promise.resolve(1));

    const result = await deleteMetricAction("metrica_usada");
    expect(result.error).toContain("ya ha sido usada");
  });
});
