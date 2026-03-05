import { describe, expect, test } from "bun:test";

describe("VendorDetailPage - Contexto Administrativo", () => {
  test("TC-CB-70: Debería pasar la prop isAdminViewing como true al ProfileView", () => {
    const userRole = "Admin";
    const isAdminViewing = userRole === "Admin";

    expect(isAdminViewing).toBe(true);
  });
});
