"use client";

import PfpEditor from "@/app/dashboard/profile/PfpEditor";
import {
  deleteCertAction,
  deleteCvAction,
  deleteMyAccountAction,
  getSasUrlAction,
  updatePortfolioAction,
  uploadCertAction,
  uploadCvAction,
} from "@/app/dashboard/profile/actions";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import ProfileEditForm from "./ProfileEditForm";

import { useRouter } from "next/navigation";

import { assignVendorFromProfileAction } from "@/app/dashboard/vendors/actions";
import AssignToProjectModal from "./AssignToProjectModal";

const format12h = (time: string) => {
  if (!time) return "--:--";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

export default function ProfileView({
  profile,
  isAdminViewing = false,
  availableProjects = [],
}: {
  profile: any;
  isAdminViewing?: boolean;
  availableProjects?: any[];
}) {
  const router = useRouter();
  // Estado para el texto real y el texto que se muestra (efecto máquina)
  const [resumen, setResumen] = useState(
    profile.details?.portafolio_resumen || "",
  );
  const [displayedText, setDisplayedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const cvs = profile.documents?.cvs || [];
  const certs = profile.documents?.certificaciones || [];

  const [cvUploading, setCvUploading] = useState(false);
  const [certUploading, setCertUploading] = useState(false);

  // Modal Asignar Proyecto
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [certForm, setCertForm] = useState({
    nombre: "",
    emisor: "",
    nivel: "",
    fecha_emision: "",
    fecha_expiracion: "",
    file: null as File | null,
  });

  const [editMode, setEditMode] = useState<"contact" | "social" | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openWithSas = async (blobUrl: string) => {
    const res = await getSasUrlAction(blobUrl);
    if (res?.error) return alert(res.error);
    if (res?.url) window.open(res.url, "_blank");
  };

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
          {profile.details?.fullName ||
            profile.details?.legalName ||
            "Nombre no configurado"}
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
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Último acceso
              </span>
              <span className="text-[#252525] font-bold text-lg">
                {profile.user.lastLogin
                  ? new Date(profile.user.lastLogin).toLocaleString("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                  : "Nunca"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Última actualización
              </span>
              <span className="text-[#252525] font-bold text-lg">
                {profile.user.lastUpdated
                  ? new Date(profile.user.lastUpdated).toLocaleString("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                  : "Desconocida"}
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
                className={`text-[9px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg ${isSaving
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

      {/* 4.1. Tarifa por hora (Extra Card) */}
      <div className="w-full bg-gradient-to-r from-white/40 to-[#e9d26a]/10 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl overflow-hidden transition-all mt-8 group hover:shadow-2xl">
        <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(233,210,106,0.2)] group-hover:scale-110 transition-transform">
              <span className="text-[#e9d26a] text-2xl font-black">$</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-2">
                Tarifa Base
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#252525] tracking-tighter">
                  {profile.details?.tarifa_hora
                    ? `$${profile.details.tarifa_hora}`
                    : "No definida"}
                </span>
                {profile.details?.tarifa_hora && (
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    / hora
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isAdminViewing && (
            <button
              onClick={() => setEditMode("contact")}
              className="text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-full bg-[#252525] text-[#e9d26a] hover:bg-black active:scale-95 transition-all shadow-lg shrink-0 whitespace-nowrap"
            >
              Actualizar Tarifa
            </button>
          )}
        </div>
      </div>

      {/* 4.2. Disponibilidad (Extra Card) */}
      <div className="w-full bg-gradient-to-r from-white/40 to-blue-500/10 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl overflow-hidden transition-all mt-8 group hover:shadow-2xl">
        <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-start gap-6 w-full">
            <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">
              <span className="text-blue-400 text-2xl font-black">📅</span>
            </div>
            <div className="flex-1 w-full">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-4">
                Disponibilidad
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Días */}
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">
                    Días habilitados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.details?.dias_disponibles?.length > 0 ? (
                      [...profile.details.dias_disponibles]
                        .sort((a, b) => {
                          const order = [
                            "Lunes",
                            "Martes",
                            "Miércoles",
                            "Jueves",
                            "Viernes",
                            "Sábado",
                            "Domingo",
                          ];
                          return order.indexOf(a) - order.indexOf(b);
                        })
                        .map((day: string) => (
                          <span
                            key={day}
                            className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200"
                          >
                            {day}
                          </span>
                        ))
                    ) : (
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        No definidos
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">
                    Horario de servicio
                  </p>
                  <div className="flex items-center">
                    {profile.details?.horas_disponibles?.length >= 2 ? (
                      <div className="flex items-center gap-3 bg-[#252525] text-blue-400 text-base md:text-lg font-black tracking-tighter md:tracking-widest px-6 py-2 rounded-full border border-gray-700 shadow-inner">
                        <span className="whitespace-nowrap">
                          {format12h(profile.details.horas_disponibles[0])}
                        </span>
                        <span className="text-gray-600 opacity-50">—</span>
                        <span className="whitespace-nowrap">
                          {format12h(profile.details.horas_disponibles[1])}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        No definido
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isAdminViewing && (
            <button
              onClick={() => setEditMode("contact")}
              className="text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-full bg-[#252525] text-blue-400 hover:bg-black active:scale-95 transition-all shadow-lg shrink-0 whitespace-nowrap"
            >
              Actualizar Horarios
            </button>
          )}
        </div>
      </div>

      {/* 4.5 Datos adicionales + Redes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/50 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Datos adicionales
            </h4>
            {!isAdminViewing && (
              <button
                onClick={() => setEditMode("contact")}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a] hover:bg-black active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Actualizar
              </button>
            )}
          </div>

          <div className="space-y-5 text-[#252525]">
            <div>
              <div className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Estado de cuenta
              </div>
              <div className="font-bold">{profile.user.status}</div>
            </div>

            <div>
              <div className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Tipo de proveedor
              </div>
              <div className="font-bold">
                {profile.details?.tipo_proveedor || "N/A"}
              </div>
            </div>

            <div>
              <div className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Teléfono
              </div>
              <div className="font-bold">
                {profile.details?.telefono || "No definido"}
              </div>
            </div>

            <div>
              <div className="text-[9px] font-black text-[#bba955] uppercase tracking-widest mb-1">
                Dirección
              </div>
              <div className="font-bold">
                {profile.details?.direccion || "No definida"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/50 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">
              Redes sociales
            </h4>
            {!isAdminViewing && (
              <button
                onClick={() => setEditMode("social")}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a] hover:bg-black active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Actualizar
              </button>
            )}
          </div>
          <div className="space-y-4">
            {[
              ["LinkedIn", profile.user.social?.linkedin],
              ["GitHub", profile.user.social?.github],
              ["Website", profile.user.social?.website],
              ["Instagram", profile.user.social?.instagram],
            ].map(([label, url]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-bold text-[#252525]">{label}</span>
                {url ? (
                  <a
                    className="text-[#bba955] font-black text-xs uppercase tracking-widest hover:underline"
                    href={url as string}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No proporcionado
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isAdminViewing && (
        <Modal
          isOpen={!!editMode}
          onClose={() => setEditMode(null)}
          title={`Actualizar ${editMode === "contact" ? "Datos de Contacto" : "Redes Sociales"
            }`}
        >
          <ProfileEditForm
            profile={profile}
            onSuccess={() => setEditMode(null)}
            mode={editMode || "contact"}
          />
        </Modal>
      )}

      {/* 4.5.5 Proyectos Asignados (NUEVO) */}
      <div className="w-full mt-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#e9d26a] rounded-full animate-pulse"></span>
            Proyectos Asignados
          </h4>

          {isAdminViewing && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-[#252525] text-[#e9d26a] text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest hover:bg-black transition cursor-pointer"
            >
              + Asignar
            </button>
          )}
        </div>
        {!profile.projects || profile.projects.length === 0 ? (
          <div className="bg-white/30 backdrop-blur-md p-10 rounded-[3rem] border border-white/50 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              No estás asignado a ningún proyecto activo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.projects.map((proj: any) => (
              <div
                key={proj.id}
                className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-[#252525] uppercase tracking-tighter leading-none mb-1">
                      {proj.project.name}
                    </h3>
                    <p className="text-[10px] font-bold text-[#bba955] uppercase tracking-widest">
                      {proj.project.client}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] flex-none font-black uppercase tracking-widest ${proj.project.status === "en curso"
                      ? "bg-green-100 text-green-700"
                      : proj.project.status === "completado"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {proj.project.status || "Definido"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                      Rol asignado
                    </p>
                    <p className="font-bold text-[#252525]">{proj.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Inicio
                      </p>
                      <p className="font-bold text-[#252525] text-sm">
                        {proj.startDate
                          ? new Date(proj.startDate).toLocaleDateString("en-US")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Fin
                      </p>
                      <p className="font-bold text-[#252525] text-sm">
                        {proj.endDate
                          ? new Date(proj.endDate).toLocaleDateString("en-US")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {proj.contract && (
                    <div className="pt-3 flex items-center justify-between border-t border-gray-100/50 mt-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Documento Contractual
                        </p>
                        <p className="text-[#252525] text-xs font-bold truncate max-w-[150px]">
                          {proj.contract.name || "Contrato"}
                        </p>
                      </div>
                      <button
                        onClick={() => openWithSas(proj.contract.url)}
                        className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a] cursor-pointer hover:bg-black transition-all"
                      >
                        Ver Documento
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4.6 Documentación */}
      <div className="w-full bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl overflow-hidden transition-all mt-8">
        <div className="p-10">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3 mb-8">
            <span className="w-1.5 h-1.5 bg-[#e9d26a] rounded-full"></span>
            Documentación
          </h4>

          {/* CVs */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[9px] font-black text-[#bba955] uppercase tracking-widest">
                Hoja de vida (CV)
              </div>

              {!isAdminViewing && (
                <label className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a] cursor-pointer">
                  {cvUploading ? "Subiendo..." : "Subir nuevo"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCvUploading(true);
                      const res = await uploadCvAction(file);
                      setCvUploading(false);
                      if (res?.error) alert(res.error);
                    }}
                  />
                </label>
              )}
            </div>

            {cvs.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No has subido CV todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {cvs.map((cv: any) => (
                  <div
                    key={cv.id_hojavida}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/50"
                  >
                    <div>
                      <div className="font-bold text-[#252525]">CV</div>
                      <div className="text-xs text-gray-500">
                        Subido:{" "}
                        {new Date(cv.fecha_carga).toLocaleString("en-US")}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openWithSas(cv.url_pdf)}
                        className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a] cursor-pointer"
                      >
                        Ver
                      </button>

                      {!isAdminViewing && (
                        <button
                          onClick={async () => {
                            if (!confirm("¿Eliminar este CV?")) return;
                            const res = await deleteCvAction(cv.id_hojavida);
                            if (res?.error) alert(res.error);
                          }}
                          className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#EB2328] text-white cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificaciones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[9px] font-black text-[#bba955] uppercase tracking-widest">
                Certificaciones
              </div>
            </div>

            {!isAdminViewing && (
              <div className="p-5 rounded-2xl bg-white/30 border border-white/50 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="styled-input"
                    placeholder="Nombre"
                    value={certForm.nombre}
                    onChange={(e) =>
                      setCertForm((p) => ({ ...p, nombre: e.target.value }))
                    }
                  />
                  <input
                    className="styled-input"
                    placeholder="Emisor"
                    value={certForm.emisor}
                    onChange={(e) =>
                      setCertForm((p) => ({ ...p, emisor: e.target.value }))
                    }
                  />
                  <input
                    className="styled-input"
                    placeholder="Nivel/Categoría (opcional)"
                    value={certForm.nivel}
                    onChange={(e) =>
                      setCertForm((p) => ({ ...p, nivel: e.target.value }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="styled-input"
                      type="date"
                      value={certForm.fecha_emision}
                      onChange={(e) =>
                        setCertForm((p) => ({
                          ...p,
                          fecha_emision: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="styled-input"
                      type="date"
                      value={certForm.fecha_expiracion}
                      onChange={(e) =>
                        setCertForm((p) => ({
                          ...p,
                          fecha_expiracion: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <label className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full bg-[#252525] text-[#e9d26a] cursor-pointer hover:bg-black transition-all">
                      {certForm.file ? "Cambiar Archivo" : "Seleccionar PDF"}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) =>
                          setCertForm((p) => ({
                            ...p,
                            file: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </label>
                    {certForm.file && (
                      <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">
                        📄 {certForm.file.name}
                      </span>
                    )}
                  </div>

                  <button
                    disabled={certUploading}
                    onClick={async () => {
                      const fd = new FormData();
                      fd.set("nombre", certForm.nombre);
                      fd.set("emisor", certForm.emisor);
                      fd.set("nivel", certForm.nivel);
                      fd.set("fecha_emision", certForm.fecha_emision);
                      fd.set("fecha_expiracion", certForm.fecha_expiracion);
                      if (certForm.file) fd.set("file", certForm.file);

                      setCertUploading(true);
                      const res = await uploadCertAction(fd);
                      setCertUploading(false);

                      if (res?.error) return alert(res.error);

                      setCertForm({
                        nombre: "",
                        emisor: "",
                        nivel: "",
                        fecha_emision: "",
                        fecha_expiracion: "",
                        file: null,
                      });
                    }}
                    className="text-[9px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full bg-[#252525] text-[#e9d26a] cursor-pointer hover:bg-black active:scale-95 transition-all shadow-lg shadow-[#e9d26a]/5"
                  >
                    {certUploading ? "Agregando..." : "+ Agregar"}
                  </button>
                </div>
              </div>
            )}

            {certs.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No has subido certificaciones todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {certs.map((c: any) => {
                  const exp = c.fecha_expiracion
                    ? new Date(c.fecha_expiracion)
                    : null;
                  const vigente = !exp || exp.getTime() > Date.now();

                  return (
                    <div
                      key={c.id_cert}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/50"
                    >
                      <div className="pr-3">
                        <div className="font-bold text-[#252525]">
                          {c.nombre_certificacion}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.emisor} • Emitida:{" "}
                          {new Date(c.fecha_emision).toLocaleDateString(
                            "en-US",
                          )}
                          {exp
                            ? ` • Expira: ${exp.toLocaleDateString("en-US")}`
                            : ""}
                        </div>
                        <div
                          className={`text-[10px] font-black uppercase tracking-widest mt-2 inline-block px-3 py-1 rounded-full ${vigente
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {vigente ? "Vigente" : "Expirada"}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openWithSas(c.url_archivo)}
                          className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a] cursor-pointer"
                        >
                          Ver
                        </button>

                        {!isAdminViewing && (
                          <button
                            onClick={async () => {
                              if (!confirm("¿Eliminar esta certificación?"))
                                return;
                              const res = await deleteCertAction(c.id_cert);
                              if (res?.error) alert(res.error);
                            }}
                            className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#EB2328] text-white cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Zona de Peligro (Eliminar Cuenta) */}
      {!isAdminViewing && (
        <div className="mt-12 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            Eliminar mi cuenta
          </button>
        </div>
      )}

      {/* 5. Sello Inferior */}
      <div className="mt-8 flex justify-center opacity-20">
        <div className="flex items-center gap-2 border border-[#252525] px-4 py-2 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#252525]">
            Apex Intelligence Protocol © 2026
          </span>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="¿Estás completamente seguro?"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700 font-bold text-sm">
              Esta acción es irreversible. Se eliminarán permanentemente:
            </p>
            <ul className="list-disc list-inside text-red-600 text-xs mt-2 space-y-1">
              <li>Tu perfil de proveedor y todos tus datos.</li>
              <li>Tu hoja de vida (CV) y certificaciones subidas.</li>
              <li>Tu historial de acceso y configuración.</li>
            </ul>
          </div>

          <p className="text-gray-600 text-sm">
            Si procedes, tu sesión se cerrará y serás redirigido a la página de
            inicio.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (
                  !confirm(
                    "Última advertencia: ¿Deseas eliminar tu cuenta permanentemente?",
                  )
                )
                  return;

                const res = await deleteMyAccountAction();
                if (res?.error) {
                  alert(res.error);
                } else {
                  router.push("/");
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#EB2328] text-white hover:bg-[#FF3C39] text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Sí, eliminar mi cuenta
            </button>
          </div>
        </div>
      </Modal>

      <AssignToProjectModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false);
          router.refresh();
        }}
        userId={profile.user.id}
        availableProjects={availableProjects}
        assignAction={assignVendorFromProfileAction}
      />
    </div>
  );
}
