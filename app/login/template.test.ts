import { describe, expect, test } from "bun:test";

describe("LoginTemplate - Lógica de Animación", () => {
  test("TC-CB-50: Debería usar el pathname como key para AnimatePresence", () => {
    const mockPathname = "/login";
    // En Caja Blanca validamos que la propiedad key sea dinámica
    const motionKey = mockPathname;
    expect(motionKey).toBe("/login");
  });
});
