"use client";

import { useState, useTransition } from "react";
import Modal from "@/components/Modal";
import { createMetricAction, deleteMetricAction } from "./actions";

interface GenericMetric {
    id_metrica: string;
    nombre: string;
    notas: string | null;
}

interface CreateMetricModalProps {
    initialMetrics?: GenericMetric[];
}

export default function CreateMetricModal({
    initialMetrics = [],
}: CreateMetricModalProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        setError("");

        startTransition(async () => {
            const res = await createMetricAction(formData);
            if (res?.error) {
                setError(res.error);
            } else {
                setIsModalOpen(false);
            }
        });
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Estás seguro de eliminar esta métrica?")) return;

        startTransition(async () => {
            const res = await deleteMetricAction(id);
            if (res?.error) {
                setError(res.error);
            }
        });
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer bg-[#252525] text-[#e9d26a] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-md hover:scale-105 transition-transform"
            >
                Métricas
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Crear Nueva Métrica" // Hacemos el modal más angosto
            >
                <div className="space-y-6"> {/* Menos espaciado vertical */}
                    <form action={handleSubmit} className="flex flex-col gap-4"> {/* Menos gap en el form */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="nombre"
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-500" // Fuente más pequeña
                            >
                                Nombre de la Métrica
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                id="nombre"
                                required
                                placeholder="Ej: Cumplimiento"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#e9d26a] focus:border-transparent transition-all" // Inputs más compactos
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="notas"
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-500"
                            >
                                Descripción
                            </label>
                            <textarea
                                name="notas"
                                id="notas"
                                rows={3} // Menos filas por defecto
                                placeholder="Descripción breve..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#e9d26a] focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        {error && (
                            <div className="p-2 bg-red-50 text-red-500 text-[10px] font-bold rounded-md border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#252525] text-[#e9d26a] font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? "Procesando..." : "Crear Métrica"}
                        </button>
                    </form>

                    {/* Listado de Métricas */}
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-xs font-black text-[#252525] uppercase tracking-tighter mb-3">
                            Métricas Existentes
                        </h3>

                        {initialMetrics.length === 0 ? (
                            <p className="text-gray-400 text-[10px] text-center py-2">
                                No hay métricas creadas aún.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1"> {/* Scroll interno limitado para la lista */}
                                {initialMetrics.map((metric) => (
                                    <div
                                        key={metric.id_metrica}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
                                    >
                                        <div className="min-w-0"> {/* min-w-0 para que el truncado funcione flex */}
                                            <h4 className="font-bold text-[#252525] text-xs truncate">{metric.nombre}</h4>
                                            {metric.notas && (
                                                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 truncate">{metric.notas}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(metric.id_metrica)}
                                            disabled={isPending}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 ml-2 shrink-0"
                                            title="Eliminar métrica"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
