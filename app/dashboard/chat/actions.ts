"use server";

import { db } from "@/lib/db";
import { askGemini, getPdfText } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function createMetricAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const notas = formData.get("notas") as string;

  if (!nombre) {
    return { error: "El nombre es requerido" };
  }

  try {
    await db.metrica.create({
      data: {
        nombre,
        notas,
      },
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error creating metric:", error);
    return { error: "Error al crear la métrica" };
  }
}

export async function deleteMetricAction(id: string) {
  try {
    await db.metrica.delete({
      where: {
        id_metrica: id,
      },
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error deleting metric:", error);
    return { error: "Error al eliminar la métrica" };
  }
}

export async function sendMessageAction(message: string, history: any[]) {
  try {
    // 1. Obtener los proveedores actuales de la DB
    const proveedores = await db.perfilProveedor.findMany({
      select: {
        nombres_apellidos: true,
        nombre_legal: true,
        tipo_proveedor: true,
        ciudad: true,
        score: true,
        portafolio_resumen: true,
        usuario: {
          select: {
            username: true,
          },
        },
      },
    });

    // 2. Crear un "System Instruction" que le dé identidad a la IA
    // Se lo pasamos como el primer mensaje si el historial está vacío o como contexto adicional
    const baseContext = `
      Eres Apex Intelligence, el asistente experto de la plataforma Apex. 
      Tienes acceso en tiempo real a nuestra base de datos de proveedores.
      
      CONOCIMIENTO ACTUAL DE PROVEEDORES:
      ${JSON.stringify(proveedores)}
      
      INSTRUCCIONES:
      - Si el usuario pregunta por recomendaciones, usa los datos anteriores.
      - Si preguntan sobre capacidades técnicas, analiza los 'portafolio_resumen'.
      - Mantén un tono profesional, ejecutivo y tecnológico.
      - No menciones que eres una IA de Google, preséntate como el cerebro de Apex.
      - IMPORTANTE: Cuando menciones a un proveedor específico, DEBES crear un enlace a su perfil usando Markdown así: 
        [Nombre del Proveedor](/dashboard/vendors/USERNAME)
        (Usa el 'username' que viene en el objeto 'usuario').
    `;

    // 3. Enviamos el mensaje inyectando el contexto al principio del prompt
    // para que siempre esté "fresco" en su memoria.
    const promptConContexto = `CONTEXTO DEL SISTEMA: ${baseContext}\n\nMENSAJE DEL USUARIO: ${message}`;

    const answer = await askGemini(promptConContexto, history);
    return { response: answer };
  } catch (error) {
    console.error("Error en sendMessageAction:", error);
    return { response: "Error al conectar con el cerebro de Apex." };
  }
}

export async function uploadPdfAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No se subió ningún archivo" };

  try {
    // 1. Extraer texto del Buffer del PDF
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await getPdfText(buffer);

    if (!text || text.trim().length < 10) {
      return {
        error:
          "No se pudo extraer suficiente texto del PDF. Intenta con otro archivo.",
      };
    }

    // 2. Obtener proveedores usando los nombres exactos de tu modelo PerfilProveedor
    const proveedores = await db.perfilProveedor.findMany({
      select: {
        nombres_apellidos: true,
        nombre_legal: true,
        tipo_proveedor: true,
        ciudad: true,
        score: true,
        portafolio_resumen: true,
        usuario: {
          select: {
            username: true,
          },
        },
      },
    });

    // 3. Construir el Prompt para Gemini
    const prompt = `
      Has recibido un nuevo proyecto/licitación. 
      Archivo: ${file.name}
      Contenido del documento: ${text}
      
      TAREAS:
      1. Resume brevemente de qué trata el proyecto y sus requerimientos clave.
      2. Define el perfil ideal del proveedor (habilidades técnicas y blandas).
      3. Analiza la siguiente lista de proveedores de nuestra base de datos y recomienda los 3 mejores para este proyecto específico, justificando por qué su perfil encaja.
      
      PROVEEDORES DISPONIBLES:
      ${JSON.stringify(proveedores)}
      
      REGLAS DE RESPUESTA:
      - Responde en español y usa Markdown profesional.
      - Presenta el TOP de proveedores en una TABLA.
      - IMPORTANTE: En la tabla, el nombre del proveedor DEBE ser un enlace a su perfil: [Nombre](/dashboard/vendors/USERNAME).
      - No menciones IDs de base de datos.
    `;

    const summary = await askGemini(prompt, []);

    return {
      fileName: file.name,
      summary: summary,
    };
  } catch (error: any) {
    console.error("Error en uploadPdfAction:", error);
    return { error: "Error procesando el análisis: " + error.message };
  }
}
