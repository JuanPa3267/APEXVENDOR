import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

export async function getPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("Error en PDFParser:", errData.parserError);
      resolve(""); // Resolvemos vacío para no romper el flujo
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      // Extraemos el texto de todas las páginas y lo limpiamos de codificación URL
      const text = pdfParser.getRawTextContent();
      resolve(text || "");
    });

    // Cargamos el buffer en el parser
    pdfParser.parseBuffer(buffer);
  });
}

export async function askGemini(prompt: string, history: any[]) {
  try {
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error en Gemini:", error);
    return "Lo siento, hubo un error al procesar tu solicitud.";
  }
}
