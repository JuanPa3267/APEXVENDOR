"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { projectService, type ProjectStatus } from "@/services/projectService";

async function getSessionUsername() {
  const cookieStore = await cookies();
  return cookieStore.get("username")?.value;
}

async function assertAdmin() {
  const username = await getSessionUsername();
  if (!username) throw new Error("No autorizado");

  const user = await db.usuario.findUnique({
    where: { username },
    include: { roles: { include: { rol: true } } },
  });

  const isAdmin = user?.roles?.some((r: any) => r.rol.nombre === "Admin");
  if (!isAdmin) throw new Error("No autorizado");

  return { username, user };
}

export async function updateProjectAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const cliente = String(formData.get("cliente") || "");
    const nombre = String(formData.get("nombre") || "");
    const descripcion = (formData.get("descripcion") as string) || "";
    const tecnologia_stack = (formData.get("tecnologia_stack") as string) || "";
    const inicio = String(formData.get("inicio") || "");
    const fin = (formData.get("fin") as string) || "";

    if (!id_proyecto) return { error: "Falta id_proyecto" };
    if (!cliente || !nombre || !inicio)
      return { error: "Cliente, nombre e inicio son obligatorios" };

    await projectService.updateProject({
      id_proyecto,
      cliente,
      nombre,
      descripcion: descripcion || null,
      tecnologia_stack: tecnologia_stack || null,
      inicio,
      fin: fin || null,
    });

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo actualizar el proyecto" };
  }
}

export async function updateProjectStatusAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const estado = String(formData.get("estado") || "") as ProjectStatus;

    if (!id_proyecto || !estado) return { error: "Datos incompletos" };

    await projectService.updateProjectStatus(id_proyecto, estado);

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo cambiar el estado" };
  }
}

export async function assignVendorAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const id_proveedor = String(formData.get("id_proveedor") || "");
    const rol_en_proyecto = String(formData.get("rol_en_proyecto") || "");
    const inicio = (formData.get("inicio") as string) || "";
    const fin = (formData.get("fin") as string) || "";

    if (!id_proyecto || !id_proveedor || !rol_en_proyecto) {
      return { error: "Proyecto, proveedor y rol son obligatorios" };
    }

    await projectService.assignVendorToProject({
      id_proyecto,
      id_proveedor,
      rol_en_proyecto,
      inicio: inicio || null,
      fin: fin || null,
    });

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo asignar el proveedor" };
  }
}

export async function removeVendorAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    const id_participacion = String(formData.get("id_participacion") || "");

    if (!id_participacion || !id_proyecto) return { error: "Datos incompletos" };

    await projectService.removeVendorFromProject(id_participacion);

    revalidatePath(`/dashboard/projects/${id_proyecto}`);
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo quitar el proveedor" };
  }
}

export async function deleteProjectAction(prev: any, formData: FormData) {
  try {
    await assertAdmin();

    const id_proyecto = String(formData.get("id_proyecto") || "");
    if (!id_proyecto) return { error: "Falta id_proyecto" };

    await projectService.deleteProject(id_proyecto);

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "No se pudo eliminar el proyecto" };
  }
}
