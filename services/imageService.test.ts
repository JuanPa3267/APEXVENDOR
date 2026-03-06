import { db } from "@/lib/db";
import { describe, expect, mock, spyOn, test } from "bun:test";
import { imageService } from "./imageService";

// 1. Mockeamos el modelo pfps de Prisma
mock.module("@/lib/db", () => ({
  db: {
    pfps: {
      upsert: mock(() =>
        Promise.resolve({ username: "cris", image_base64: "base64_data" }),
      ),
      findUnique: mock(() => Promise.resolve(null)),
    },
  },
}));

describe("Image Service - Gestión de Avatares (Caja Blanca)", () => {
  test("TC-CB-35: setProfileImage debería ejecutar un upsert con el username", async () => {
    const username = "cristian.gomez";
    const mockBase64 = "data:image/png;base64,mock_data";

    const upsertSpy = spyOn(db.pfps, "upsert").mockResolvedValue({
      username,
      image_base64: mockBase64,
    } as any);

    await imageService.setProfileImage(username, mockBase64);

    // Validamos que se use el username como llave única
    expect(upsertSpy).toHaveBeenCalledWith({
      where: { username: username },
      update: { image_base64: mockBase64 },
      create: { username: username, image_base64: mockBase64 },
    });
  });

  test("TC-CB-36: getProfileImage debería retornar null si el usuario no tiene foto", async () => {
    // Simulamos que findUnique no encuentra nada
    (db.pfps.findUnique as any).mockResolvedValue(null);

    const image = await imageService.getProfileImage("usuario_sin_foto");
    expect(image).toBeNull();
  });

  test("TC-CB-37: getProfileImage debería retornar la cadena Base64 si existe", async () => {
    const mockBase64 = "data:image/jpeg;base64,real_data";
    (db.pfps.findUnique as any).mockResolvedValue({ image_base64: mockBase64 });

    const image = await imageService.getProfileImage("cris");
    expect(image).toBe(mockBase64);
  });
});
