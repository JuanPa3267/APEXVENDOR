import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { projectService } from "@/services/projectService";
import ProjectCreateModal from "./ProjectCreateModal";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) redirect("/login");

  // ✅ Validación Admin por DB (no por cookie)
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
            Registro y consulta
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#252525] text-[#e9d26a] text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-tighter shadow-xl border border-[#e9d26a]/20">
            Total: {projects.length}
          </div>

          {/* ✅ Botón modal para crear */}
          <ProjectCreateModal />
        </div>
      </div>

      {/* Listado */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-gray-500 font-bold">
          Aún no hay proyectos creados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p: any) => (
            <Link
              key={p.id_proyecto}
              href={`/dashboard/projects/${p.id_proyecto}`}
              className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                    {p.cliente}
                  </div>
                  <div className="text-2xl font-black text-[#252525] mt-2 tracking-tighter">
                    {p.nombre}
                  </div>
                </div>

                <div className="text-[10px] flex-none font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#252525] text-[#e9d26a]">
                  {p.estado || "sin estado"}
                </div>
              </div>

              {p.descripcion && (
                <p className="text-gray-600 mt-4 text-sm leading-relaxed line-clamp-3">
                  {p.descripcion}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                <span>
                  Inicio:{" "}
                  {p.inicio ? new Date(p.inicio).toLocaleDateString("es-CO") : "N/A"}
                </span>
                <span>•</span>
                <span>
                  Fin: {p.fin ? new Date(p.fin).toLocaleDateString("es-CO") : "N/A"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
