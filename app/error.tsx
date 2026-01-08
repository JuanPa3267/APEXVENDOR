"use client"; // Es obligatorio para error boundaries

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podrías enviar el error a un servicio de log como Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Luz roja sutil de alerta en el fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-lg w-full bg-[#1a1a1a] border border-[#333] p-12 rounded-[2rem] shadow-2xl">
        {/* Icono de Alerta */}
        <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="text-3xl text-white font-black uppercase tracking-tighter mb-2">
          Error del Sistema
        </h2>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          APEX Intelligence ha detectado una anomalía crítica en el proceso. El
          sistema de seguridad ha detenido la ejecución.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Botón Reintentar */}
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#e9d26a] text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(233,210,106,0.2)]"
          >
            Reintentar Proceso
          </button>

          {/* Botón Contacto/Salir */}
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-transparent border border-gray-700 text-gray-300 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:border-[#e9d26a] hover:text-[#e9d26a] transition-all"
          >
            Volver a APEX
          </button>
        </div>

        {/* Código de error técnico (opcional para depuración) */}
        {error.digest && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-[9px] font-mono text-gray-600">
              Digest Code: <span className="text-red-900">{error.digest}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
