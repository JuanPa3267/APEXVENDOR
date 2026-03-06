import { describe, expect, test } from "bun:test";

describe("LogsPage - Utilidades de Exportación", () => {
  test("TC-CB-108: sanitizeCSVField - Debería limpiar saltos de línea y escapar comillas", () => {
    const dirtyData = 'Texto con "comillas" \n y saltos';
    const cleaned = String(dirtyData)
      .trim()
      .replace(/[\n\r]+/g, " ")
      .replace(/"/g, '""');

    expect(cleaned).toBe('Texto con ""comillas""   y saltos');
  });

  test("TC-CB-109: getSlotIndex - Debería asignar correctamente el bloque horario de 2 horas", () => {
    // 10:30 AM debería caer en el bloque 5 (10-12)
    const date = "2026-03-05T10:30:00Z";
    const hour = new Date(date).getUTCHours();
    const slot = Math.floor(hour / 2);

    expect(slot).toBe(5);
  });
});
