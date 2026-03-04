"use client";

import { useState } from "react";
import Modal from "./Modal";
import { updatePasswordAction } from "@/app/dashboard/profile/actions";

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpdatePasswordModal({ isOpen, onClose }: UpdatePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (newPassword.length < 8) {
            setError("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);
        const result = await updatePasswordAction(currentPassword, newPassword);
        setIsSubmitting(false);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Actualizar Contraseña">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {error && (
                    <div className="bg-red-500/10 text-red-500 text-sm font-bold p-4 rounded-xl border border-red-500/20">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 text-green-500 text-sm font-bold p-4 rounded-xl border border-green-500/20">
                        Contraseña actualizada exitosamente.
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Contraseña Actual
                    </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-[#fcfcfc] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-[#252525] outline-none focus:border-[#e9d26a] transition-all"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Nueva Contraseña
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-[#fcfcfc] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-[#252525] outline-none focus:border-[#e9d26a] transition-all"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Confirmar Contraseña
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-[#fcfcfc] border border-gray-100 rounded-2xl p-4 text-sm font-bold text-[#252525] outline-none focus:border-[#e9d26a] transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`mt-4 bg-[#e9d26a] text-[#252525] font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[#d8c159] transition-colors ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {isSubmitting ? "Actualizando..." : "Guardar Cambios"}
                </button>
            </form>
        </Modal>
    );
}
