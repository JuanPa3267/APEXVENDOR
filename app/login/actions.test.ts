import { db } from "@/lib/db";
import { authService } from "@/services/authService";
import { describe, expect, mock, spyOn, test } from "bun:test";
import { loginAction } from "./actions";

// Mock de Cookies y Navigation
mock.module("next/headers", () => ({
  cookies: mock(() =>
    Promise.resolve({
      set: mock(() => {}),
    }),
  ),
}));

mock.module("next/navigation", () => ({
  redirect: mock(() => {}),
}));

describe("Login Action - Lógica de Acceso (Caja Blanca)", () => {
  test("TC-CB-48: Debería redireccionar a /dashboard/chat si el usuario es Admin", async () => {
    // 1. Mock de autenticación exitosa
    spyOn(authService, "authenticateUser").mockResolvedValue({
      success: true,
      user: { id: "u1", username: "admin_user", email: "admin@apex.com" },
    });

    // 2. Mock de búsqueda de rol en DB
    (db.usuario.findUnique as any).mockResolvedValue({
      username: "admin_user",
      roles: [{ rol: { nombre: "Admin" } }],
    });

    const formData = new FormData();
    formData.append("username", "admin_user");
    formData.append("password", "clave123");

    try {
      await loginAction(null, formData);
    } catch (e) {
      // Ignoramos el error de redirect de Next.js
    }

    const { redirect } = await import("next/navigation");
    expect(redirect).toHaveBeenCalledWith("/dashboard/chat");
  });

  test("TC-CB-49: Debería redireccionar a /dashboard/profile si el usuario es Proveedor", async () => {
    spyOn(authService, "authenticateUser").mockResolvedValue({
      success: true,
      user: { id: "u2", username: "vendor_user", email: "vendor@apex.com" },
    });

    (db.usuario.findUnique as any).mockResolvedValue({
      username: "vendor_user",
      roles: [{ rol: { nombre: "Proveedor" } }],
    });

    const formData = new FormData();
    formData.append("username", "vendor_user");
    formData.append("password", "clave123");

    try {
      await loginAction(null, formData);
    } catch (e) {}

    const { redirect } = await import("next/navigation");
    expect(redirect).toHaveBeenCalledWith("/dashboard/profile");
  });
});
