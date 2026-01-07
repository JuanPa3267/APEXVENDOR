// app/dashboard/vendors/[username]/page.tsx
import ProfileView from "@/components/profile/ProfileView"; // <-- Ahora ya existe
import { getFullProfile } from "@/services/profileService";
import Link from "next/link"; // <-- Importación que faltaba
import { redirect } from "next/navigation";

export default async function VendorDetailPage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = await params;
  const profile = await getFullProfile(username);

  if (!profile) redirect("/dashboard/vendors?error=notfound");

  return (
    <div className="animate-in slide-in-from-right duration-500 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/dashboard/vendors"
          className="text-gray-400 hover:text-[#bba955] font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-8 transition-colors"
        >
          <span className="text-lg">←</span> Volver al listado
        </Link>

        {/* Usamos el componente que acabamos de crear */}
        <ProfileView profile={profile} isAdminViewing={true} />
      </div>
    </div>
  );
}
