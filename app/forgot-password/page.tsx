"use client";

import { useActionState, useState } from "react";
import { requestPasswordResetAction } from "./actions";

export default function ForgotPasswordPage() {
    const [state, formAction, pending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await requestPasswordResetAction(formData);
            return result as { error?: string; success?: boolean };
        },
        null as { error?: string; success?: boolean } | null
    );

    return (
        <div className="flex items-center justify-center min-h-screen py-10 px-4">
            <div className="form_div max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-black text-[#252525] tracking-tighter uppercase leading-none mb-2">
                        Recuperar Contraseña
                    </h2>
                    <div className="h-1.5 w-12 bg-[#e9d26a] mx-auto mt-2 rounded-full mb-4" />
                    <p className="text-sm text-gray-500 font-medium">
                        Ingresa tu correo electrónico asociado a la cuenta y te enviaremos un enlace temporal para crear una nueva contraseña.
                    </p>
                </div>

                {state?.success ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center shadow-sm">
                        <div className="text-4xl mb-4">📧</div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Revisa tu bandeja de entrada</h3>
                        <p className="text-sm">
                            Si el correo ingresado está registrado en nuestro sistema, recibirás un enlace válido por 10 minutos para cambiar tu contraseña.
                        </p>
                        <a href="/login" className="inline-block mt-6 px-6 py-2 bg-[#252525] text-[#e9d26a] rounded-full text-xs font-black uppercase tracking-widest hover:bg-black transition cursor-pointer">
                            Volver al inicio de sesión
                        </a>
                    </div>
                ) : (
                    <form action={formAction} className="flex flex-col gap-5">
                        {state?.error && (
                            <div className="error text-sm mb-2">{state.error}</div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@correo.com"
                                className="styled-input"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={pending}
                            className={`btn-gold mt-2 py-3 w-full shadow-lg ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {pending ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                        </button>

                        <div className="mt-4 text-center">
                            <a href="/login" className="text-sm text-[#bba955] font-bold hover:underline">
                                Volver al inicio de sesión
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
