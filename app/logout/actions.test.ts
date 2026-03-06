import { describe, expect, mock, spyOn, test } from "bun:test";
import { logoutAction } from "./actions";

// 1. Creamos un objeto de cookies manual que podamos controlar
const mockCookieStore = {
  delete: mock(() => {}),
};

// 2. Mockeamos los módulos de Next.js
mock.module("next/headers", () => ({
  cookies: mock(() => Promise.resolve(mockCookieStore)),
}));

mock.module("next/navigation", () => ({
  redirect: mock((url: string) => {
    // En Next.js, redirect lanza un error para detener la ejecución
    const error = new Error("NEXT_REDIRECT");
    (error as any).digest = `NEXT_REDIRECT;${url}`;
    throw error;
  }),
}));

describe("Logout Action - Seguridad de Sesión (Caja Blanca)", () => {
  test("TC-CB-47: Debería eliminar las cookies críticas de sesión y usuario", async () => {
    const { redirect } = await import("next/navigation");

    // Espiamos directamente nuestro objeto manual
    const deleteSpy = spyOn(mockCookieStore, "delete");

    try {
      await logoutAction();
    } catch (e: any) {
      // Si no es un error de redirección, lanzamos el error original
      if (!e.message?.includes("NEXT_REDIRECT")) throw e;
    }

    // Validamos que se eliminen las cookies exactas de tu archivo actions.ts
    expect(deleteSpy).toHaveBeenCalledWith("session_id");
    expect(deleteSpy).toHaveBeenCalledWith("username");

    // Validamos la redirección
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
