import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChatContainer from "./ChatContainer";

import CreateMetricModal from "./CreateMetricModal";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) redirect("/login");

  return (
    // Quitamos p-10 y usamos h-full para que no haya márgenes que recorten el scroll
    <div className="h-[calc(100vh-64px)] w-full flex flex-col overflow-hidden bg-[#fafae6]">
      {/* Header con padding lateral para que no toque los bordes */}
      <div className="relative z-10 px-8 pt-6 pb-2 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-[#252525] font-black text-3xl uppercase tracking-tighter m-0 leading-none">
            Apex <span className="text-[#bba955]">Vendor</span>
          </h2>
          <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-bold">
            Soporte de decisiones para licitaciones
          </p>
        </div>
        <CreateMetricModal />
      </div>

      {/* Contenedor del Chat - Ocupa todo el resto del alto */}
      <div className="flex-1 min-h-0 w-full relative">
        <ChatContainer />
      </div>
    </div>
  );
}
