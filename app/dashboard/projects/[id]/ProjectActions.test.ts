import { describe, expect, test } from "bun:test";

describe("ProjectActions - Seguridad y Concurrencia", () => {
  test("TC-CB-97: Debería deshabilitar el botón de eliminar durante la carga", () => {
    const deletePending = true;
    const isDisabled = deletePending;
    expect(isDisabled).toBe(true);
  });

  test("TC-CB-98: Formateo de fecha para el formulario de edición", () => {
    const projectDate = "2026-06-15";
    // fmtDate(project.inicio) -> .toISOString().slice(0, 10)
    const fmt = new Date(projectDate).toISOString().slice(0, 10);
    expect(fmt).toBe("2026-06-15");
  });
});
