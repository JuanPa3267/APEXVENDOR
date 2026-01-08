"use client";

import { deleteVendorAction } from "@/services/adminActions"; // Importa la acción
import Link from "next/link";
import { useState } from "react";

export default function VendorsTable({
  initialVendors,
}: {
  initialVendors: any[];
}) {
  const [query, setQuery] = useState("");
  const [vendors, setVendors] = useState(initialVendors); // Estado para actualizar la lista localmente

  const handleDelete = async (username: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar permanentemente al proveedor @${username}?`
      )
    ) {
      return;
    }

    const result = await deleteVendorAction(username);

    if (result.success) {
      // Filtramos la lista local para que desaparezca al instante
      setVendors(vendors.filter((v) => v.usuario?.username !== username));
    } else {
      alert(result.error);
    }
  };

  const filtered = vendors.filter((v) => {
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
                  className="hover:bg-gray-50/80 transition-all group"
                >
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

                  <td className="px-8 py-5">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {v.identificacion_nit || "N/A"}
                    </span>
                  </td>

                  <td className="px-8 py-5 text-gray-600 font-semibold text-sm">
                    {v.ciudad || "No especificada"}
                  </td>

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

                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <Link
                      href={`/dashboard/vendors/${v.usuario?.username || ""}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#252525] text-[#e9d26a] hover:bg-black transition-all text-[10px] font-black uppercase tracking-widest shadow-md"
                    >
                      Ver
                    </Link>

                    <button
                      onClick={() => handleDelete(v.usuario?.username)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                      title="Eliminar Proveedor"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
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
