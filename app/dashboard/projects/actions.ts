"use server";

import { db } from "@/lib/db";
import { projectService } from "@/services/projectService";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSessionUsername() {
    const cookieStore = await cookies();
    return cookieStore.get("username")?.value || null;
}

async function assertAdminByUsername(username: string) {
    const user = await db.usuario.findUnique({
        where: { username },
        include: { roles: { include: { rol: true } } },
    });

    const isAdmin = user?.roles?.some((r: any) => r.rol.nombre === "Admin");
    return { user, isAdmin: !!isAdmin };
}

export async function createProjectAction(prevState: any, formData: FormData) {
    const username = await getSessionUsername();
    if (!username) return { error: "No autorizado" };

    const { isAdmin } = await assertAdminByUsername(username);
    if (!isAdmin) return { error: "No autorizado (solo Admin)" };

    const cliente = (formData.get("cliente") as string) || "";
    const nombre = (formData.get("nombre") as string) || "";
    const descripcion = (formData.get("descripcion") as string) || "";
    const tecnologia_stack = (formData.get("tecnologia_stack") as string) || "";
    const inicio = (formData.get("inicio") as string) || "";
    const fin = (formData.get("fin") as string) || "";
    const estado = (formData.get("estado") as string) as any;

    if (!cliente.trim() || !nombre.trim()) {
        return { error: "Cliente y nombre del proyecto son obligatorios" };
    }

    // Validación simple de fechas (opcional)
    if (inicio && fin) {
        const d1 = new Date(inicio).getTime();
        const d2 = new Date(fin).getTime();
        if (d2 < d1) return { error: "La fecha fin no puede ser anterior a inicio" };
    }

    if (!inicio) {
        return { error: "La fecha de inicio es obligatoria" };
    }

    try {
        await projectService.createProject({
            cliente: cliente.trim(),
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            tecnologia_stack: tecnologia_stack.trim() || null,
            inicio: inicio,
            fin: fin || null,
            estado: estado || "planificado",
        });

        revalidatePath("/dashboard/projects");
        return { success: true };
    } catch (e: any) {
        console.error("Error creating project:", e);
        return { error: e?.message ?? "No se pudo crear el proyecto" };
    }
}

export async function updateProjectStatusAction(prevState: any, formData: FormData) {
  const username = await getSessionUsername();
  if (!username) return { error: "No autorizado" };

  const { isAdmin } = await assertAdminByUsername(username);
  if (!isAdmin) return { error: "No autorizado (solo Admin)" };

  const id_proyecto = (formData.get("id_proyecto") as string) || "";
  const estado = (formData.get("estado") as string) as any;

  if (!id_proyecto) return { error: "Proyecto inválido" };
  if (!estado) return { error: "Estado inválido" };

  try {
    await projectService.updateProjectStatus(id_proyecto, estado);
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    console.error("Error updating status:", e);
    return { error: e?.message ?? "No se pudo actualizar el estado" };
  }
}
