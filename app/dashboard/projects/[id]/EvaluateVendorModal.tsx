"use client";

import { useEffect, useState, useActionState, useTransition } from "react";
import Modal from "@/components/Modal";
import { saveEvaluationAction } from "./actions";

interface Metric {
    id_metrica: string;
    nombre: string;
    notas: string | null;
}

interface EvaluateVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    participationId: string;
    evaluatorId: string; // ID del usuario admin
    metrics: Metric[];
}

export default function EvaluateVendorModal({
    isOpen,
    onClose,
    participationId,
    evaluatorId,
    metrics,
}: EvaluateVendorModalProps) {
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const handleRating = (metricId: string, value: number) => {
        setRatings((prev) => ({ ...prev, [metricId]: value }));
    };

    async function handleSubmit(formData: FormData) {
        setError("");
        // Validar que todas las métricas tengan calificación
        const missingMetrics = metrics.filter((m) => !ratings[m.id_metrica]);
        if (missingMetrics.length > 0) {
            setError(`Falta calificar: ${missingMetrics.map(m => m.nombre).join(", ")}`);
            return;
        }

        startTransition(async () => {
            const res = await saveEvaluationAction(null, formData);
            if (res?.error) {
                setError(res.error);
            } else if (res?.success) {
                onClose();
                // Reset state
                setRatings({});
            }
        });
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Evaluar Proveedor"
        >
            <form action={handleSubmit} className="space-y-8">
                <input type="hidden" name="id_participacion" value={participationId} />
                <input type="hidden" name="id_evaluador" value={evaluatorId} />

                {/* Métricas */}
                <div className="grid grid-cols-1 gap-6">
                    {metrics.map((metric) => (
                        <div
                            key={metric.id_metrica}
                            className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-[#252525] uppercase text-xs tracking-wider">
                                        {metric.nombre}
                                    </h4>
                                    {metric.notas && (
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {metric.notas}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRating(metric.id_metrica, star)}
                                            className={`text-2xl transition-transform hover:scale-110 ${(ratings[metric.id_metrica] || 0) >= star
                                                    ? "text-[#e9d26a]"
                                                    : "text-gray-300"
                                                }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <input
                                        type="hidden"
                                        name={`metric_${metric.id_metrica}`}
                                        value={ratings[metric.id_metrica] || 0}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comentario */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#252525]">
                        Comentario Cualitativo
                    </label>
                    <textarea
                        name="comentario"
                        rows={4}
                        required
                        placeholder="Escribe tu evaluación detallada aquí..."
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
                    disabled={isPending}
                    className="w-full bg-[#252525] text-[#e9d26a] font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {isPending ? "Guardando Evaluación..." : "Guardar Evaluación"}
                </button>
            </form>
        </Modal>
    );
}
