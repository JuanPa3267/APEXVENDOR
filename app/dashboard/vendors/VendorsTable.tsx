"use client";

import { Slider, SliderValue } from "@heroui/slider";
import Link from "next/link";
import { useMemo, useState } from "react";

type SortField = "nombres_apellidos" | "ciudad" | "score";
type SortOrder = "asc" | "desc";

export default function VendorsTable({
  initialVendors,
}: {
  initialVendors: any[];
}) {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("nombres_apellidos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedCity, setSelectedCity] = useState("");
  const [minScore, setMinScore] = useState<number>(0);

  // Get unique cities for filter
  const cities = useMemo(() => {
    const allCities = initialVendors
      .map((v) => v.ciudad)
      .filter((c): c is string => !!c);
    return Array.from(new Set(allCities)).sort();
  }, [initialVendors]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...initialVendors];

    // Search filter
    if (query) {
      const lowQuery = query.toLowerCase();
      result = result.filter((v) => {
        const name = (v?.nombres_apellidos || "").toLowerCase();
        const legalName = (v?.nombre_legal || "").toLowerCase();
        const nit = (v?.identificacion_nit || "").toLowerCase();
        const user = (v?.usuario?.username || "").toLowerCase();
        return (
          name.includes(lowQuery) ||
          legalName.includes(lowQuery) ||
          nit.includes(lowQuery) ||
          user.includes(lowQuery)
        );
      });
    }

    // City filter
    if (selectedCity) {
      result = result.filter((v) => v.ciudad === selectedCity);
    }

    // Score filter
    if (minScore > 0) {
      result = result.filter((v) => (v.score || 0) >= minScore);
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;

      if (sortField === "nombres_apellidos") {
        valA = a.nombres_apellidos || a.nombre_legal || "";
        valB = b.nombres_apellidos || b.nombre_legal || "";
      } else {
        valA = a[sortField] ?? "";
        valB = b[sortField] ?? "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialVendors, query, sortField, sortOrder, selectedCity, minScore]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Buscador */}
        <div className="relative flex-1 group w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-xl">
            🔍
          </div>
          <input
            type="text"
            placeholder="Buscar proveedor..."
            className="styled-input pl-12 py-4 bg-white shadow-sm border-gray-200 focus:border-[#e9d26a] w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* City Filter */}
        <div className="w-full md:w-48">
          <label className="block text-[10px] font-black uppercase text-[#bba955] mb-1 tracking-widest pl-2">
            Ciudad
          </label>
          <select
            className="styled-input py-3.5 bg-white shadow-sm border-gray-200 focus:border-[#e9d26a] w-full text-sm"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Score Filter */}
        <div className="w-full md:w-56">
          <Slider
            key="warning"
            label="Score Mínimo"
            size="md"
            className="max-w-md"
            color="warning"
            defaultValue={0}
            maxValue={5}
            minValue={0}
            step={0.1}
            value={minScore}
            onChange={(val: SliderValue) => setMinScore(val as number)}
            classNames={{
              base: "max-w-md px-1",
              filler: "bg-[#e9d26a] rounded-l-full",
              thumb: "bg-[#e9d26a] after:bg-white shadow-xl",
              track: "bg-[#F3F4F6] border-none",
            }}
          />
        </div>

        {/* Reset Filters */}
        <div className="w-full md:w-auto">
          <button
            disabled={!query && !selectedCity && minScore === 0}
            onClick={() => {
              setQuery("");
              setSelectedCity("");
              setMinScore(0);
            }}
            className="pb-4 text-[10px] font-black uppercase tracking-widest px-4 cursor-pointer transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-[#252525] hover:text-[#bba955] border-b-2 border-transparent hover:border-[#e9d26a] disabled:hover:border-transparent"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#252525] text-[#e9d26a] text-[10px] font-black uppercase tracking-[0.2em]">
                <th
                  className="px-8 py-6 cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={() => handleSort("nombres_apellidos")}
                >
                  <div className="flex items-center gap-2">
                    Proveedor / Usuario
                    {sortField === "nombres_apellidos" && (
                      <span className="text-[#e9d26a]">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-8 py-6">NIT</th>
                <th
                  className="px-8 py-6 cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={() => handleSort("ciudad")}
                >
                  <div className="flex items-center gap-2">
                    Ciudad
                    {sortField === "ciudad" && (
                      <span className="text-[#e9d26a]">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-8 py-6 cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center gap-2">
                    Score
                    {sortField === "score" && (
                      <span className="text-[#e9d26a]">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-8 py-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSorted.map((v, index) => (
                <tr
                  key={v.id_perfil_p || v.usuario?.username || index}
                  className="hover:bg-gray-50/80 transition-all group"
                >
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#252525] text-base">
                        {v.nombres_apellidos ||
                          v.nombre_legal ||
                          "Nombre no disponible"}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSorted.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest">
              No se encontraron proveedores
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
