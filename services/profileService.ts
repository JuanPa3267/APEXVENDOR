import { db } from "@/lib/db";

export async function getFullProfile(username: string) {
  if (!username) return null;
  const data = await db.usuario.findUnique({
    where: { username },
    include: {
      perfilProveedor: {
        include: {
          certificaciones: true,
          hoja_vida_proveedor: true,
          participacion_proveedor: {
            include: {
              proyecto: true,
              contrato_participacion: true
            },
          },
        },
      },
      roles: { include: { rol: true } },
      pfps: true,
    },
  });

  if (!data) return null;

  const pfpData = Array.isArray(data.pfps) ? data.pfps[0] : data.pfps;

  return {
    user: {
      id: data.id_usuario,
      username: data.username,
      email: data.correo,
      status: data.estado_cuenta,
      lastLogin: data.ultimo_acceso,
      lastUpdated: data.actualizado_en,
      social: {
        instagram: data.perfilProveedor?.instagram ?? null,
        linkedin: data.perfilProveedor?.linkedin ?? null,
        github: data.perfilProveedor?.github ?? null,
        website: data.perfilProveedor?.website ?? null,
      },
    },
    details: data.perfilProveedor
      ? {
        fullName: data.perfilProveedor.nombres_apellidos,
        legalName: data.perfilProveedor.nombre_legal,
        city: data.perfilProveedor.ciudad,
        tarifa_hora: data.perfilProveedor.tarifa_hora,
        nit: data.perfilProveedor.identificacion_nit,
        score: data.perfilProveedor.score,
        portafolio_resumen: data.perfilProveedor.portafolio_resumen,
        telefono: data.perfilProveedor.telefono,
        direccion: data.perfilProveedor.direccion,
        tipo_proveedor: data.perfilProveedor.tipo_proveedor,
        dias_disponibles: data.perfilProveedor.dias_disponibles,
        horas_disponibles: data.perfilProveedor.horas_disponibles,
      }
      : null,
    documents: data.perfilProveedor
      ? {
        cvs: data.perfilProveedor.hoja_vida_proveedor
          .slice()
          .sort((a, b) => b.fecha_carga.getTime() - a.fecha_carga.getTime()),
        certificaciones: data.perfilProveedor.certificaciones
          .slice()
          .sort((a, b) => b.fecha_carga.getTime() - a.fecha_carga.getTime()),
      }
      : { cvs: [], certificaciones: [] },
    projects:
      data.perfilProveedor?.participacion_proveedor.map((p) => {
        const contract = p.contrato_participacion && p.contrato_participacion.length > 0
          ? p.contrato_participacion[0]
          : null;
        return {
          id: p.id_participacion,
          role: p.rol_en_proyecto,
          startDate: p.inicio,
          endDate: p.fin,
          project: {
            id: p.proyecto.id_proyecto,
            name: p.proyecto.nombre,
            client: p.proyecto.cliente,
            status: p.proyecto.estado,
          },
          contract: contract ? {
            url: contract.url_archivo,
            name: contract.nombre_archivo,
            uploadedBy: contract.cargado_por
          } : null,
        };
      }) || [],
    roles: data.roles.map((r: any) => r.rol.nombre),
    avatar: pfpData?.image_base64 || null,
  };
}

export async function updatePfp(username: string, base64Image: string) {
  const existingPfp = await db.pfps.findFirst({
    where: { username: username },
  });

  if (existingPfp) {
    return await db.pfps.update({
      where: { id: existingPfp.id },
      data: { image_base64: base64Image },
    });
  } else {
    return await db.pfps.create({
      data: {
        username: username,
        image_base64: base64Image,
      },
    });
  }
}
