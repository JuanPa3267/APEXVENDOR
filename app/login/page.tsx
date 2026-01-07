"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  // useActionState recibe (acción, estadoInicial)
  // Devuelve [estadoActual, disparadorDeAcción, esPendiente]
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="form_div">
        {" "}
        {/* Clase de tu CSS original */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-[#252525] tracking-tighter uppercase">
            ApexVendor
          </h2>
          <div className="h-1.5 w-16 bg-[#e9d26a] mx-auto mt-2 rounded-full"></div>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && <div className="error">{state.error}</div>}

          <input
            name="username"
            type="text"
            placeholder="Username"
            className="styled-input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="styled-input"
            required
          />

          <button
            type="submit"
            disabled={pending}
            className={`btn-gold mt-2 ${
              pending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {pending ? "Cargando..." : "Log In"}
          </button>
        </form>
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">¿No tienes una cuenta?</span>{" "}
          <a
            href="/register"
            className="text-[#bba955] font-bold hover:underline"
          >
            Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
}
