"use client";

import { useActionState, useEffect, useState } from "react";
import { createProjectAction } from "./actions";

export default function ProjectCreateModal() {
    const [open, setOpen] = useState(false);
    const [state, formAction, pending] = useActionState(createProjectAction, null);

    // Cerrar modal si fue éxito
    useEffect(() => {
        if (state?.success) {
            setOpen(false);
        }
    }, [state?.success]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-5 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#e9d26a]/20 hover:bg-black transition-all active:scale-95 cursor-pointer"
            >
                + Nuevo Proyecto
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-[#252525] uppercase tracking-tight">
                                    Crear Proyecto
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Registra un proyecto para luego asignar proveedores.
                                </p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <form action={formAction} className="p-6 space-y-4">
                            {state?.error && (
                                <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl">
                                    {state.error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="cliente"
                                    placeholder="Cliente (obligatorio)"
                                    className="styled-input"
                                    required
                                />
                                <input
                                    name="nombre"
                                    placeholder="Nombre del proyecto (obligatorio)"
                                    className="styled-input"
                                    required
                                />
                            </div>

                            <textarea
                                name="descripcion"
                                placeholder="Descripción (opcional)"
                                className="styled-input"
                                rows={4}
                            />

                            <input
                                name="tecnologia_stack"
                                placeholder="Tecnología stack (opcional)"
                                className="styled-input"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Fecha de Inicio</label>
                                    <input
                                        name="inicio"
                                        type="date"
                                        className="styled-input w-full"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Fecha de Finalización</label>
                                    <input
                                        name="fin"
                                        type="date"
                                        className="styled-input w-full"
                                    />
                                </div>
                            </div>

                            <select name="estado" className="styled-input" defaultValue="planificado">
                                <option value="planificado">Planificado</option>
                                <option value="en curso">En curso</option>
                                <option value="pausado">Pausado</option>
                                <option value="completado">Completado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>

                            {/* Footer */}
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
                                    {pending ? "Creando..." : "Crear proyecto"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
