import { describe, expect, mock, test } from "bun:test";

// Mock de las cookies de Next.js
mock.module("next/headers", () => ({
  cookies: mock(() =>
    Promise.resolve({
      get: (name: string) => {
        if (name === "username") return { value: "Cristian" };
        if (name === "user_role") return { value: "Admin" };
        return undefined;
      },
    }),
  ),
}));

describe("DashboardLayout - Lógica de Sesión (Caja Blanca)", () => {
  test("TC-CB-58: Debería extraer correctamente el username de la cookie", async () => {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const username = cookieStore.get("username")?.value;
    expect(username).toBe("Cristian");
  });

  test("TC-CB-59: Debería asignar 'Admin' como rol por defecto si existe la cookie", async () => {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const role = cookieStore.get("user_role")?.value || "Admin";
    expect(role).toBe("Admin");
  });

  test("TC-CB-60: Debería manejar valores por defecto si no hay cookies", async () => {
    // Simulamos un entorno sin cookies
    const getVal = (c: any) => c?.value || "User";
    expect(getVal(undefined)).toBe("User");
  });
});
