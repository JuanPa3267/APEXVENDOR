import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "User";
  const role = cookieStore.get("user_role")?.value || "Admin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Esta es la barra que falta en tu captura */}
      <Navbar username={username} role={role} />

      {/* Aquí es donde se "inyecta" tu ChatPage */}
      <main className="flex-1 bg-[#f4f4f4]">{children}</main>
    </div>
  );
}
