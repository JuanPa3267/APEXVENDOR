import { db } from "@/lib/db";
import { describe, expect, mock, spyOn, test } from "bun:test";
import { userService } from "./userService";

// 1. Mockeamos el módulo antes que nada
mock.module("@/lib/db", () => ({
  db: {
    $transaction: mock(async (cb) => await cb(db)), // Simula la transacción
    usuario: { create: mock() },
    perfilProveedor: { create: mock() },
    rol: { findUnique: mock() },
    usuarioRol: { create: mock() },
    pfps: { create: mock() },
  },
}));

describe("User Service - Registro de Proveedores", () => {
  test("Debería registrar un usuario y asignar su rol en transacción", async () => {
    // Configuramos los retornos de los mocks
    (db.usuario.create as any).mockResolvedValue({
      id_usuario: "u1",
      username: "cris",
    });
    (db.rol.findUnique as any).mockResolvedValue({
      id_rol: "r1",
      nombre: "Proveedor",
    });

    // Ahora el spyOn funcionará porque db.usuario es un objeto real del mock
    const roleSpy = spyOn(db.usuarioRol, "create").mockResolvedValue({} as any);

    await userService.registerUser({
      username: "cris",
      correo: "c@c.com",
      passwordHash: "hash",
      tipo_proveedor: "Persona",
      nit: "123",
      city: "Bogotá",
      is_admin: false,
    });

    expect(roleSpy).toHaveBeenCalled();
  });
});
