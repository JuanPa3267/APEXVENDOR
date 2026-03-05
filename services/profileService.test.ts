import { db } from "@/lib/db";
import { describe, expect, mock, test } from "bun:test";
import { getFullProfile } from "./profileService";

// 1. Mockeamos el módulo DB antes que nada
mock.module("@/lib/db", () => ({
  db: {
    usuario: {
      findUnique: mock(() => Promise.resolve(null)),
    },
  },
}));

describe("Profile Service - Data Mapping (Caja Blanca)", () => {
  test("Debería manejar redes sociales como null si no existen en perfilProveedor", async () => {
    // Simulamos un usuario que existe pero su perfilProveedor es null
    (db.usuario.findUnique as any).mockResolvedValue({
      id_usuario: "u1",
      username: "cristian",
      correo: "cris@test.com",
      estado_cuenta: "Activo",
      ultimo_acceso: new Date(),
      actualizado_en: new Date(),
      perfilProveedor: null, // Caso crítico: proveedor sin datos de perfil aún
      roles: [],
      pfps: [],
    });

    const result = await getFullProfile("cristian");

    // Validamos que tu lógica de "social: { instagram: data.perfilProveedor?.instagram ?? null ... }" funcione
    expect(result?.user.social.instagram).toBeNull();
    expect(result?.user.social.linkedin).toBeNull();
    expect(result?.user.username).toBe("cristian");
  });

  test("Debería retornar null si el usuario no existe en la base de datos", async () => {
    (db.usuario.findUnique as any).mockResolvedValue(null);

    const result = await getFullProfile("usuario_fantasma");
    expect(result).toBeNull();
  });
});
