// services/userService.ts
import { db } from "@/lib/db";
import { deleteFromAzureBlob, extractBlobNameFromUrl } from "@/lib/azureBlob";

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
        },
      });

      // 2) Crear Perfil según el tipo
      if (data.is_admin) {
        // Ya no creamos perfilAdmin
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

            instagram: data.instagram ?? null,
            linkedin: data.linkedin ?? null,
            website: data.website ?? null,
            github: data.github ?? null,
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

      // 4) Asignar imagen de perfil predeterminada
      try {
        const fs = require("fs");
        const path = require("path");
        const imagePath = path.join(process.cwd(), "img", "tak_logo.png");

        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

          await tx.pfps.create({
            data: {
              username: user.username,
              image_base64: base64Image,
            },
          });
        }
      } catch (error) {
        console.error("Error asignando imagen por defecto:", error);
        // No fallamos el registro si falla la imagen, pero lo logueamos
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

  async deleteUser(id_usuario: string) {
    // 1. Obtener datos antes de borrar
    const user = await db.usuario.findUnique({
      where: { id_usuario },
      include: {
        perfilProveedor: {
          include: {
            certificaciones: true,
            hoja_vida_proveedor: true,
          },
        },
      },
    });

    if (!user) return null;

    // 2. Borrar archivos de Azure si es proveedor
    if (user.perfilProveedor) {
      const cvContainer = process.env.AZURE_STORAGE_CV_CONTAINER || "";
      const certContainer = process.env.AZURE_STORAGE_CERTS_CONTAINER || "";

      // Hojas de vida
      for (const hv of user.perfilProveedor.hoja_vida_proveedor) {
        const blobName = extractBlobNameFromUrl(hv.url_pdf, cvContainer);
        if (blobName) {
          await deleteFromAzureBlob(cvContainer, blobName);
        }
      }

      // Certificaciones
      for (const cert of user.perfilProveedor.certificaciones) {
        const blobName = extractBlobNameFromUrl(cert.url_archivo, certContainer);
        if (blobName) {
          await deleteFromAzureBlob(certContainer, blobName);
        }
      }
    }

    // 3. Borrar usuario de BD (Cascade se encarga del resto)
    return await db.usuario.delete({
      where: { id_usuario },
    });
  },
};
