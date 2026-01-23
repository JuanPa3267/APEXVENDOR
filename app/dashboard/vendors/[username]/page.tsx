import ProfileView from "@/components/profile/ProfileView";
import { getFullProfile } from "@/services/profileService";
import { projectService } from "@/services/projectService";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ username?: string }>;
}) {
  // ✅ Verificación Admin
  const cookieStore = await cookies();
  const sessionUsername = cookieStore.get("username")?.value;

  if (!sessionUsername) redirect("/login");

  const user = await db.usuario.findUnique({
    where: { username: sessionUsername },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) redirect("/dashboard/profile?error=unauthorized");

  // ✅ Username del proveedor desde la URL (Next 16)
  const { username: vendorUsername } = await params;
  if (!vendorUsername) redirect("/dashboard/vendors?error=badparam");

  const profile = await getFullProfile(vendorUsername);
  if (!profile) redirect("/dashboard/vendors?error=notfound");

  const availableProjects = await projectService.listProjects();

  return (
    <div className="animate-in slide-in-from-right duration-500 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/dashboard/vendors"
          className="text-gray-400 hover:text-[#bba955] font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-8 transition-colors"
        >
          <span className="text-lg">←</span> Volver al listado
        </Link>

        <ProfileView
          profile={profile}
          isAdminViewing={true}
          availableProjects={availableProjects}
        />
      </div>
    </div>
  );
}