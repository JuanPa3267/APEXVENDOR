"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#252525] flex flex-col items-center justify-center p-6 text-center">
      <motion.h1
        layoutId="logo"
        className="text-6xl font-black text-white uppercase tracking-tighter mb-4"
      >
        Apex<span className="text-[#e9d26a]">Vendor</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 max-w-md mb-8 font-medium"
      >
        Sistema inteligente de gestión de licitaciones y análisis de proveedores
        impulsado por IA.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        <Link
          href="/login"
          className="bg-[#e9d26a] text-[#252525] px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-[#bba955] transition-all"
        >
          Iniciar Sesión
        </Link>
      </motion.div>

      <footer className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-[0.3em]">
        Apex Intelligence Terminal v2.5
      </footer>
    </div>
  );
}
