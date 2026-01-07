// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#252525] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">
        Apex<span className="text-[#e9d26a]">Vendor</span>
      </h1>
      <p className="text-gray-400 max-w-md mb-8 font-medium">
        Sistema inteligente de gestión de licitaciones y análisis de proveedores
        impulsado por IA.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-[#e9d26a] text-[#252525] px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-[#bba955] transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>

      <footer className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-[0.3em]">
        Apex Intelligence Terminal v2.5
      </footer>
    </div>
  );
}
