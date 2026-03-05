import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { createProjectAction } from "./actions";

// Mock de infraestructura
mock.module("next/headers", () => ({
  cookies: mock(async () => ({
    get: (name: string) => ({
      value: name === "username" ? "admin_user" : "Admin",
    }),
  })),
}));

mock.module("@/lib/db", () => ({
  db: {
    usuario: { findUnique: mock() },
    proyecto: { create: mock() },
  },
}));

describe("Projects Actions - Reglas de Negocio (Caja Blanca)", () => {
  test("TC-CB-80: Debería rechazar proyectos con fecha de fin anterior a la de inicio", async () => {
    // Simulamos usuario Admin logueado
    (db.usuario.findUnique as any).mockResolvedValue({
      roles: [{ rol: { nombre: "Admin" } }],
    });

    const formData = new FormData();
    formData.append("cliente", "Cliente Test");
    formData.append("nombre", "Proyecto Invalido");
    formData.append("inicio", "2026-05-01");
    formData.append("fin", "2026-04-01"); // Fecha anterior

    const result = await createProjectAction(null, formData);
    expect(result.error).toBe("La fecha fin no puede ser anterior a inicio");
  });

  test("TC-CB-81: Debería exigir cliente y nombre como campos obligatorios", async () => {
    const formData = new FormData();
    formData.append("cliente", ""); // Vacío

    const result = await createProjectAction(null, formData);

    // Cambiamos "No autorizado" por el mensaje real de tu validación:
    expect(result.error).toBe("Cliente y nombre del proyecto son obligatorios");
  });
});
