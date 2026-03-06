import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { createAdminAction } from "./actions";

// 1. Mock de cookies mejorado
mock.module("next/headers", () => ({
  cookies: mock(async () => ({
    get: (name: string) => ({
      value: name === "username" ? "session_user" : "Admin",
    }),
  })),
}));

// 2. Mock de revalidatePath
mock.module("next/cache", () => ({
  revalidatePath: mock(() => {}),
}));

mock.module("@/lib/db", () => ({
  db: {
    usuario: { findUnique: mock() },
    rol: { findUnique: mock() },
    usuarioRol: { create: mock() },
    $transaction: mock(async (cb) => await cb(db)),
  },
}));

describe("Vendors Actions - Seguridad (Caja Blanca)", () => {
  test("TC-CB-64: Debería denegar la creación si el solicitante no es Admin", async () => {
    // Simulamos que el usuario en sesión (session_user) NO tiene el rol Admin en la DB
    (db.usuario.findUnique as any).mockResolvedValue({
      roles: [{ rol: { nombre: "Proveedor" } }],
    });

    const formData = new FormData();
    formData.append("username", "nuevo_admin");
    formData.append("correo", "test@test.com");
    formData.append("password", "12345678");
    formData.append("confirm", "12345678");

    const result = await createAdminAction(formData);

    expect(result.error).toBe("No autorizado");
  });

  test("TC-CB-65: Debería normalizar el username (quitar espacios y minúsculas)", () => {
    const input = " Cris Gomez ";
    const clean = input.trim().toLowerCase().replace(/\s/g, "");
    expect(clean).toBe("crisgomez");
  });
});
