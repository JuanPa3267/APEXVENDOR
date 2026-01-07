import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChatContainer from "./ChatContainer";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) redirect("/login");

  const user = await db.usuario.findUnique({
    where: { username },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles.some((r: any) => r.rol.nombre === "Admin");

  if (!isAdmin) {
    redirect("/dashboard/profile?error=unauthorized");
  }

  return (
    <div className="h-[calc(100vh-80px)] p-6 lg:p-10 flex flex-col max-w-7xl mx-auto">
      {/* Header interno del Chat */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[#252525] font-black text-4xl uppercase tracking-tighter m-0 leading-none">
            Apex <span className="text-[#bba955]">Intelligence</span>
          </h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-bold">
            Soporte de decisiones para licitaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Estado: Operativo
          </span>
          <span className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter border border-[#e9d26a]/30 shadow-lg">
            Admin Terminal
          </span>
        </div>
      </div>

      {/* Contenedor del Chat Principal */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        <ChatContainer />
      </div>
    </div>
  );
}
