import { db } from "@/lib/db";

export async function getAllVendors() {
  return await db.perfilProveedor.findMany({
    include: {
      usuario: {
        select: {
          username: true,
          correo: true,
          estado_cuenta: true,
        },
      },
    },
    orderBy: {
      nombres_apellidos: "asc",
    },
  });
}
