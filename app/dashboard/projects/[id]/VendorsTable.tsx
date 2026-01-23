"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeVendorAction, assignVendorAction, updateProjectAssignmentAction } from "./actions";
import AssignVendorModal from "./AssignVendorModal";
import EditVendorAssignmentModal from "./EditVendorAssignmentModal";

type ActionState = { success?: boolean; error?: string } | null;

export default function VendorsTable({
  projectId,
  participants,
  providers,
}: {
  projectId: string;
  participants: any[];
  providers: any[];
}) {
  const router = useRouter();

  const [openAssign, setOpenAssign] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Estado para edición
  const [editingAssignment, setEditingAssignment] = useState<any>(null);

  const [removeState, removeAction, removePending] = useActionState<ActionState, FormData>(
    removeVendorAction,
    null
  );

  const handleAssigned = () => {
    setOpenAssign(false);
    router.refresh();
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 350);
  };

  const handleEdited = () => {
    setEditingAssignment(null);
    router.refresh();
  };

  // Botón reusable
  const AssignButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={() => setOpenAssign(true)}
      disabled={!providers?.length}
      className={`bg-[#252525] text-[#e9d26a] text-[10px] font-black px-5 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#e9d26a]/20 hover:bg-black transition-all active:scale-95 cursor-pointer disabled:opacity-60 ${className}`}
      title={!providers?.length ? "No hay proveedores disponibles para asignar" : "Asignar proveedor"}
    >
      + Asignar proveedor
    </button>
  );

  // Si no hay participantes: botón arriba + mensaje
  if (!participants?.length) {
    return (
      <div className="space-y-4">
        <AssignButton />

        <div className="text-gray-500 font-bold">
          Aún no hay proveedores asignados a este proyecto.
        </div>

        <AssignVendorModal
          open={openAssign}
          onClose={() => setOpenAssign(false)}
          onSuccess={handleAssigned}
          projectId={projectId}
          providers={providers}
          assignAction={assignVendorAction}
        />
      </div>
    );
  }

  // Si ya hay participantes: lista + botón al final (debajo del último)
  return (
    <div className="space-y-3">
      {removeState?.error && (
        <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
          {removeState.error}
        </div>
      )}

      {participants.map((x: any) => {
        const p = x.perfil_proveedor;
        const displayName = p?.nombres_apellidos || p?.nombre_legal || "Proveedor";
        const username = p?.usuario?.username || "—";

        return (
          <div
            key={x.id_participacion}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/50"
          >
            <div className="pr-3">
              <div className="font-black text-[#252525]">{displayName}</div>
              <div className="text-xs text-gray-500">
                @{username} • Rol: <strong>{x.rol_en_proyecto}</strong>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Inicio:{" "}
                {x.inicio ? new Date(x.inicio).toLocaleDateString("es-CO") : "—"} • Fin:{" "}
                {x.fin ? new Date(x.fin).toLocaleDateString("es-CO") : "—"}
              </div>

              {/* FUTURO: aquí iría gestión de contrato por proveedor (blob azure) */}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingAssignment(x)}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition-all"
              >
                Editar
              </button>

              <form action={removeAction}>
                <input type="hidden" name="id_proyecto" value={projectId} />
                <input type="hidden" name="id_participacion" value={x.id_participacion} />

                <button
                  type="submit"
                  disabled={removePending}
                  onClick={(e) => {
                    if (!confirm("¿Quitar este proveedor del proyecto?")) e.preventDefault();
                  }}
                  className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-red-600 text-white cursor-pointer hover:bg-red-700 active:scale-95 transition-all disabled:opacity-60"
                >
                  Quitar
                </button>
              </form>
            </div>
          </div>
        );
      })}

      {/* botón al final (como tu imagen) */}
      <div className="pt-2">
        <AssignButton />
      </div>

      <div ref={bottomRef} />

      <AssignVendorModal
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        onSuccess={handleAssigned}
        projectId={projectId}
        providers={providers}
        assignAction={assignVendorAction}
      />

      <EditVendorAssignmentModal
        open={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        onSuccess={handleEdited}
        assignment={editingAssignment}
        projectId={projectId}
        updateAction={updateProjectAssignmentAction}
      />
    </div>
  );
}

