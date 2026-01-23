"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { createMetricAction } from "./actions";

export default function CreateMetricModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        const res = await createMetricAction(formData);

        if (res?.error) {
            setError(res.error);
            setIsLoading(false);
        } else {
            setIsModalOpen(false);
            setIsLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
                Métricas
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Crear Nueva Métrica"
            >
                <form action={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="nombre"
                            className="text-xs font-bold uppercase tracking-widest text-gray-500"
                        >
                            Nombre de la Métrica
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            required
                            placeholder="Ej: Cumplimiento de Plazos"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e9d26a] focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="notas"
                            className="text-xs font-bold uppercase tracking-widest text-gray-500"
                        >
                            Descripción
                        </label>
                        <textarea
                            name="notas"
                            id="notas"
                            rows={4}
                            placeholder="Describe en qué consiste esta métrica..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e9d26a] focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#252525] text-[#e9d26a] font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creando..." : "Crear Métrica"}
                    </button>
                </form>
            </Modal>
        </>
    );
}
