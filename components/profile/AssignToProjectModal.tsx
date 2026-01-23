"use client";

import { useActionState, useEffect } from "react";

type ActionState = { success?: boolean; error?: string } | null;

export default function AssignToProjectModal({
    open,
    onClose,
    onSuccess,
    userId,
    availableProjects = [],
    assignAction,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userId: string;
    availableProjects?: any[];
    assignAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
    const [state, formAction, pending] = useActionState<ActionState, FormData>(
        assignAction,
        null
    );

    useEffect(() => {
        if (state?.success) {
            onClose();
            onSuccess?.();
            // Reset form if needed, but the component unmounts usually
        }
    }, [state?.success, onClose, onSuccess]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-[#252525] uppercase tracking-tight">
                            Asignar Proyecto
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona un proyecto activo para asignar a este proveedor.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
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

                    <input type="hidden" name="id_proveedor" value={userId} />
                    <input type="hidden" name="currentPath" value={window.location.pathname} />

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                            Proyecto
                        </label>
                        <select name="id_proyecto" className="styled-input" required>
                            <option value="">Selecciona un proyecto...</option>
                            {availableProjects.map((p: any) => (
                                <option key={p.id_proyecto} value={p.id_proyecto}>
                                    {p.nombre} — {p.cliente} ({p.estado})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                            Rol en el proyecto
                        </label>
                        <input
                            name="rol_en_proyecto"
                            placeholder="Rol en el proyecto (ej: Backend, Infra...)"
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
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                                Fin participación (opcional)
                            </label>
                            <input
                                name="fin"
                                type="date"
                                className="styled-input w-full"
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
                            {pending ? "Asignando..." : "Asignar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
