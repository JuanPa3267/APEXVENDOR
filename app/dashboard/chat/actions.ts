"use server";

import { db } from "@/lib/db";
import { askGemini, getPdfText } from "@/lib/gemini";

export async function sendMessageAction(message: string, history: any[]) {
  try {
    const answer = await askGemini(message, history);
    return { response: answer };
  } catch (error) {
    console.error("Error en sendMessageAction:", error);
    return { response: "❌ Error al conectar con la IA." };
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
