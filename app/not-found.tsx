import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e9d26a]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-8">
        {/* Número Gigante */}
        <h1 className="text-[150px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#e9d26a] to-[#8a7a30] drop-shadow-[0_0_30px_rgba(233,210,106,0.2)]">
          404
        </h1>

        <div className="space-y-4">
          <h2 className="text-2xl text-white font-bold uppercase tracking-[0.2em]">
            Página no encontrada
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            APEX Intelligence no encuentra la página que buscas.
          </p>
        </div>

        {/* Botón de Retorno */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#e9d26a] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(233,210,106,0.3)]"
        >
          Regresar a APEX
        </Link>
      </div>

      {/* Footer pequeño */}
      <div className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-widest">
        Apex System Error
      </div>
    </div>
  );
}
