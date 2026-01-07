// services/userService.ts
import { db } from "@/lib/db";

export const userService = {
  async registerUser(data: any) {
    return await db.$transaction(async (tx) => {
      // 1. Crear Usuario base
      const user = await tx.usuario.create({
        data: {
          username: data.username,
          correo: data.correo,
          passwordHash: data.passwordHash,
        },
      });

      // 2. Crear Perfil según el tipo
      if (data.is_admin) {
        await tx.perfilAdmin.create({
          data: {
            id_admin: user.id_usuario,
            nombre: data.name,
          },
        });
      } else {
        await tx.perfilProveedor.create({
          data: {
            id_proveedor: user.id_usuario,
            tipo_proveedor: data.tipo_proveedor,
            identificacion_nit: data.nit,
            nombres_apellidos: data.name,
            ciudad: data.city,
            // Agrega más campos si los necesitas
          },
        });
      }

      // 3. Asignar Rol (Buscando el ID del rol por nombre)
      const roleName = data.is_admin ? "Admin" : "Proveedor";
      const role = await tx.rol.findUnique({ where: { nombre: roleName } });

      if (role) {
        await tx.usuarioRol.create({
          data: {
            id_usuario: user.id_usuario,
            id_rol: role.id_rol,
          },
        });
      }

      return user;
    });
  },
};
