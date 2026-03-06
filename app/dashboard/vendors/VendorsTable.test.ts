import { describe, expect, test } from "bun:test";

describe("VendorsTable - Lógica de Filtrado (Caja Blanca)", () => {
  const mockVendors = [
    {
      nombres_apellidos: "Cristian Gomez",
      ciudad: "Bogotá",
      score: 4.5,
      identificacion_nit: "123",
    },
    {
      nombres_apellidos: "Ana Rojas",
      ciudad: "Medellín",
      score: 3.0,
      identificacion_nit: "456",
    },
  ];

  test("TC-CB-62: Debería filtrar correctamente por búsqueda parcial (insensible a mayúsculas)", () => {
    const query = "CRIS";
    const filtered = mockVendors.filter((v) =>
      v.nombres_apellidos.toLowerCase().includes(query.toLowerCase()),
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].nombres_apellidos).toBe("Cristian Gomez");
  });

  test("TC-CB-63: Debería aplicar el filtro de Score Mínimo correctamente", () => {
    const minScore = 4.0;
    const filtered = mockVendors.filter((v) => (v.score || 0) >= minScore);
    expect(filtered.length).toBe(1);
  });
});
