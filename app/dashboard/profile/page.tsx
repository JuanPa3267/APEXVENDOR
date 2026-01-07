import { logoutAction } from "@/app/logout/action";
import { getFullProfile } from "@/services/profileService";
import { cookies } from "next/headers";
import PfpEditor from "./PfpEditor";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "";

  const profile = await getFullProfile(username);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="form_div text-center">
          <p className="text-red-600 font-bold mb-6">
            Error: No se encontró el perfil en la base de datos.
          </p>
          <form action={logoutAction}>
            <button className="btn-gold w-full">Regresar al Login</button>
          </form>
        </div>
      </div>
    );
  }

  const ratingWidth = (profile.details?.score || 0) * 20;

  const avatarUrl = profile.avatar
    ? `data:image/png;base64,${profile.avatar}`
    : "/static/img/profile.png";

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="profile_div max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-5">
          <div>
            <h2 className="m-0 text-[#252525] font-black text-3xl uppercase tracking-tighter">
              User <span className="text-[#bba955]">Profile</span>
            </h2>
            <div className="h-1 w-12 bg-[#e9d26a] mt-1 rounded-full"></div>
          </div>
        </div>

        {/* Sección de Avatar Circular */}
        <div className="flex flex-col items-center mb-12">
          {/* IMPORTANTE: Asegúrate de que en PfpEditor.tsx 
              la etiqueta <img> tenga las clases "rounded-full object-cover" 
          */}
          <div className="relative p-1 border-4 border-[#e9d26a] rounded-full shadow-2xl">
            <PfpEditor currentImage={avatarUrl} />
            <div className="absolute bottom-2 right-4 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
          </div>

          <h3 className="text-3xl font-extrabold text-[#252525] mt-6 mb-1 tracking-tight">
            {profile.details?.fullName}
          </h3>
          <p className="text-[#bba955] font-bold text-lg italic bg-[#fdfcf8] px-4 py-1 rounded-full border border-[#e9d26a]/20">
            @{profile.user.username}
          </p>
        </div>

        {/* Grid de Información */}
        <div className="profile_parent text-[#333] gap-y-10">
          <div className="profile_basic_info bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full"></span>
              Información de Usuario
            </h4>
            <div className="space-y-3">
              <p className="flex justify-between border-b border-white pb-2">
                <span className="font-bold text-gray-500">Email:</span>
                <span className="text-gray-800">{profile.user.email}</span>
              </p>
              <p className="flex justify-between border-b border-white pb-2 items-center">
                <span className="font-bold text-gray-500">Estado:</span>
                <span
                  className={`status-badge ${
                    profile.user.status === "Activo"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {profile.user.status}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-gray-500">Rol:</span>
                <span className="font-semibold text-[#bba955]">
                  {profile.roles[0] || "Proveedor"}
                </span>
              </p>
            </div>
          </div>

          <div className="profile_contact_info bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full"></span>
              Contacto e ID
            </h4>
            <div className="space-y-3">
              <p className="flex justify-between border-b border-white pb-2">
                <span className="font-bold text-gray-500">Ciudad:</span>
                <span className="text-gray-800 font-medium">
                  {profile.details?.city || "No especificada"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-gray-500">NIT / ID:</span>
                <span className="font-mono text-gray-800">
                  {profile.details?.nit || "N/A"}
                </span>
              </p>
            </div>
          </div>

          <div className="profile_address_info bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full"></span>
              Puntuación Apex
            </h4>
            <div className="rating-row bg-white p-4 rounded-xl shadow-inner flex flex-col items-center">
              <div className="rating scale-125 mb-2">
                <span className="stars bg">★★★★★</span>
                <span className="stars fg" style={{ width: `${ratingWidth}%` }}>
                  ★★★★★
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#e9d26a]">
                  {profile.details?.score?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-400 text-sm">/ 5.0</span>
              </div>
            </div>
          </div>

          <div className="profile_social_info bg-gray-50/50 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full"></span>
              Resumen Profesional
            </h4>
            <div className="bg-white p-4 rounded-xl border-l-4 border-[#e9d26a] mb-4">
              <p className="text-sm leading-relaxed text-gray-600 italic">
                "{profile.details?.portafolio || "Sin descripción."}"
              </p>
            </div>

            <ul className="social flex justify-center gap-4">
              {profile.user.social.linkedin && (
                <li>
                  <a href={profile.user.social.linkedin} target="_blank">
                    in
                  </a>
                </li>
              )}
              {profile.user.social.github && (
                <li>
                  <a href={profile.user.social.github} target="_blank">
                    gh
                  </a>
                </li>
              )}
              {profile.user.social.website && (
                <li>
                  <a href={profile.user.social.website} target="_blank">
                    web
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
