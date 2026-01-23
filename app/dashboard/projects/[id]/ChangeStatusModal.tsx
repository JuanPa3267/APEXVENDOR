"use client";

import Modal from "@/components/Modal";

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
    null,
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

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Cambiar estado"
      >
        <form action={formAction} className="space-y-4">
          <p className="text-xs text-gray-500 mb-4">
            Selecciona el nuevo estado del proyecto.
          </p>

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
      </Modal>
    </>
  );
}
