"use client";

import Modal from "@/components/Modal";
import { useActionState, useEffect, useState } from "react";
import {
  deleteProjectAction,
  updateProjectAction,
  updateProjectStatusAction,
} from "./actions";

export default function ProjectActions({
  project,
  providers,
}: {
  project: any;
  providers: any[];
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [editState, editAction, editPending] = useActionState(
    updateProjectAction,
    null,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    updateProjectStatusAction,
    null,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteProjectAction,
    null,
  );

  useEffect(() => {
    if (editState?.success) setOpenEdit(false);
  }, [editState?.success]);

  useEffect(() => {
    if (statusState?.success) setOpenStatus(false);
  }, [statusState?.success]);

  // delete: si success, el page.tsx normalmente redirige? aquí no, así que lo dejamos (server hará revalidate)
  // tú podrás hacer redirect desde server action más adelante si quieres.

  const fmtDate = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  return (
    <>
      <div className="flex flex-row flex-nowrap gap-2 justify-end items-center w-full">
        <button
          onClick={() => setOpenEdit(true)}
          className="flex-none whitespace-nowrap bg-white text-[#252525] text-[10px] font-black px-4 py-3 rounded-2xl uppercase tracking-tighter shadow-sm border border-gray-200 hover:border-[#e9d26a]/60 hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Editar
        </button>

        <button
          onClick={() => setOpenDelete(true)}
          className="flex-none whitespace-nowrap bg-[#EB2328] text-white text-[10px] font-black px-4 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#FF695E] hover:bg-[#FF3C39] transition-all active:scale-95 cursor-pointer"
        >
          Eliminar
        </button>
      </div>

      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Editar Proyecto"
      >
        <form action={editAction} className="space-y-4">
          {editState?.error && (
            <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
              {editState.error}
            </div>
          )}

          <input type="hidden" name="id_proyecto" value={project.id_proyecto} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="cliente"
              className="styled-input"
              defaultValue={project.cliente || ""}
              placeholder="Cliente"
              required
            />
            <input
              name="nombre"
              className="styled-input"
              defaultValue={project.nombre || ""}
              placeholder="Nombre del proyecto"
              required
            />
          </div>

          <textarea
            name="descripcion"
            className="styled-input"
            defaultValue={project.descripcion || ""}
            placeholder="Descripción"
            rows={4}
          />

          <input
            name="tecnologia_stack"
            className="styled-input"
            defaultValue={project.tecnologia_stack || ""}
            placeholder="Tecnología stack"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                Fecha de Inicio (obligatoria)
              </label>
              <input
                name="inicio"
                type="date"
                className="styled-input w-full"
                defaultValue={fmtDate(project.inicio)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                Fecha de Finalización
              </label>
              <input
                name="fin"
                type="date"
                className="styled-input w-full"
                defaultValue={fmtDate(project.fin)}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpenEdit(false)}
              className="btn-delete px-6 py-2 cursor-pointer"
              disabled={editPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editPending}
              className={`btn-gold px-8 py-2 ${editPending ? "opacity-60" : ""}`}
            >
              {editPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={openStatus}
        onClose={() => setOpenStatus(false)}
        title="Cambiar Estado"
      >
        <form action={statusAction} className="p-6 space-y-4">
          {statusState?.error && (
            <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
              {statusState.error}
            </div>
          )}

          <input type="hidden" name="id_proyecto" value={project.id_proyecto} />

          <select
            name="estado"
            className="styled-input"
            defaultValue={project.estado || "planificado"}
          >
            <option value="planificado">Planificado</option>
            <option value="en curso">En curso</option>
            <option value="pausado">Pausado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpenStatus(false)}
              className="btn-delete px-6 py-2 cursor-pointer"
              disabled={statusPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={statusPending}
              className={`btn-gold px-8 py-2 ${statusPending ? "opacity-60" : ""}`}
            >
              {statusPending ? "Aplicando..." : "Actualizar estado"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Eliminar Proyecto"
      >
        <form action={deleteAction} className="space-y-4">
          {deleteState?.error && (
            <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
              {deleteState.error}
            </div>
          )}

          <input type="hidden" name="id_proyecto" value={project.id_proyecto} />

          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-sm text-red-700">
            ¿Seguro que deseas eliminar el proyecto{" "}
            <strong>{project.nombre}</strong>? Esta acción no se puede deshacer.
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpenDelete(false)}
              className="btn-delete px-6 py-2 cursor-pointer"
              disabled={deletePending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={deletePending}
              className={`bg-[#EB2328] text-white text-[10px] font-black px-8 py-2 rounded-full uppercase tracking-widest shadow-lg hover:bg-[#FF3C39] active:scale-95 cursor-pointer ${
                deletePending ? "opacity-60" : ""
              }`}
            >
              {deletePending ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
