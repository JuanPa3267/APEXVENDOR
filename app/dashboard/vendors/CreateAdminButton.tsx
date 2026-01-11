"use client";

import { useState } from "react";
import { createAdminAction } from "./actions";

export default function CreateAdminButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      {/* Botón al lado del total */}
      <button
        onClick={() => setOpen(true)}
        className="bg-[#e9d26a] text-[#252525] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#e9d26a]/30 hover:brightness-95 active:scale-95 transition cursor-pointer"
      >
        + Admin
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !loading && setOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[#fafae6] rounded-[2rem] shadow-2xl border border-black/10 p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-[#252525] font-black text-xl uppercase tracking-tighter">
                  Crear Administrador
                </h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                  Se creará una cuenta con rol Admin
                </p>
              </div>

              <button
                onClick={() => !loading && setOpen(false)}
                className="text-gray-400 hover:text-black font-black text-xl leading-none cursor-pointer"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form
              action={async (formData) => {
                setLoading(true);
                const res = await createAdminAction(formData);
                setLoading(false);

                if (res?.error) return alert(res.error);

                alert("✅ Administrador creado correctamente");
                setOpen(false);
              }}
              className="space-y-4"
            >
              <input
                name="nombre"
                className="styled-input"
                placeholder="Nombre completo"
                required
              />
              <input
                name="correo"
                type="email"
                className="styled-input"
                placeholder="Correo"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="password"
                  type="password"
                  className="styled-input"
                  placeholder="Contraseña"
                  required
                />
                <input
                  name="confirm"
                  type="password"
                  className="styled-input"
                  placeholder="Confirmar"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !loading && setOpen(false)}
                  className="bg-white/60 text-[#252525] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter border border-black/10 hover:bg-white transition cursor-pointer"
                  disabled={loading}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-[#252525] text-[#e9d26a] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter shadow-xl hover:bg-black transition cursor-pointer ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
