"use client";

import Modal from "@/components/Modal";
import { useActionState, useEffect } from "react";

type ActionState = { success?: boolean; error?: string } | null;

export default function EditVendorAssignmentModal({
  open,
  onClose,
  onSuccess,
  assignment,
  projectId,
  updateAction,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  assignment: any;
  projectId: string;
  updateAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onClose();
      onSuccess?.();
    }
  }, [state?.success, onClose, onSuccess]);

  if (!assignment) return null;

  const p = assignment.perfil_proveedor;
  const name = p?.nombres_apellidos || p?.nombre_legal || "Proveedor";
  const username = p?.usuario?.username || "";

  // Convertir fechas para el input date (YYYY-MM-DD)
  const inicioStr = assignment.inicio
    ? new Date(assignment.inicio).toISOString().split("T")[0]
    : "";
  const finStr = assignment.fin
    ? new Date(assignment.fin).toISOString().split("T")[0]
    : "";

  return (
    <Modal isOpen={open} onClose={onClose} title="Editar Asignación">
      <form action={formAction} className="space-y-4">
        <div className="text-xs text-gray-500 -mt-2 mb-4">
          {name} (@{username})
        </div>

        {state?.error && (
          <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
            {state.error}
          </div>
        )}

        <input type="hidden" name="id_proyecto" value={projectId} />
        <input
          type="hidden"
          name="id_participacion"
          value={assignment.id_participacion}
        />

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
            Rol en el proyecto
          </label>
          <input
            name="rol_en_proyecto"
            defaultValue={assignment.rol_en_proyecto}
            placeholder="Rol en el proyecto"
            className="styled-input"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
              Inicio participación
            </label>
            <input
              name="inicio"
              type="date"
              className="styled-input w-full"
              defaultValue={inicioStr}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
              Fin participación
            </label>
            <input
              name="fin"
              type="date"
              className="styled-input w-full"
              defaultValue={finStr}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
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
            {pending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
