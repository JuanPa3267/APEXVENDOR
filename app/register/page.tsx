"use client";

import { useActionState, useState } from "react";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [tipo, setTipo] = useState("Persona");
  // state recibe el objeto { error: string } desde la action
  const [state, formAction, pending] = useActionState(registerAction, null);

  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4">
      <div className="form_div max-w-lg">
        {" "}
        {/* Clase de tu CSS original */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#252525] tracking-tighter uppercase">
            Registro
          </h2>
          <div className="h-1.5 w-12 bg-[#e9d26a] mx-auto mt-2 rounded-full"></div>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          {/* Mostrar error si la action lo devuelve */}
          {state?.error && (
            <div className="error text-sm mb-2">{state.error}</div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
              Datos Personales
            </label>
            <input
              name="name"
              placeholder="Nombre completo o Razón Social"
              className="styled-input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="correo"
              type="email"
              placeholder="Correo electrónico"
              className="styled-input"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              className="styled-input"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
              Tipo de Perfil
            </label>
            <select
              name="tipo_proveedor"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="styled-input"
            >
              <option value="Persona">Persona Natural</option>
              <option value="Empresa">Empresa</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                Identificación
              </label>
              <input
                name="nit"
                placeholder="NIT / Cédula"
                className="styled-input"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
                Ubicación
              </label>
              <input
                name="city"
                placeholder="Ciudad"
                className="styled-input"
                required
              />
            </div>
          </div>

          {/* Campo oculto por defecto para admin, a menos que quieras activarlo manualmente */}
          <input type="hidden" name="is_admin" value="false" />

          <button
            type="submit"
            disabled={pending}
            className={`btn-gold mt-4 py-3 ${
              pending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {pending ? "Creando cuenta..." : "Registrarse Ahora"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">¿Ya tienes cuenta?</span>{" "}
          <a href="/login" className="text-[#bba955] font-bold hover:underline">
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}
