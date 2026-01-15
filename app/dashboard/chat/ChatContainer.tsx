"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendMessageAction, uploadPdfAction } from "./actions";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isInitialState = messages.length === 0;

  // Cargar historial al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("apex_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing chat history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar historial cuando cambia
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("apex_chat_history", JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

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
        { role: "ai", content: "❌ Error de conexión." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await uploadPdfAction(formData);
      if (result.error) alert(result.error);
      else if (result.summary) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: `📄 Analizando: ${result.fileName}` },
          { role: "ai", content: result.summary },
        ]);
      }
    } catch (error) {
      alert("Error procesando PDF.");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("apex_chat_history");
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* AREA DE MENSAJES: Corregido el centrado vertical absoluto */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-6 custom-scrollbar ${
          isInitialState
            ? "flex flex-col items-center justify-center -mt-20"
            : "pt-4 pb-40"
        }`}
      >
        {isInitialState ? (
          <div className="w-full max-w-3xl flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            <h1 className="text-6xl font-black text-[#252525] uppercase tracking-tighter mb-2 text-center">
              ¿Qué analizamos <span className="text-[#bba955]">hoy?</span>
            </h1>
            <p className="text-gray-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-10">
              Apex Intelligence Terminal
            </p>

            {/* El formulario dentro del centrado para el estado inicial */}
            <form
              onSubmit={handleSubmit}
              className="prompt_row shadow-2xl items-center bg-white border border-gray-100 py-4 px-6 w-full"
            >
              <label className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer transition-colors group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400 group-hover:text-[#bba955] transition-all"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 1 1 4.243 4.243l-8.94 8.94a1.5 1.5 0 1 1-2.122-2.122l8-8"
                  />
                </svg>
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
                placeholder="Describe el proyecto o sube un PDF..."
                className="flex-1 bg-transparent border-none outline-none text-[#252525] placeholder:text-gray-400 font-medium text-lg ml-2"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#252525] text-[#e9d26a] hover:bg-black transition-all active:scale-90 shadow-lg"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#e9d26a] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                )}
              </button>
            </form>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[
                "IA Multimodal",
                "Ranking de Proveedores",
                "Análisis de Pliegos",
              ].map((tag) => (
                <div
                  key={tag}
                  className="px-5 py-2 bg-white/50 backdrop-blur-sm shadow-sm border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MODO CHAT ACTIVO */
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start animate-in slide-in-from-bottom-4"
                }`}
              >
                <div
                  className={`bubble ${
                    msg.role === "user"
                      ? "user shadow-md"
                      : "ai shadow-sm border border-gray-100"
                  } max-w-[90%] md:max-w-[85%]`}
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
              <div className="flex justify-start">
                <div className="bubble ai animate-pulse border border-gray-100 flex gap-2">
                  <span className="w-2 h-2 bg-[#e9d26a] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#e9d26a] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-[#e9d26a] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INPUT FIJO SOLO CUANDO HAY MENSAJES */}
      {!isInitialState && (
        <>
          <div className="absolute bottom-0 left-0 w-full p-8 bg-[#fafae6]/40 backdrop-blur-xl border-t border-black/5 z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <form
              onSubmit={handleSubmit}
              className="prompt_row shadow-2xl items-center bg-white border border-gray-200 py-2.5 px-4 mx-auto max-w-5xl"
            >
              <button
                type="button"
                onClick={clearHistory}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mr-1"
                title="Borrar historial"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
              <label className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer transition-colors group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400 group-hover:text-[#bba955] transition-all"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94a3 3 0 1 1 4.243 4.243l-8.94 8.94a1.5 1.5 0 1 1-2.122-2.122l8-8"
                  />
                </svg>
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
                placeholder="Escribe tu consulta..."
                className="flex-1 bg-transparent border-none outline-none text-[#252525] placeholder:text-gray-400 font-medium text-lg ml-2"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#252525] text-[#e9d26a] hover:bg-black transition-all active:scale-90"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#e9d26a] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9d26a;
          border-radius: 10px;
        }
        .markdown-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.5rem 0;
          font-size: 0.85rem;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #eee;
        }
        .markdown-content th {
          background-color: #252525;
          color: #e9d26a;
          padding: 16px;
          text-align: left;
          font-weight: 900;
          text-transform: uppercase;
        }
        .markdown-content td {
          border-bottom: 1px solid #f0f0f0;
          padding: 14px;
          color: #333;
        }
      `}</style>
    </div>
  );
}
