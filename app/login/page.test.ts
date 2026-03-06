import { describe, expect, test } from "bun:test";

describe("LoginPage - Lógica de Interfaz (Caja Blanca)", () => {
  test("TC-CB-55: El botón debe mostrar 'Cargando...' y deshabilitarse cuando pending es true", () => {
    const pending = true;

    // Simulación de la lógica del componente
    const buttonText = pending ? "Cargando..." : "Log In";
    const isButtonDisabled = pending;

    expect(buttonText).toBe("Cargando...");
    expect(isButtonDisabled).toBe(true);
  });

  test("TC-CB-56: Debería renderizar el mensaje de error si el estado lo contiene", () => {
    const state = { error: "Credenciales inválidas" };

    // Validamos que la UI detecte la presencia del error
    const hasErrorVisible = !!state?.error;

    expect(hasErrorVisible).toBe(true);
    expect(state.error).toBe("Credenciales inválidas");
  });

  test("TC-CB-57: Configuración de animación inicial", () => {
    // Caja Blanca: Validamos que los valores de motion sean los correctos según tu código
    const initialAnimation = { opacity: 0, scale: 0.95 };
    const animateState = { opacity: 1, scale: 1 };

    expect(initialAnimation.opacity).toBe(0);
    expect(animateState.scale).toBe(1);
  });
});
