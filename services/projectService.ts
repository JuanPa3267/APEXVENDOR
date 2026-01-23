import { db } from "@/lib/db";

export type ProjectStatus =
    | "planificado"
    | "en curso"
    | "pausado"
    | "completado"
    | "cancelado";

type CreateProjectInput = {
    cliente: string;
    nombre: string;
    descripcion?: string | null;
    tecnologia_stack?: string | null;
    inicio: string; // OBLIGATORIO (YYYY-MM-DD)
    fin?: string | null;
    estado?: ProjectStatus;
};

type UpdateProjectInput = {
    id_proyecto: string;
    cliente: string;
    nombre: string;
    descripcion?: string | null;
    tecnologia_stack?: string | null;
    inicio: string; // OBLIGATORIO
    fin?: string | null;
};

const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    planificado: ["en curso", "cancelado"],
    "en curso": ["pausado", "completado", "cancelado"],
    pausado: ["en curso", "cancelado"],
    completado: [],
    cancelado: [],
};

export const projectService = {
    async createProject(data: CreateProjectInput) {
        // inicio obligatorio
        if (!data.inicio) throw new Error("La fecha de inicio es obligatoria.");

        return await db.proyecto.create({
            data: {
                cliente: data.cliente,
                nombre: data.nombre,
                descripcion: data.descripcion || null,
                tecnologia_stack: data.tecnologia_stack || null,
                inicio: new Date(data.inicio),
                fin: data.fin ? new Date(data.fin) : null,
                estado: data.estado || "planificado",
            },
        });
    },

    async listProjects() {
        return await db.proyecto.findMany({
            orderBy: [{ inicio: "desc" }],
        });
    },

    async getProjectById(id_proyecto: string) {
        return await db.proyecto.findUnique({
            where: { id_proyecto },
        });
    },

    async listProjectParticipants(id_proyecto: string) {
        return await db.participacion_proveedor.findMany({
            where: { id_proyecto },
            include: {
                perfil_proveedor: {
                    include: {
                        usuario: true, // para username/correo si lo quieres mostrar
                    },
                },
            },
            orderBy: [{ inicio: "desc" }],
        });
    },

    async listProvidersForAssign(id_proyecto: string) {
        const assigned = await db.participacion_proveedor.findMany({
            where: { id_proyecto },
            select: { id_proveedor: true },
        });

        const assignedIds = assigned.map((a) => a.id_proveedor);

        return await db.perfilProveedor.findMany({
            where: {
                id_proveedor: { notIn: assignedIds.length ? assignedIds : undefined },
            },
            include: {
                usuario: true,
            },
            orderBy: [{ score: "desc" }],
        });
    },

    async updateProject(data: UpdateProjectInput) {
        if (!data.inicio) throw new Error("La fecha de inicio es obligatoria.");

        return await db.proyecto.update({
            where: { id_proyecto: data.id_proyecto },
            data: {
                cliente: data.cliente,
                nombre: data.nombre,
                descripcion: data.descripcion || null,
                tecnologia_stack: data.tecnologia_stack || null,
                inicio: new Date(data.inicio),
                fin: data.fin ? new Date(data.fin) : null,
            },
        });
    },

    async updateProjectStatus(id_proyecto: string, nextStatus: ProjectStatus) {
        const project = await db.proyecto.findUnique({ where: { id_proyecto } });
        if (!project) throw new Error("Proyecto no encontrado.");

        const current = (project.estado || "planificado") as ProjectStatus;
        const allowed = allowedTransitions[current] || [];

        if (!allowed.includes(nextStatus)) {
            throw new Error(
                `Transición inválida: ${current} → ${nextStatus}. Permitidas: ${allowed.join(
                    ", "
                ) || "ninguna"}`
            );
        }

        return await db.proyecto.update({
            where: { id_proyecto },
            data: { estado: nextStatus },
        });
    },

    async updateVendorAssignment(params: {
        id_participacion: string;
        rol_en_proyecto: string;
        inicio?: string | null;
        fin?: string | null;
    }) {
        return await db.participacion_proveedor.update({
            where: { id_participacion: params.id_participacion },
            data: {
                rol_en_proyecto: params.rol_en_proyecto,
                inicio: params.inicio ? new Date(params.inicio) : null,
                fin: params.fin ? new Date(params.fin) : null,
            },
        });
    },

    async assignVendorToProject(params: {
        id_proyecto: string;
        id_proveedor: string;
        rol_en_proyecto: string;
        inicio?: string | null; // YYYY-MM-DD
        fin?: string | null; // YYYY-MM-DD
    }) {
        // Evitar duplicados
        const existing = await db.participacion_proveedor.findFirst({
            where: { id_proyecto: params.id_proyecto, id_proveedor: params.id_proveedor },
        });
        if (existing) throw new Error("Este proveedor ya está asignado al proyecto.");

        return await db.participacion_proveedor.create({
            data: {
                id_proyecto: params.id_proyecto,
                id_proveedor: params.id_proveedor,
                rol_en_proyecto: params.rol_en_proyecto,
                inicio: params.inicio ? new Date(params.inicio) : null,
                fin: params.fin ? new Date(params.fin) : null,
            },
        });
    },

    async removeVendorFromProject(id_participacion: string) {
        return await db.participacion_proveedor.delete({
            where: { id_participacion },
        });
    },

    async deleteProject(id_proyecto: string) {
        // Nota: por FK ON DELETE CASCADE, se borran participaciones, evaluaciones, etc.
        // FUTURO: antes de borrar aquí es donde iría “borrar contratos del blob” si tuvieras contenedor.
        return await db.proyecto.delete({
            where: { id_proyecto },
        });
    },
};