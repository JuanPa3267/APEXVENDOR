"use client";

import { useActionState, useEffect, useState } from "react";
import { resetPasswordAction } from "./actions";

export default function ResetPasswordPage() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Obtenemos el token de la URL de forma segura en el cliente
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get("token");
        setToken(tokenParam);
    }, []);

    const [state, formAction, pending] = useActionState(
        async (prevState: any, formData: FormData) => {
            if (!token) {
                return { error: "Token de recuperación inválido." };
            }
            formData.append("token", token);
            const result = await resetPasswordAction(formData);
            return result as { error?: string; success?: boolean };
        },
        null as { error?: string; success?: boolean } | null
    );

    return (
        <div className="flex items-center justify-center min-h-screen py-10 px-4">
            <div className="form_div max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-[#252525] tracking-tighter uppercase leading-none mb-2">
                        Restablecer Contraseña
                    </h2>
                    <div className="h-1.5 w-12 bg-[#e9d26a] mx-auto mt-2 rounded-full mb-4" />
                    <p className="text-sm text-gray-500 font-medium">
                        Ingresa tu nueva contraseña para acceder a tu cuenta en ApexVendor.
                    </p>
                </div>

                {state?.success ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center shadow-sm">
                        <div className="text-4xl mb-4">✅</div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">¡Contraseña actualizada!</h3>
                        <p className="text-sm">
                            Tu contraseña ha sido cambiada exitosamente. Ya puedes acceder con ella.
                        </p>
                        <a href="/login" className="inline-block mt-6 px-6 py-2 bg-[#252525] text-[#e9d26a] rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition cursor-pointer">
                            Ir al inicio de sesión
                        </a>
                    </div>
                ) : !token && token !== null ? (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Error de Enlace</h3>
                        <p className="text-sm">El enlace de recuperación es inválido o no contiene un token válido.</p>
                    </div>
                ) : (
                    <form action={formAction} className="flex flex-col gap-5">
                        {state?.error && (
                            <div className="error text-sm mb-2">{state.error}</div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">
                                Nueva Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="********"
                                className="styled-input"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirm" className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirm"
                                name="confirm"
                                type="password"
                                placeholder="********"
                                className="styled-input"
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={pending}
                            className={`btn-gold mt-2 py-3 w-full shadow-lg ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {pending ? "Guardando..." : "Cambiar Contraseña"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
