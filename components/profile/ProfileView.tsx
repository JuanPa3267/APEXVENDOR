"use client";

import PfpEditor from "@/app/dashboard/profile/PfpEditor";
import { updatePortfolioAction } from "@/app/dashboard/profile/actions";
import { useEffect, useState } from "react";

export default function ProfileView({
  profile,
  isAdminViewing = false,
}: {
  profile: any;
  isAdminViewing?: boolean;
}) {
  // Estado para el texto real y el texto que se muestra (efecto máquina)
  const [resumen, setResumen] = useState(
    profile.details?.portafolio_resumen || ""
  );
  const [displayedText, setDisplayedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const score = profile.details?.score || 0;
  const ratingWidth = score * 20;
  const canSeeScore = isAdminViewing || score > 3.0;

  const avatarUrl = profile.avatar
    ? `data:image/png;base64,${profile.avatar}`
    : "/static/img/profile.png";

  // --- EFECTO MÁQUINA DE ESCRIBIR ---
  useEffect(() => {
    if (!isAdminViewing) {
      setDisplayedText(resumen);
      return;
    }

    let i = 0;
    const fullText =
      resumen ||
      "El proveedor aún no ha redactado su resumen ejecutivo profesional.";
    setDisplayedText("");

    const speed = 15; // Velocidad de tipado
    const typeWriter = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(typeWriter);
    }, speed);

    return () => clearInterval(typeWriter);
  }, [resumen, isAdminViewing]);

  // --- FUNCIÓN GUARDAR ---
  const handleSavePortfolio = async () => {
    setIsSaving(true);
    try {
      const result = await updatePortfolioAction(resumen);
      if (result.error) alert(result.error);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500 pb-20">
      {/* 1. Banner de Modo Auditoría */}
      {isAdminViewing && (
        <div className="mb-10 bg-[#252525] border-l-4 border-[#e9d26a] p-5 rounded-r-2xl shadow-2xl">
          <div className="flex items-center">
            <span className="text-2xl mr-4">🛡️</span>
            <div>
              <p className="text-[#e9d26a] font-black text-xs uppercase tracking-[0.2em]">
                Modo Auditoría Administrativa
              </p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Vista de solo lectura restringida
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sección Superior: Avatar y Nombre */}
      <div className="flex flex-col items-center mb-16">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#e9d26a] to-[#bba955] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative p-1 bg-[#fafae6] rounded-full">
            {isAdminViewing ? (
              <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-[#e9d26a] shadow-2xl">
                <img
                  src={avatarUrl}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
            ) : (
              <PfpEditor currentImage={avatarUrl} />
            )}
          </div>
        </div>

        <h3 className="text-5xl font-black text-[#252525] mt-10 mb-2 tracking-tighter uppercase text-center">
          {profile.details?.fullName || "Nombre no configurado"}
        </h3>
        <div className="flex items-center gap-3">
          <span className="h-[1px] w-8 bg-[#e9d26a]"></span>
          <p className="text-[#bba955] font-black text-xs tracking-[0.4em] uppercase">
            @{profile.user.username}
          </p>
          <span className="h-[1px] w-8 bg-[#e9d26a]"></span>
        </div>
      </div>

      {/* 3. Grid de Información (Cards de Datos y Score) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Card 1: Datos */}
        <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/50 shadow-sm hover:shadow-md transition-all">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#e9d26a] rounded-full"></span>
            Credenciales de Proveedor
          </h4>
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Correo Electrónico
              </span>
              <span className="text-[#252525] font-bold text-lg break-all">
                {profile.user.email}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Identificación / NIT
              </span>
              <span className="text-[#252525] font-mono font-bold text-lg">
                {profile.details?.nit || "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Ubicación Actual
              </span>
              <span className="text-[#252525] font-bold text-lg">
                {profile.details?.city || "No definida"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Calificación */}
        <div className="bg-[#252525] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-black">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#e9d26a]/10 rounded-full blur-3xl transition-all group-hover:bg-[#e9d26a]/20"></div>

          <h4 className="text-[10px] font-black text-[#e9d26a] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#e9d26a] rounded-full animate-pulse"></span>
            Apex Performance Score
          </h4>

          <div className="flex flex-col items-center justify-center py-4">
            {canSeeScore ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <span className="text-7xl font-black text-white tracking-tighter block mb-2">
                  {score.toFixed(1)}
                </span>
                <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-[#e9d26a] to-[#bba955] h-full shadow-[0_0_20px_rgba(233,210,106,0.4)] transition-all duration-1000"
                    style={{ width: `${ratingWidth}%` }}
                  ></div>
                </div>
                <p className="text-[#e9d26a] text-[10px] font-black uppercase tracking-[0.2em] mt-6 opacity-80">
                  Reputación Certificada
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-4 opacity-20">🔒</div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  Puntuación Privada
                </p>
                <p className="text-[#e9d26a]/40 text-[8px] font-bold uppercase mt-2">
                  Score {">"} 3.0 requerido
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN PORTAFOLIO RESUMEN (Ancho Completo) */}
      <div className="w-full bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl overflow-hidden transition-all">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[#e9d26a] rounded-full animate-pulse"></span>
              Resumen de Portafolio
            </h4>

            {!isAdminViewing && (
              <button
                onClick={handleSavePortfolio}
                disabled={isSaving}
                className={`text-[9px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg ${
                  isSaving
                    ? "bg-green-500 text-white scale-95"
                    : "bg-[#252525] text-[#e9d26a] hover:bg-black active:scale-95"
                }`}
              >
                {isSaving ? "✓ Guardado" : "💾 Actualizar"}
              </button>
            )}
          </div>

          {isAdminViewing ? (
            /* VISTA ADMIN CON EFECTO MÁQUINA */
            <div className="relative min-h-[200px] text-[#252525] leading-relaxed font-medium text-lg italic bg-white/20 p-8 rounded-[2rem] border border-dashed border-[#e9d26a]/30 shadow-inner">
              {displayedText}
              <span className="inline-block w-2 h-5 ml-1 bg-[#e9d26a] animate-pulse align-middle"></span>
            </div>
          ) : (
            /* VISTA USUARIO (Editor normal) */
            <div className="relative">
              <textarea
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                placeholder="Describe tu experiencia, maquinaria y proyectos destacados..."
                className="w-full h-64 bg-white/60 border-2 border-transparent focus:border-[#e9d26a]/40 rounded-[2.5rem] p-8 text-[#252525] font-medium text-lg outline-none transition-all placeholder:text-gray-300 resize-none shadow-inner"
              />
              <div className="absolute bottom-6 right-8 pointer-events-none opacity-20">
                <span className="text-[8px] font-black uppercase tracking-widest">
                  Apex Portfolio Editor
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Sello Inferior */}
      <div className="mt-12 flex justify-center opacity-20">
        <div className="flex items-center gap-2 border border-[#252525] px-4 py-2 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#252525]">
            Apex Intelligence Protocol © 2026
          </span>
        </div>
      </div>
    </div>
  );
}
