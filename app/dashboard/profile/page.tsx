import ProfileView from "@/components/profile/ProfileView";
import { getFullProfile } from "@/services/profileService";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// TODO: poner bonito el boton para subir cvs y certificaciones ya que solo sale un texto y ni siquiera el mouse cambia
export default async function ProfilePage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "";

  const profile = await getFullProfile(username);
  if (!profile) redirect("/login");

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <ProfileView profile={profile} isAdminViewing={false} />
    </div>
  );
}
