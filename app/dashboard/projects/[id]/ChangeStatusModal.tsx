"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProjectStatusAction } from "../actions";

type ActionState = { success?: boolean; error?: string } | null;

const estados = [
  { value: "planificado", label: "Planificado" },
  { value: "en curso", label: "En curso" },
  { value: "pausado", label: "Pausado" },
  { value: "completado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export default function ChangeStatusModal({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProjectStatusAction,
    null
  );

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  const label = (currentStatus || "planificado").replaceAll("_", " ");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 rounded-full bg-[#252525] text-[#e9d26a] text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-black transition-all active:scale-95 cursor-pointer"
        title="Cambiar estado"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#252525] uppercase tracking-tight">
                  Cambiar estado
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona el nuevo estado del proyecto.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              {state?.error && (
                <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
                  {state.error}
                </div>
              )}

              <input type="hidden" name="id_proyecto" value={projectId} />

              <select
                name="estado"
                className="styled-input"
                defaultValue={currentStatus || "planificado"}
                required
              >
                {estados.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-delete px-6 py-2 cursor-pointer"
                  disabled={pending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className={`btn-gold px-8 py-2 ${pending ? "opacity-60" : ""}`}
                >
                  {pending ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </form>

            {/* FUTURO: aquí quedaría un bloque para adjuntar contratos por estado */}
          </div>
        </div>
      )}
    </>
  );
}
