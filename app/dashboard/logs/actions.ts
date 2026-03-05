"use server";

import { db } from "@/lib/db";

export async function getLoginLogs() {
  try {
    const users = await db.usuario.findMany({
      select: {
        username: true,
        correo: true,
        ultimo_acceso: true,
        roles: {
          include: {
            rol: {
              select: {
                nombre: true,
              },
            },
          },
        },
        perfilProveedor: {
          select: {
            nombre_legal: true,
            nombres_apellidos: true,
          },
        },
      },
      orderBy: {
        ultimo_acceso: "desc",
      },
    });

    return users.map((user) => {
      const roles = user.roles.map((r) => r.rol.nombre).join(", ");
      const name = user.perfilProveedor
        ? user.perfilProveedor.nombres_apellidos ||
          user.perfilProveedor.nombre_legal ||
          ""
        : "";

      return {
        fecha: user.ultimo_acceso ? user.ultimo_acceso.toISOString() : "Nunca",
        correo: user.correo || "",
        usuario: user.username || "",
        nombre: name,
        rol: roles || "",
      };
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function getProjectsSummary() {
  try {
    const projects = await db.proyecto.findMany({
      include: {
        participacion_proveedor: {
          select: {
            id_proveedor: true,
            rol_en_proyecto: true,
            perfil_proveedor: {
              select: {
                nombres_apellidos: true,
                nombre_legal: true,
              },
            },
          },
        },
      },
    });

    return projects.map((p) => ({
      id: p.id_proyecto,
      nombre: p.nombre,
      cliente: p.cliente,
      descripcion: p.descripcion || "",
      stack: p.tecnologia_stack || "",
      estado: p.estado || "En Curso",
      inicio: p.inicio ? p.inicio.toISOString() : null,
      fin: p.fin ? p.fin.toISOString() : null,
      miembros: p.participacion_proveedor.map((part) => ({
        nombre:
          part.perfil_proveedor.nombres_apellidos ||
          part.perfil_proveedor.nombre_legal ||
          "Desconocido",
        rol: part.rol_en_proyecto,
      })),
    }));
  } catch (error) {
    console.error("Error fetching projects summary:", error);
    return [];
  }
}

export async function getAuditRecords() {
  try {
    const evaluations = await db.evaluacion.findMany({
      include: {
        participacion_proveedor: {
          include: {
            perfil_proveedor: {
              select: {
                nombres_apellidos: true,
                nombre_legal: true,
              },
            },
            proyecto: {
              select: {
                nombre: true,
              },
            },
          },
        },
        evaluacion_detalle: {
          include: {
            metrica: true,
          },
        },
      },
    });

    // Rankings desde PerfilProveedor (Incluye a todos los calificados)
    const allProviders = await db.perfilProveedor.findMany({
      where: {
        score: { not: null },
      },
      select: {
        nombres_apellidos: true,
        nombre_legal: true,
        score: true,
      },
    });

    const averageScores = allProviders.map((p) => ({
      name: p.nombres_apellidos || p.nombre_legal || "Desconocido",
      score: p.score || 0,
    }));

    const best = [...averageScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const worst = [...averageScores]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    // Métricas
    const metricStats = new Map<
      string,
      { total: number; count: number; providers: Set<string> }
    >();

    evaluations.forEach((evalItem) => {
      evalItem.evaluacion_detalle.forEach((detail) => {
        const metricName = detail.metrica.nombre;
        const value = Number(detail.valor_numerico) || 0;
        const providerId =
          evalItem.participacion_proveedor?.id_proveedor || "Unknown";

        const current = metricStats.get(metricName) || {
          total: 0,
          count: 0,
          providers: new Set(),
        };
        current.providers.add(providerId);

        metricStats.set(metricName, {
          total: current.total + value,
          count: current.count + 1,
          providers: current.providers,
        });
      });
    });

    const metricAverages = Array.from(metricStats.entries()).map(
      ([name, data]) => ({
        name,
        score: data.total / data.count,
        providerCount: data.providers.size,
      }),
    );

    // Registros Crudos para CSV
    const rawRecords = evaluations.flatMap((evalItem) => {
      const providerName =
        evalItem.participacion_proveedor?.perfil_proveedor.nombres_apellidos ||
        evalItem.participacion_proveedor?.perfil_proveedor.nombre_legal ||
        "Desconocido";
      const projectName =
        evalItem.participacion_proveedor?.proyecto.nombre || "Sin Proyecto";
      const date = evalItem.fecha.toISOString().split("T")[0];

      return evalItem.evaluacion_detalle.map((detail) => ({
        fecha: date,
        proveedor: providerName,
        proyecto: projectName,
        metrica: detail.metrica.nombre,
        puntaje: Number(detail.valor_numerico) || 0,
      }));
    });

    return {
      best,
      worst,
      metricAverages,
      rawRecords,
    };
  } catch (error) {
    console.error("Error fetching audit records:", error);
    return { best: [], worst: [], metricAverages: [], rawRecords: [] };
  }
}

export async function getMasterLog() {
  try {
    const users = await db.usuario.findMany({
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
        perfilProveedor: {
          include: {
            participacion_proveedor: {
              include: {
                proyecto: true,
              },
            },
          },
        },
      },
      orderBy: { creado_en: "desc" },
    });

    return users.map((u) => {
      const pProv = u.perfilProveedor;
      const participations = pProv?.participacion_proveedor || [];

      const projects = participations.map((p) => p.proyecto.nombre).join(" | ");
      const stacks = participations
        .map((p) => p.proyecto.tecnologia_stack)
        .filter(Boolean)
        .join(" | ");

      return {
        id: u.id_usuario,
        correo: u.correo,
        username: u.username || "N/A",
        nombre: pProv?.nombres_apellidos || pProv?.nombre_legal || "Sin nombre",
        roles: u.roles.map((r) => r.rol.nombre).join(" | "),
        estado: u.estado_cuenta,
        ultimoAcceso: u.ultimo_acceso
          ? u.ultimo_acceso.toISOString().split("T")[0]
          : "Nunca",
        nit: pProv?.identificacion_nit || "N/A",
        tipo: pProv?.tipo_proveedor || "N/A",
        telefono: pProv?.telefono || "N/A",
        ciudad: pProv?.ciudad || "N/A",
        score: pProv?.score || 0,
        proyectos: projects || "Sin proyectos",
        stacks: stacks || "N/A",
        creadoEn: u.creado_en.toISOString().split("T")[0],
      };
    });
  } catch (error) {
    console.error("Error getting Master Log:", error);
    return [];
  }
}
