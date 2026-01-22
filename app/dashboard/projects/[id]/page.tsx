import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projectService  } from "@/services/projectService";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;

  if (!username) redirect("/login");

  // ✅ Validación Admin por DB
  const user = await db.usuario.findUnique({
    where: { username },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) redirect("/dashboard/profile?error=unauthorized");

  if (!id) redirect("/dashboard/projects?error=badparam");

  const project = await projectService.getProjectById(id);
  if (!project) redirect("/dashboard/projects?error=notfound");

  return (
    <div className="animate-in slide-in-from-right duration-500 p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/dashboard/projects"
          className="text-gray-400 hover:text-[#bba955] font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-8 transition-colors"
        >
          <span className="text-lg">←</span> Volver a proyectos
        </Link>

        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                {project.cliente}
              </div>
              <h1 className="text-4xl font-black text-[#252525] tracking-tighter mt-2">
                {project.nombre}
              </h1>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[#252525] text-[#e9d26a]">
              {project.estado || "sin estado"}
            </div>
          </div>

          {project.descripcion && (
            <p className="text-gray-600 mt-6 text-base leading-relaxed">
              {project.descripcion}
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/60">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Fechas
              </div>
              <div className="mt-4 space-y-2 text-[#252525] font-bold">
                <div>
                  Inicio:{" "}
                  {project.inicio
                    ? new Date(project.inicio).toLocaleDateString("es-CO")
                    : "N/A"}
                </div>
                <div>
                  Fin:{" "}
                  {project.fin
                    ? new Date(project.fin).toLocaleDateString("es-CO")
                    : "N/A"}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 border border-white/60">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Tecnología
              </div>
              <div className="mt-4 text-[#252525] font-bold">
                {project.tecnologia_stack || "No especificada"}
              </div>
            </div>
          </div>

          {/* Vista solo lectura: participaciones actuales (si existen) */}
          <div className="mt-10">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.35em] mb-4">
              Proveedores asignados (solo lectura)
            </div>

            {project.participacion_proveedor?.length ? (
              <div className="space-y-3">
                {project.participacion_proveedor.map((pp: any) => (
                  <div
                    key={pp.id_participacion}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60"
                  >
                    <div>
                      <div className="font-black text-[#252525]">
                        {pp.perfil_proveedor?.nombres_apellidos ||
                          pp.perfil_proveedor?.nombre_legal ||
                          "Proveedor"}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        Rol: {pp.rol_en_proyecto}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 font-bold">
                      {pp.inicio
                        ? new Date(pp.inicio).toLocaleDateString("es-CO")
                        : "Sin inicio"}{" "}
                      →{" "}
                      {pp.fin
                        ? new Date(pp.fin).toLocaleDateString("es-CO")
                        : "Sin fin"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-bold">
                Aún no hay proveedores asignados a este proyecto.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
