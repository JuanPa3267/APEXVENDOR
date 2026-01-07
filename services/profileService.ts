import { db } from "@/lib/db";

export async function getFullProfile(username: string) {
  const data = await db.usuario.findUnique({
    where: { username },
    include: {
      perfilProveedor: true,
      perfilAdmin: true,
      roles: { include: { rol: true } },
      pfps: true,
    },
  });

  if (!data) return null;

  // Verificamos si pfps viene como array o como objeto único
  const pfpData = Array.isArray(data.pfps) ? data.pfps[0] : data.pfps;

  return {
    user: {
      id: data.id_usuario,
      username: data.username,
      email: data.correo,
      status: data.estado_cuenta,
      social: {
        instagram: data.instagram,
        linkedin: data.linkedin,
        github: data.github,
        website: data.website,
      },
    },
    details: data.perfilProveedor
      ? {
          fullName: data.perfilProveedor.nombres_apellidos,
          city: data.perfilProveedor.ciudad,
          nit: data.perfilProveedor.identificacion_nit,
          score: data.perfilProveedor.score,
          portafolio_resumen: data.perfilProveedor.portafolio_resumen,
        }
      : null,
    roles: data.roles.map((r: any) => r.rol.nombre), // Ajustado a 'nombre' según tu schema
    avatar: pfpData?.image_base64 || null, // Usamos la variable pfpData que ya validamos
  };
}

export async function updatePfp(username: string, base64Image: string) {
  // Buscamos si ya existe una entrada para este username en pfps
  const existingPfp = await db.pfps.findFirst({
    where: { username: username },
  });

  if (existingPfp) {
    // Si existe, actualizamos usando su id (que es int8/Identity)
    return await db.pfps.update({
      where: { id: existingPfp.id },
      data: { image_base64: base64Image },
    });
  } else {
    // Si no existe, creamos el registro nuevo
    return await db.pfps.create({
      data: {
        username: username,
        image_base64: base64Image,
      },
    });
  }
}
