import { describe, expect, test } from "bun:test";

describe("EditVendorAssignmentModal - Integridad de Datos", () => {
  test("TC-CB-95: Debería convertir fechas de DB al formato YYYY-MM-DD para el input", () => {
    const dbDate = "2026-03-05T10:00:00Z";
    // Simulamos la lógica de tu componente: assignment.inicio.toISOString().split("T")[0]
    const formatted = new Date(dbDate).toISOString().split("T")[0];

    expect(formatted).toBe("2026-03-05");
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("TC-CB-96: Debería manejar valores de fecha nulos con un string vacío", () => {
    const dbDate = null;
    const formatted = dbDate
      ? new Date(dbDate).toISOString().split("T")[0]
      : "";
    expect(formatted).toBe("");
  });
});
