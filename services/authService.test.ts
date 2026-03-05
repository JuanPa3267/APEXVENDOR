import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { describe, expect, mock, spyOn, test } from "bun:test";
import { authService } from "./authService";

// Mock del módulo de base de datos
mock.module("@/lib/db", () => ({
  db: {
    usuario: {
      findUnique: mock(() => Promise.resolve(null)),
      update: mock(() => Promise.resolve({})),
    },
  },
}));

describe("Auth Service - Seguridad (Caja Blanca)", () => {
  test("Debería fallar si bcrypt detecta contraseña errónea", async () => {
    // 1. Preparamos el usuario en el mock de DB
    (db.usuario.findUnique as any).mockResolvedValue({
      id_usuario: "1",
      correo: "cris@gmail.com",
      passwordHash: "$2a$10$hash_simulado_super_seguro",
    });

    // 2. Corregimos el error de tipos de bcrypt.compare
    // Usamos mock.module o spyOn con casting
    const compareMock = spyOn(bcrypt, "compare") as any;
    compareMock.mockResolvedValue(false);

    const result = await authService.authenticateUser(
      "cris@gmail.com",
      "wrong_pass",
    );

    // 3. Validaciones de Caja Blanca
    expect(result.success).toBe(false);
    expect(result.error).toBe("Contraseña incorrecta");
    // Verificamos que NO se llamó al update (no debe actualizar ultimo_acceso si falla)
    expect(db.usuario.update).not.toHaveBeenCalled();
  });
});
