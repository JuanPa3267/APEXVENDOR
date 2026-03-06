import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { getAuditRecords } from "./actions";

// Mock de la base de datos
mock.module("@/lib/db", () => ({
  db: {
    evaluacion: { findMany: mock() },
    perfilProveedor: { findMany: mock() },
  },
}));

describe("Logs Actions - Inteligencia de Datos (Caja Blanca)", () => {
  test("TC-CB-106: getAuditRecords - Debería calcular promedios de métricas correctamente", async () => {
    // Simulamos evaluaciones con la estructura completa de relaciones
    (db.evaluacion.findMany as any).mockResolvedValue([
      {
        fecha: new Date("2026-03-05"),
        participacion_proveedor: {
          id_proveedor: "p1",
          perfil_proveedor: {
            nombres_apellidos: "Cristian Gomez",
            nombre_legal: null,
          },
          proyecto: { nombre: "Proyecto Alfa" },
        },
        evaluacion_detalle: [
          { metrica: { nombre: "Calidad" }, valor_numerico: 5 },
        ],
      },
      {
        fecha: new Date("2026-03-05"),
        participacion_proveedor: {
          id_proveedor: "p2",
          perfil_proveedor: {
            nombres_apellidos: "Allison",
            nombre_legal: null,
          },
          proyecto: { nombre: "Proyecto Beta" },
        },
        evaluacion_detalle: [
          { metrica: { nombre: "Calidad" }, valor_numerico: 3 },
        ],
      },
    ]);

    (db.perfilProveedor.findMany as any).mockResolvedValue([]);

    const result = await getAuditRecords();
    const calidadMetric = result.metricAverages.find(
      (m) => m.name === "Calidad",
    );

    // Verificación aritmética: (5 + 3) / 2 = 4
    expect(calidadMetric?.score).toBe(4);
    expect(calidadMetric?.providerCount).toBe(2);

    // Verificación de integridad de registros crudos
    expect(result.rawRecords.length).toBe(2);
    expect(result.rawRecords[0].proveedor).toBe("Cristian Gomez");
  });

  test("TC-CB-107: getAuditRecords - Debería ordenar correctamente los rankings", async () => {
    (db.evaluacion.findMany as any).mockResolvedValue([]);
    (db.perfilProveedor.findMany as any).mockResolvedValue([
      { nombres_apellidos: "Mejor Proveedor", score: 5.0 },
      { nombres_apellidos: "Peor Proveedor", score: 1.0 },
    ]);

    const result = await getAuditRecords();
    expect(result.best[0].score).toBe(5.0);
    expect(result.worst[0].score).toBe(1.0);
  });
});
