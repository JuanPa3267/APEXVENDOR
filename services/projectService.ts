import { db } from "@/lib/db";

type CreateProjectInput = {
    cliente: string;
    nombre: string;
    descripcion?: string | null;
    tecnologia_stack?: string | null;
    inicio?: string | null; // viene como string del form (YYYY-MM-DD)
    fin?: string | null;
    estado?: "planificado" | "en_ejecucion" | "pausado" | "completado" | "cancelado";
};

export const projectService = {
    async createProject(data: CreateProjectInput) {
        return await db.proyecto.create({
            data: {
                cliente: data.cliente,
                nombre: data.nombre,
                descripcion: data.descripcion || null,
                tecnologia_stack: data.tecnologia_stack || null,
                inicio: data.inicio ? new Date(data.inicio) : null,
                fin: data.fin ? new Date(data.fin) : null,
                estado: data.estado || "planificado",
            },
        });
    },

    async listProjects() {
        return await db.proyecto.findMany({
            orderBy: [
                { inicio: "desc" }, // si es null, prisma puede ordenar al final dependiendo del motor
            ],
        });
    },

    async getProjectById(id_proyecto: string) {
        return await db.proyecto.findUnique({
            where: { id_proyecto },
            include: {
                participacion_proveedor: {
                    include: {
                        perfil_proveedor: {
                            include: {
                                usuario: true,
                            },
                        },
                    },
                },
            },
        });
    },
};
