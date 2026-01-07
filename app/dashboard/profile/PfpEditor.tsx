"use client";

import { useState } from "react";
import { uploadPfpAction } from "./actions";

export default function PfpEditor({ currentImage }: { currentImage: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Imagen demasiado grande (máximo 1MB)");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const result = await uploadPfpAction(base64);

      if (result.error) alert(result.error);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Añadimos rounded-full y overflow-hidden al contenedor principal */}
      <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-[#e9d26a] shadow-2xl">
        <img
          src={currentImage}
          className={`w-full h-full object-cover transition-all duration-300 ${
            loading ? "opacity-40 scale-95" : "group-hover:brightness-50"
          }`}
          alt="Avatar"
        />

        {!loading && (
          <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="bg-[#e9d26a] text-[#333] text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
              Cambiar
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
          </label>
        )}

        {/* Barra de carga estética dorada */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-[#e9d26a] animate-pulse w-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
