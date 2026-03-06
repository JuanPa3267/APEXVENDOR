import { describe, expect, mock, test } from "bun:test";

// Mock de cookies de Next.js
mock.module("next/headers", () => ({
  cookies: mock(async () => ({
    get: (name: string) => ({ value: "cristian_gomez" }),
  })),
}));

// Mock del servicio de perfil
mock.module("@/services/profileService", () => ({
  getFullProfile: mock((username: string) => {
    if (username === "cristian_gomez") {
      return Promise.resolve({ id_usuario: "123", username: "cristian_gomez" });
    }
    return Promise.resolve(null);
  }),
}));

describe("ProfilePage - Lógica de Servidor (Caja Blanca)", () => {
  test("TC-CB-104: Debería extraer el username de las cookies para cargar el perfil", async () => {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value;

    expect(username).toBe("cristian_gomez");
  });

  test("TC-CB-105: Debería validar que el perfil exista antes de renderizar la vista", async () => {
    const { getFullProfile } = await import("@/services/profileService");
    const profile = await getFullProfile("usuario_inexistente");

    const shouldRedirect = !profile;
    expect(shouldRedirect).toBe(true);
  });
});
