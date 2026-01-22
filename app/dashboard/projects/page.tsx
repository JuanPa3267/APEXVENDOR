import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProjectCreateModal from "./ProjectCreateModal";
import { projectService } from "@/services/projectService";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) redirect("/login");

  // Verificación de rol Admin (igual patrón que vendors)
  const user = await db.usuario.findUnique({
    where: { username },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) redirect("/dashboard/profile?error=unauthorized");

  const projects = await projectService.listProjects();

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-[#252525] font-black text-4xl uppercase tracking-tighter m-0 leading-none">
            Gestión de <span className="text-[#bba955]">Proyectos</span>
          </h2>
          <p className="text-gray-400 text-xs mt-3 uppercase tracking-widest font-bold">
            Crear y administrar proyectos (MVP)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#e9d26a]/20">
            Total: {projects.length} Registros
          </div>

          <ProjectCreateModal />
        </div>
      </div>

      {/* Lista mínima */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-gray-500">
          Aún no hay proyectos creados.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#252525] text-[#e9d26a] text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="text-left p-4">Cliente</th>
                  <th className="text-left p-4">Proyecto</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Inicio</th>
                  <th className="text-left p-4">Fin</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id_proyecto} className="border-t border-gray-100">
                    <td className="p-4 font-bold text-[#252525]">{p.cliente}</td>
                    <td className="p-4">{p.nombre}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest">
                        {p.estado || "planificado"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {p.inicio ? new Date(p.inicio).toLocaleDateString("es-CO") : "—"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {p.fin ? new Date(p.fin).toLocaleDateString("es-CO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}