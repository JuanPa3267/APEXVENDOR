import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projectService } from "@/services/projectService";
import ProjectActions from "./ProjectActions";
import VendorsTable from "./VendorsTable";
import ChangeStatusModal from "./ChangeStatusModal";


export default async function ProjectDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value;

    if (!username) redirect("/login");

    // Admin check
    const user = await db.usuario.findUnique({
        where: { username },
        include: { roles: { include: { rol: true } } },
    });

    const isAdmin = user?.roles.some((r: any) => r.rol.nombre === "Admin");
    if (!isAdmin) redirect("/dashboard/profile?error=unauthorized");

    // ✅ Next 16: params puede requerir await
    const { id } = await params;
    const project = await projectService.getProjectById(id);
    if (!project) redirect("/dashboard/projects?error=notfound");

    const participants = await projectService.listProjectParticipants(project.id_proyecto);
    const providersForAssign = await projectService.listProvidersForAssign(project.id_proyecto);

    // Obtener métricas para evaluación
    const metrics = await db.metrica.findMany({
        orderBy: { nombre: 'asc' }
    });

    return (
        <div className="animate-in slide-in-from-right duration-500 p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/dashboard/projects"
                    className="text-gray-400 hover:text-[#bba955] font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-8 transition-colors"
                >
                    <span className="text-lg">←</span> Volver a proyectos
                </Link>

                {/* Header + Acciones */}
                <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                            {project.cliente}
                        </p>
                        <h2 className="text-[#252525] font-black text-4xl lg:text-5xl uppercase tracking-tighter leading-none mt-2">
                            {project.nombre}
                        </h2>
                    </div>

                    <ProjectActions project={project} providers={providersForAssign} />
                </div>

                {/* Card Principal (tu UI puede variar; aquí solo dejamos estructura compatible) */}
                <div className="bg-white/70 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-xl overflow-hidden">
                    <div className="p-10">
                        <div className="flex items-start justify-between gap-6">
                            <p className="text-gray-600 max-w-3xl">
                                {project.descripcion || "Sin descripción."}
                            </p>

                            <ChangeStatusModal
                                projectId={project.id_proyecto}
                                currentStatus={project.estado || "planificado"}
                            />

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                            <div className="bg-white/60 rounded-2xl p-6 border border-gray-100">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                    Fechas
                                </p>
                                <div className="text-[#252525] font-bold">
                                    Inicio:{" "}
                                    {project.inicio
                                        ? new Date(project.inicio).toLocaleDateString("es-CO")
                                        : "—"}
                                </div>
                                <div className="text-[#252525] font-bold mt-2">
                                    Fin:{" "}
                                    {project.fin ? new Date(project.fin).toLocaleDateString("es-CO") : "N/A"}
                                </div>
                            </div>

                            <div className="bg-white/60 rounded-2xl p-6 border border-gray-100">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                    Tecnología
                                </p>
                                <div className="text-[#252525] font-bold">
                                    {project.tecnologia_stack || "No definida"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                Proveedores asignados
                            </p>

                            <VendorsTable
                                projectId={project.id_proyecto}
                                participants={participants}
                                providers={providersForAssign}
                                projectStatus={project.estado || undefined}
                                metrics={metrics}
                                currentUserId={user?.id_usuario || ""}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
