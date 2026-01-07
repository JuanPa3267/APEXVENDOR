"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Importamos el plugin para tablas
import { sendMessageAction, uploadPdfAction } from "./actions";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes o carga
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await sendMessageAction(userMsg, messages);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: result.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "❌ Error: No se pudo conectar con Apex Intelligence.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, sube solo archivos PDF.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadPdfAction(formData);

      if (result.error) {
        alert(result.error);
      } else if (result.summary) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: `📄 Documento subido: ${result.fileName}` },
          { role: "ai", content: result.summary },
        ]);
      }
    } catch (error) {
      alert("Error crítico al procesar el PDF.");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Área de Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none">
            <span className="text-7xl mb-4">🤖</span>
            <p className="font-black uppercase tracking-widest text-xl text-[#252525]">
              Sistema de Análisis Activo
            </p>
            <p className="text-sm font-bold text-[#252525]">
              Sube un pliego en PDF o consulta sobre proveedores
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start animate-in fade-in slide-in-from-bottom-2 duration-300"
            }`}
          >
            <div
              className={`bubble ${
                msg.role === "user" ? "user" : "ai"
              } max-w-[90%] md:max-w-[80%]`}
            >
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center gap-3">
            <div className="bubble ai animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-[#e9d26a] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">
                Apex AI Analizando...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input de Chat */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <form
          onSubmit={handleSubmit}
          className="prompt_row !max-w-none shadow-sm focus-within:shadow-md transition-all duration-300"
        >
          <label className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 cursor-pointer transition-colors group">
            <span className="text-xl group-hover:scale-110 transition-transform">
              📎
            </span>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isLoading
                ? "La IA está procesando..."
                : "Escribe tu consulta aquí..."
            }
            className="flex-1 bg-transparent border-none outline-none text-[#252525] placeholder:text-gray-400 font-medium"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-gold !mt-0 !py-2 !px-8 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Enviar"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .markdown-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content strong {
          font-weight: 800;
          color: inherit;
        }
        /* Estilos de Tabla Mejorados */
        .markdown-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.5rem 0;
          font-size: 0.85rem;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #eee;
        }
        .markdown-content th {
          background-color: #252525;
          color: #e9d26a;
          padding: 14px;
          text-align: left;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .markdown-content td {
          border-bottom: 1px solid #f0f0f0;
          padding: 12px 14px;
          color: #333;
          vertical-align: top;
        }
        .markdown-content tr:last-child td {
          border-bottom: none;
        }
        .markdown-content tr:hover {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
}
