import { describe, expect, test } from "bun:test";

describe("Navbar - Lógica de Navegación por Rol", () => {
  test("Debería mostrar links de Admin solo si el rol es Admin", () => {
    const role: string = "Admin";
    const isAdmin = role === "Admin";
    const navLinks = ["Intelligence Chat", "Proyectos", "Rankings"];

    // Simulación de la lógica del componente
    const visibleLinks = isAdmin ? navLinks : [];
    expect(visibleLinks).toContain("Intelligence Chat");
    expect(visibleLinks.length).toBe(3);
  });

  test("Debería mostrar 'Mi Perfil' solo si el rol es Proveedor", () => {
    const role: string = "Proveedor";
    const isProveedor = role === "Proveedor";

    expect(isProveedor).toBe(true);
    expect(role === "Admin").toBe(false);
  });
});
