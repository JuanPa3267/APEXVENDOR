"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

interface Vendor {
  id_proveedor: string;
  nombre_legal: string | null;
  nombres_apellidos: string | null;
  score: number | null;
  usuario: {
    username: string | null;
    pfps: {
      image_base64: string | null;
    } | null;
  };
}

export default function RankingsClient({
  initialVendors,
}: {
  initialVendors: any[];
}) {
  const podium = useMemo(() => initialVendors.slice(0, 3), [initialVendors]);
  const rest = useMemo(() => initialVendors.slice(3, 10), [initialVendors]);

  // Reorder podium: 2nd, 1st, 3rd for visual balance
  const displayPodium = useMemo(() => {
    const p = [...podium];
    if (p.length < 2) return p;
    const reordered = [];
    if (p[1]) reordered.push({ ...p[1], position: 2 });
    if (p[0]) reordered.push({ ...p[0], position: 1 });
    if (p[2]) reordered.push({ ...p[2], position: 3 });
    return reordered;
  }, [podium]);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="mb-12">
        <h2 className="text-[#252525] font-black text-4xl uppercase tracking-tighter m-0 leading-none">
          TOP <span className="text-[#bba955]">10 VENDORS</span>
        </h2>
        <p className="text-gray-400 text-xs mt-3 uppercase tracking-widest font-bold">
          Ranking por desempeño y calificación
        </p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-20 px-4">
        {displayPodium.map((vendor, index) => {
          const isFirst = vendor.position === 1;
          const isSecond = vendor.position === 2;
          const isThird = vendor.position === 3;

          return (
            <motion.div
              key={vendor.id_proveedor}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col items-center w-full md:w-64 p-6 rounded-[2.5rem] border shadow-2xl transition-all
                ${isFirst ? "bg-[#252525] border-[#e9d26a] h-[380px] z-10 scale-105" : "bg-white border-white/60 h-[320px]"}
              `}
            >
              {/* Position Badge */}
              <div
                className={`absolute -top-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg
                ${isFirst ? "bg-[#e9d26a] text-[#252525]" : "bg-[#252525] text-[#e9d26a]"}
              `}
              >
                {vendor.position}
              </div>

              {/* Avatar */}
              <div
                className={`mt-4 w-24 h-24 rounded-full overflow-hidden border-4 shadow-inner mb-6
                ${isFirst ? "border-[#e9d26a]" : "border-gray-100"}
              `}
              >
                {vendor.usuario.pfps?.image_base64 ? (
                  <img
                    src={vendor.usuario.pfps.image_base64}
                    alt={vendor.usuario.username || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                    {vendor.usuario.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    href={`/dashboard/vendors/${vendor.usuario.username}`}
                    className="group/name"
                  >
                    <h3
                      className={`font-black text-lg tracking-tight uppercase leading-tight transition-colors
                      ${isFirst ? "text-white group-hover/name:text-[#e9d26a]" : "text-[#252525] group-hover/name:text-[#bba955]"}
                    `}
                    >
                      {vendor.nombre_legal ||
                        vendor.nombres_apellidos ||
                        vendor.usuario.username}
                    </h3>
                  </Link>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest mt-1
                    ${isFirst ? "text-[#e9d26a]" : "text-gray-400"}
                  `}
                  >
                    @{vendor.usuario.username}
                  </p>
                </div>

                <div className="mt-4">
                  <div
                    className={`text-3xl font-black
                    ${isFirst ? "text-[#e9d26a]" : "text-[#bba955]"}
                  `}
                  >
                    {vendor.score ? vendor.score.toFixed(1) : "0.0"}
                  </div>
                  <div
                    className={`text-[9px] font-black uppercase tracking-tighter
                    ${isFirst ? "text-gray-400" : "text-gray-300"}
                  `}
                  >
                    Score Final
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden mb-20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[#252525] font-black text-xl uppercase tracking-tighter">
            Ranking Completo
          </h3>
          <div className="px-4 py-1.5 bg-[#252525] text-[#e9d26a] rounded-full text-[10px] font-black uppercase tracking-widest">
            {initialVendors.length} Proveedores
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Puesto
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Proveedor
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rest.map((vendor, index) => (
                <motion.tr
                  key={vendor.id_proveedor}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/80 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl font-black text-xs bg-gray-50 text-gray-400">
                      {index + 4}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                        {vendor.usuario.pfps?.image_base64 ? (
                          <img
                            src={vendor.usuario.pfps.image_base64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                            {vendor.usuario.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/vendors/${vendor.usuario.username}`}
                          className="group/listlink"
                        >
                          <div className="font-black text-[#252525] tracking-tight group-hover/listlink:text-[#bba955] transition-colors">
                            {vendor.nombre_legal || vendor.nombres_apellidos}
                          </div>
                        </Link>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                          @{vendor.usuario.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="font-black text-2xl text-[#252525] tabular-nums tracking-tighter">
                      {vendor.score ? vendor.score.toFixed(1) : "0.0"}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
