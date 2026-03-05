import { db } from "@/lib/db"; // Asegúrate de que esta ruta sea correcta
import { describe, expect, mock, test } from "bun:test";
import { projectService } from "./projectService";

// Mock de Prisma específico para este archivo
mock.module("@/lib/db", () => ({
  db: {
    proyecto: {
      findUnique: mock(() => Promise.resolve(null)),
      update: mock(() => Promise.resolve({})),
    },
  },
}));

describe("Project Service - Business Rules", () => {
  test("Debería lanzar error en transición inválida", async () => {
    // Configuramos el mock para este test
    (db.proyecto.findUnique as any).mockResolvedValue({
      id_proyecto: "p1",
      estado: "planificado",
    });

    // Validamos que la lógica de projectService.ts rebote el cambio
    expect(
      projectService.updateProjectStatus("p1", "completado" as any),
    ).rejects.toThrow(/Transición inválida/);
  });
});
