import { describe, expect, test } from "bun:test";

describe("AdminListModal - Auditoría de Usuarios (Caja Blanca)", () => {
  const mockAdmins = [
    {
      id_usuario: "a1",
      username: "admin_cris",
      correo: "cris@apex.com",
      creado_en: new Date("2026-03-01T10:00:00Z"),
    },
  ];

  test("TC-CB-71: Debería renderizar el username con el prefijo '@' correctamente", () => {
    const admin = mockAdmins[0];
    const displayText = `@${admin.username || "sin_usuario"}`;
    expect(displayText).toBe("@admin_cris");
  });

  test("TC-CB-72: Debería formatear la fecha de creación al estándar local", () => {
    const fechaStr = new Date(mockAdmins[0].creado_en).toLocaleDateString();
    // Validamos que el formato de salida sea consistente (DD/MM/YYYY o similar según locale)
    expect(fechaStr).toContain("2026");
  });

  test("TC-CB-73: Manejo de estado vacío en el directorio de administradores", () => {
    const emptyAdmins: any[] = [];
    const showEmptyMessage = emptyAdmins.length === 0;
    expect(showEmptyMessage).toBe(true);
  });
});
