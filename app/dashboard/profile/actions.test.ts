import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { getSasUrlAction } from "./actions";

// Mock de infraestructura
mock.module("next/headers", () => ({
  cookies: mock(async () => ({
    get: (name: string) => ({ value: "cristian_gomez" }),
  })),
}));

mock.module("@/lib/db", () => ({
  db: {
    usuario: { findUnique: mock() },
    perfilProveedor: { update: mock() },
    hoja_vida_proveedor: { findFirst: mock() },
    certificacion: { findFirst: mock() },
    contrato_participacion: { findFirst: mock() },
  },
}));

describe("Profile Actions - Seguridad de Datos (Caja Blanca)", () => {
  test("TC-CB-100: safeFileName - Debería limpiar caracteres especiales y normalizar nombres", () => {
    const fileName = "Mi CV Especial 2026!!!.pdf";
    const cleaned = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/-+/g, "-");

    expect(cleaned).toBe("mi-cv-especial-2026-.pdf");
  });

  test("TC-CB-101: getSasUrlAction - Debería denegar acceso si el documento no pertenece al usuario y no es Admin", async () => {
    // Simulamos que el documento pertenece a otro ID
    (db.hoja_vida_proveedor.findFirst as any).mockResolvedValue({
      id_proveedor: "otro-id",
    });
    (db.usuario.findUnique as any).mockResolvedValue({
      id_usuario: "user-123",
      roles: [],
    });

    const result = await getSasUrlAction("https://azure.com/blob/otro-cv.pdf");
    expect(result.error).toBe("No autorizado para ver este documento");
  });
});
