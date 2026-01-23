"use client";

import { useActionState, useEffect, useState } from "react";

type ActionState = { success?: boolean; error?: string } | null;

export default function AssignVendorModal({
    open,
    onClose,
    onSuccess,
    projectId,
    providers,
    assignAction,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    projectId: string;
    providers: any[];
    assignAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
    const [state, formAction, pending] = useActionState<ActionState, FormData>(
        assignAction,
        null
    );

    const [search, setSearch] = useState("");
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setSearch("");
            setSelectedVendor(null);
            setShowSuggestions(false);
        }
    }, [open]);

    const filteredProviders = providers.filter((p: any) => {
        const term = search.toLowerCase();
        const name = (p.nombres_apellidos || p.nombre_legal || "").toLowerCase();
        const username = (p.usuario?.username || "").toLowerCase();
        return name.includes(term) || username.includes(term);
    });

    useEffect(() => {
        if (state?.success) {
            onClose();
            onSuccess?.();
        }
    }, [state?.success, onClose, onSuccess]);


    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-[#252525] uppercase tracking-tight">
                            Asignar Proveedor
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona un proveedor y define su rol en el proyecto.
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

                    <input type="hidden" name="id_proyecto" value={projectId} />

                    <input type="hidden" name="id_proveedor" value={selectedVendor?.id_proveedor || ""} />

                    <div className="relative">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2 mb-1 block">
                            Buscar Proveedor
                        </label>
                        {!selectedVendor ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Escribe para buscar proveedor..."
                                    className="styled-input w-full"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {showSuggestions && search.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {filteredProviders.length === 0 ? (
                                            <div className="p-3 text-xs text-gray-500 text-center">
                                                No se encontraron resultados
                                            </div>
                                        ) : (
                                            filteredProviders.map((p: any) => (
                                                <div
                                                    key={p.id_proveedor}
                                                    onClick={() => {
                                                        setSelectedVendor(p);
                                                        setSearch("");
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                                >
                                                    <div className="font-bold text-[#252525] text-sm">
                                                        {p.nombres_apellidos || p.nombre_legal}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                        @{p.usuario?.username}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-[#fafae6] border border-[#e9d26a] rounded-xl">
                                <div>
                                    <div className="font-bold text-[#252525]">
                                        {selectedVendor.nombres_apellidos || selectedVendor.nombre_legal}
                                    </div>
                                    <div className="text-[10px] text-[#bba955] uppercase tracking-wider">
                                        @{selectedVendor.usuario?.username}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedVendor(null)}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-widest px-2"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    <input
                        name="rol_en_proyecto"
                        placeholder="Rol en el proyecto (ej: Backend, Infra, QA...)"
                        className="styled-input"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                                Inicio participación (opcional)
                            </label>
                            <input name="inicio" type="date" className="styled-input w-full" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">
                                Fin participación (opcional)
                            </label>
                            <input name="fin" type="date" className="styled-input w-full" />
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
