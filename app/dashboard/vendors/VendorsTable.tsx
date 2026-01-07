"use client";

import Link from "next/link";
import { useState } from "react";

export default function VendorsTable({
  initialVendors,
}: {
  initialVendors: any[];
}) {
  const [query, setQuery] = useState("");

  // Filtrado ultra-seguro
  const filtered = initialVendors.filter((v) => {
    const lowQuery = query.toLowerCase();
    const name = (v?.nombres_apellidos || "").toLowerCase();
    const nit = (v?.identificacion_nit || "").toLowerCase();
    const user = (v?.usuario?.username || "").toLowerCase();
    return (
      name.includes(lowQuery) ||
      nit.includes(lowQuery) ||
      user.includes(lowQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="relative max-w-md group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-xl">
          🔍
        </div>
        <input
          type="text"
          placeholder="Buscar proveedor..."
          className="styled-input pl-12 py-4 bg-white shadow-sm border-gray-200 focus:border-[#e9d26a] w-full"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#252525] text-[#e9d26a] text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Proveedor / Usuario</th>
                <th className="px-8 py-6">NIT</th>
                <th className="px-8 py-6">Ciudad</th>
                <th className="px-8 py-6">Score</th>
                <th className="px-8 py-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v, index) => (
                <tr
                  key={v.id_perfil_p || v.usuario?.username || index}
                  className="hover:bg-gray-50/80 transition-all"
                >
                  {/* Celda de Nombre y Username */}
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#252525] text-base">
                        {v.nombres_apellidos || "Nombre no disponible"}
                      </span>
                      <span className="text-[10px] text-[#bba955] font-black uppercase tracking-tighter">
                        @{v.usuario?.username || "sin-usuario"}
                      </span>
                    </div>
                  </td>

                  {/* Celda de NIT */}
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {v.identificacion_nit || "N/A"}
                    </span>
                  </td>

                  {/* Celda de Ciudad */}
                  <td className="px-8 py-5 text-gray-600 font-semibold text-sm">
                    {v.ciudad || "No especificada"}
                  </td>

                  {/* Celda de Score con Barra */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#252525]">
                        {typeof v.score === "number"
                          ? v.score.toFixed(1)
                          : "0.0"}
                      </span>
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="bg-[#e9d26a] h-full transition-all duration-700"
                          style={{ width: `${(v.score || 0) * 20}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Celda de Botón */}
                  <td className="px-8 py-5 text-right">
                    <Link
                      href={`/dashboard/vendors/${v.usuario?.username || ""}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#252525] text-[#e9d26a] hover:bg-black transition-all text-[10px] font-black uppercase tracking-widest shadow-md"
                    >
                      Ver Perfil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest">
              No se encontraron proveedores
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
