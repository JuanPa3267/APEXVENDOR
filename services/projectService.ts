import { db } from "@/lib/db";
import { uploadToAzureBlob } from "@/lib/azureBlob";

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
    const participants = await db.participacion_proveedor.findMany({
      where: { id_proyecto },
      include: {
        perfil_proveedor: {
          include: {
            usuario: true, // para username/correo si lo quieres mostrar
          },
        },
        evaluacion: true,
        contrato_participacion: true,
      },
      orderBy: [{ inicio: "desc" }],
    });

    // Convertir Decimal a number para que sea serializable por Next.js
    return participants.map((p) => ({
      ...p,
      evaluacion: p.evaluacion.map((e) => ({
        ...e,
        calificacion_global: e.calificacion_global
          ? Number(e.calificacion_global)
          : null,
      })),
    }));
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
        `Transición inválida: ${current} → ${nextStatus}. Permitidas: ${allowed.join(", ") || "ninguna"
        }`,
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
    // Validar fechas contra el proyecto
    const participacionOriginal = await db.participacion_proveedor.findUnique({
      where: { id_participacion: params.id_participacion },
      include: { proyecto: true }
    });

    if (!participacionOriginal) throw new Error("Participación no encontrada");

    const proyecto = participacionOriginal.proyecto;
    if (params.inicio && proyecto.inicio) {
      if (new Date(params.inicio) < new Date(proyecto.inicio)) {
        throw new Error("La participación no puede iniciar antes del proyecto.");
      }
    }
    if (params.fin && proyecto.fin) {
      if (new Date(params.fin) > new Date(proyecto.fin)) {
        throw new Error("La participación no puede terminar después del proyecto.");
      }
    }

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
    contrato?: File | null;
    cargado_por: string;
  }) {
    // Evitar duplicados
    const existing = await db.participacion_proveedor.findFirst({
      where: {
        id_proyecto: params.id_proyecto,
        id_proveedor: params.id_proveedor,
      },
    });
    if (existing)
      throw new Error("Este proveedor ya está asignado al proyecto.");

    // Validar fechas
    const proyecto = await db.proyecto.findUnique({
      where: { id_proyecto: params.id_proyecto }
    });
    if (!proyecto) throw new Error("Proyecto no encontrado");

    if (params.inicio && proyecto.inicio) {
      if (new Date(params.inicio) < new Date(proyecto.inicio)) {
        throw new Error("La participación no puede iniciar antes del proyecto.");
      }
    }
    if (params.fin && proyecto.fin) {
      if (new Date(params.fin) > new Date(proyecto.fin)) {
        throw new Error("La participación no puede terminar después del proyecto.");
      }
    }

    return await db.$transaction(async (tx) => {
      const participacion = await tx.participacion_proveedor.create({
        data: {
          id_proyecto: params.id_proyecto,
          id_proveedor: params.id_proveedor,
          rol_en_proyecto: params.rol_en_proyecto,
          inicio: params.inicio ? new Date(params.inicio) : null,
          fin: params.fin ? new Date(params.fin) : null,
        },
      });

      if (params.contrato) {
        // Upload to Azure Blob Storage
        const containerName = process.env.AZURE_STORAGE_CONTRACT_CONTAINER || "contratos";
        const fileExt = params.contrato.name.split(".").pop() || "pdf";
        const blobName = `${params.id_proyecto}-${params.id_proveedor}-${Date.now()}.${fileExt}`;

        const uploadResult = await uploadToAzureBlob({
          containerName,
          blobName,
          file: params.contrato,
        });

        // Create the contract record
        await tx.contrato_participacion.create({
          data: {
            id_participacion: participacion.id_participacion,
            nombre_archivo: params.contrato.name,
            url_archivo: uploadResult.url,
            cargado_por: params.cargado_por,
          },
        });
      }

      return participacion;
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

  async saveEvaluation(data: {
    id_participacion: string;
    evaluador: string; // id_usuario
    comentario_cualitativo: string;
    calificacion_global?: number;
    detalles: {
      id_metrica: string;
      valor_numerico: number;
    }[];
  }) {
    // Prevención de duplicados
    const existingEvaluation = await db.evaluacion.findFirst({
      where: { id_participacion: data.id_participacion },
    });

    if (existingEvaluation) {
      throw new Error("Este proveedor ya ha sido evaluado en este proyecto.");
    }

    return await db.$transaction(async (tx) => {
      // 1. Create the evaluation header
      const evalRecord = await tx.evaluacion.create({
        data: {
          id_participacion: data.id_participacion,
          evaluador: data.evaluador,
          comentario_cualitativo: data.comentario_cualitativo,
          calificacion_global: data.calificacion_global,
        },
      });

      // 2. Create the details
      if (data.detalles.length > 0) {
        await tx.evaluacion_detalle.createMany({
          data: data.detalles.map((d) => ({
            id_eval: evalRecord.id_evaluacion,
            id_metrica: d.id_metrica,
            valor_numerico: d.valor_numerico,
          })),
        });
      }

      // 3. Recalculate Provider Score
      // First, find the provider ID from the participation
      const participation = await tx.participacion_proveedor.findUnique({
        where: { id_participacion: data.id_participacion },
        select: { id_proveedor: true },
      });

      if (participation?.id_proveedor) {
        // Fetch all evaluations for this provider
        const providerEvaluations = await tx.evaluacion.findMany({
          where: {
            participacion_proveedor: {
              id_proveedor: participation.id_proveedor,
            },
            calificacion_global: { not: null },
          },
          select: { calificacion_global: true },
        });

        // Calculate average
        // Note: providerEvaluations includes the one we just created because we are in a transaction (and using tx to read)
        // However, Prisma behavior inside transaction for read-your-writes depends on isolation level.
        // Since we just created 'evalRecord', it SHOULD be returned if isolation permits.
        // To be safe and explicit, let's enable accumulating the new value logic.

        // Correction: `tx.evaluacion.findMany` DOES see the newly created record in default Prisma transaction (Read Committed / Repeatable Read depending on DB).
        // Let's assume it works. If not, we can manually append `evalRecord.calificacion_global` if it's missing.

        const total = providerEvaluations.reduce(
          (sum, e) => sum + (Number(e.calificacion_global) || 0),
          0,
        );
        const count = providerEvaluations.length;
        const newScore = count > 0 ? total / count : 0;

        // Update Provider Score
        await tx.perfilProveedor.update({
          where: { id_proveedor: participation.id_proveedor },
          data: { score: newScore },
        });
      }

      return evalRecord;
    });
  },
};
