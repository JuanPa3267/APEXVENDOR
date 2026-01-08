// services/userService.ts
import { db } from "@/lib/db";

type RegisterUserInput = {
  username: string;
  correo: string;
  passwordHash: string;

  name: string;
  tipo_proveedor: "Persona" | "Empresa";
  nit: string;
  city: string;

  is_admin: boolean;

  // opcionales (perfil proveedor)
  telefono?: string | null;
  direccion?: string | null;
  portafolio_resumen?: string | null;

  // redes (van en Usuario)
  instagram?: string | null;
  linkedin?: string | null;
  website?: string | null;
  github?: string | null;
};

type AddCvInput = {
  id_proveedor: string; // uuid
  url_pdf: string;
};

type AddCertInput = {
  id_proveedor: string; // uuid
  nombre_certificacion: string;
  emisor: string;
  nivel_categoria?: string | null;
  fecha_emision: string; // "YYYY-MM-DD"
  fecha_expiracion?: string | null; // "YYYY-MM-DD"
  url_archivo: string;
};

export const userService = {
  async registerUser(data: RegisterUserInput) {
    return await db.$transaction(async (tx) => {
      // 1) Crear Usuario base + redes
      const user = await tx.usuario.create({
        data: {
          username: data.username,
          correo: data.correo,
          passwordHash: data.passwordHash,

          instagram: data.instagram ?? null,
          linkedin: data.linkedin ?? null,
          website: data.website ?? null,
          github: data.github ?? null,
        },
      });

      // 2) Crear Perfil según el tipo
      if (data.is_admin) {
        await tx.perfilAdmin.create({
          data: {
            id_admin: user.id_usuario,
            nombre: data.name,
          },
        });
      } else {
        const isEmpresa = data.tipo_proveedor === "Empresa";

        await tx.perfilProveedor.create({
          data: {
            id_proveedor: user.id_usuario,
            tipo_proveedor: data.tipo_proveedor,
            identificacion_nit: data.nit,

            // Tu regla en BD:
            // Empresa -> nombre_legal obligatorio
            // Persona -> nombres_apellidos obligatorio
            nombre_legal: isEmpresa ? data.name : null,
            nombres_apellidos: !isEmpresa ? data.name : null,

            ciudad: data.city,

            telefono: data.telefono ?? null,
            direccion: data.direccion ?? null,
            portafolio_resumen: data.portafolio_resumen ?? null,
          },
        });
      }

      // 3) Asignar rol
      const roleName = data.is_admin ? "Admin" : "Proveedor";
      const role = await tx.rol.findUnique({
        where: { nombre: roleName },
      });

      if (role) {
        await tx.usuarioRol.create({
          data: {
            id_usuario: user.id_usuario,
            id_rol: role.id_rol,
          },
        });
      }

      // ✅ Retorna el usuario para que actions.ts use id_usuario como id_proveedor
      return user;
    });
  },

  async addProveedorCv(data: AddCvInput) {
    // Modelo Prisma: hoja_vida_proveedor (con guiones bajos)
    return await db.hoja_vida_proveedor.create({
      data: {
        id_proveedor: data.id_proveedor,
        url_pdf: data.url_pdf,
      },
    });
  },

  async addProveedorCertificacion(data: AddCertInput) {
    return await db.certificacion.create({
      data: {
        id_proveedor: data.id_proveedor,
        nombre_certificacion: data.nombre_certificacion,
        emisor: data.emisor,
        nivel_categoria: data.nivel_categoria ?? null,
        fecha_emision: new Date(data.fecha_emision),
        fecha_expiracion: data.fecha_expiracion
          ? new Date(data.fecha_expiracion)
          : null,
        url_archivo: data.url_archivo,
      },
    });
  },
};
