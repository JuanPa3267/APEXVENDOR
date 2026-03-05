"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Coffee,
  DownloadCloud,
  FileDown,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getAuditRecords,
  getLoginLogs,
  getMasterLog,
  getProjectsSummary,
} from "./actions";

interface LogEntry {
  fecha: string;
  correo: string;
  usuario: string;
  nombre: string;
  rol: string;
}

interface ProjectMember {
  nombre: string;
  rol: string;
}

interface Project {
  id: string;
  nombre: string;
  cliente: string;
  descripcion: string;
  stack: string;
  estado: string;
  inicio: string | null;
  fin: string | null;
  miembros: ProjectMember[];
}

interface AuditData {
  best: { name: string; score: number }[];
  worst: { name: string; score: number }[];
  metricAverages: { name: string; score: number; providerCount: number }[];
  rawRecords: {
    fecha: string;
    proveedor: string;
    proyecto: string;
    metrica: string;
    puntaje: number;
  }[];
}

// --- CONSTANTS ---
const TIME_SLOTS = [
  "00-02",
  "02-04",
  "04-06",
  "06-08",
  "08-10",
  "10-12",
  "12-14",
  "14-16",
  "16-18",
  "18-20",
  "20-22",
  "22-00",
];

const COLORS = [
  "#e9d26a",
  "#c9b35a",
  "#a9944a",
  "#89753a",
  "#252525",
  "#3d3d3d",
  "#555",
  "#666",
];

// --- HELPERS ---
const getSlotIndex = (dateStr: string) => {
  if (dateStr === "Nunca") return -1;
  const date = new Date(dateStr);
  const hour = date.getHours();
  return Math.floor(hour / 2);
};

// --- COMPONENTS ---

const DonutChart = ({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) => {
  const [hovered, setHovered] = useState<{
    name: string;
    value: number;
  } | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="relative w-full flex flex-col items-center group">
      <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center p-4">
        <svg
          viewBox="-1.2 -1.2 2.4 2.4"
          className="w-full h-full -rotate-90 filter drop-shadow-xl"
        >
          {data.map((slice, i) => {
            if (slice.value === 0) return null;
            const startPercent = cumulativePercent;
            cumulativePercent += slice.value / total;
            const endPercent = cumulativePercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);

            const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(" ");

            return (
              <motion.path
                key={slice.name}
                d={pathData}
                fill={COLORS[i % COLORS.length]}
                whileHover={{ scale: 1.08, stroke: "#fff", strokeWidth: 0.03 }}
                onMouseEnter={() => setHovered(slice)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer transition-all"
              />
            );
          })}
          <circle cx="0" cy="0" r="0.75" fill="white" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.div
                key="hovered"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-3xl font-black text-[#bba955] tracking-tighter">
                  {hovered.value}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#252525] font-black">
                  {hovered.name}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl font-black text-[#252525] tracking-tighter">
                  {total}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-black">
                  Total
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <h4 className="mt-4 font-black text-[10px] uppercase tracking-[0.2em] text-[#252525]/40">
        {title}
      </h4>
    </div>
  );
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditData, setAuditData] = useState<AuditData>({
    best: [],
    worst: [],
    metricAverages: [],
    rawRecords: [],
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Actividad");

  const tabs = [
    {
      id: "Actividad",
      icon: <LayoutDashboard size={14} />,
      label: "Conexión",
    },
    { id: "Proyectos", icon: <Briefcase size={14} />, label: "Proyectos" },
    { id: "Auditoría", icon: <ShieldCheck size={14} />, label: "Desempeño" },
    {
      id: "Exportación",
      icon: <DownloadCloud size={14} />,
      label: "Reporte General",
    },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [logsData, projectsData, auditRecords] = await Promise.all([
        getLoginLogs(),
        getProjectsSummary(),
        getAuditRecords(),
      ]);
      setLogs(logsData);
      setProjects(projectsData);
      setAuditData(auditRecords);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString("es-CO");

    const logsToday = logs.filter((l) => {
      if (l.fecha === "Nunca") return false;
      return new Date(l.fecha).toLocaleDateString("es-CO") === todayStr;
    });

    const uniqueUsersHistorically = new Set(
      logs.map((l) => l.nombre).filter((n) => n !== ""),
    );
    const uniqueUsersToday = new Set(logsToday.map((l) => l.nombre));

    const loggedInCount = uniqueUsersToday.size;
    const notLoggedInCount = Math.max(
      0,
      uniqueUsersHistorically.size - loggedInCount,
    );

    const slotDistribution = TIME_SLOTS.map((slot, i) => {
      const count = logsToday.filter((l) => getSlotIndex(l.fecha) === i).length;
      return { name: slot, value: count };
    });

    const activityComparison = [
      { name: "Ingresaron", value: loggedInCount },
      { name: "Pendientes", value: notLoggedInCount },
    ];

    return {
      logsToday: logsToday.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      ),
      loggedInCount,
      notLoggedInCount,
      totalUsers: uniqueUsersHistorically.size,
      slotDistribution,
      activityComparison,
    };
  }, [logs]);

  const projectStats = useMemo(() => {
    const enCurso = projects.filter(
      (p) => p.estado?.toLowerCase() === "en curso",
    ).length;
    const completados = projects.filter(
      (p) => p.estado?.toLowerCase() === "completado",
    ).length;

    const statusDist = [
      { name: "En Curso", value: enCurso },
      { name: "Completado", value: completados },
    ];

    const resourceDist = projects.map((p) => ({
      name: p.nombre,
      value: p.miembros.length,
    }));

    return {
      total: projects.length,
      statusDist,
      resourceDist,
      totalMembers: projects.reduce((acc, p) => acc + p.miembros.length, 0),
    };
  }, [projects]);

  const sanitizeCSVField = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .trim()
      .replace(/[\n\r]+/g, " ") // Clean newlines
      .replace(/"/g, '""') // Escape quotes
      .replace(/,/g, ";");
  };

  const triggerCSVDownload = (
    headers: string[],
    rows: string[][],
    filename: string,
  ) => {
    const content =
      "sep=;\n" +
      [
        headers.join(";"),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(";")),
      ].join("\n");

    const blob = new Blob(["\uFEFF", content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMasterExport = async () => {
    try {
      setIsExporting(true);
      const data = await getMasterLog();

      const headers = [
        "ID Usuario",
        "Correo",
        "Username",
        "Nombre/Razon Social",
        "Roles",
        "Estado Cuenta",
        "Ultimo Acceso",
        "NIT/ID",
        "Tipo Proveedor",
        "Telefono",
        "Ciudad",
        "Score Global",
        "Proyectos Asignados",
        "Tecnologías (Stacks)",
        "Fecha Registro",
      ];

      const rows = data.map((u) => [
        sanitizeCSVField(u.id),
        sanitizeCSVField(u.correo),
        sanitizeCSVField(u.username),
        sanitizeCSVField(u.nombre),
        sanitizeCSVField(u.roles),
        sanitizeCSVField(u.estado),
        sanitizeCSVField(u.ultimoAcceso),
        sanitizeCSVField(u.nit),
        sanitizeCSVField(u.tipo),
        sanitizeCSVField(u.telefono),
        sanitizeCSVField(u.ciudad),
        u.score.toString(),
        sanitizeCSVField(u.proyectos),
        sanitizeCSVField(u.stacks),
        sanitizeCSVField(u.creadoEn),
      ]);

      triggerCSVDownload(headers, rows, "SISTEMA_COMPLETO_APEX");
    } catch (error) {
      console.error("Master Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = async (
    data: LogEntry[] = logs,
    prefix: string = "auditoria",
  ) => {
    setIsExporting(true);
    const headers = ["Fecha", "Hora", "Correo", "Usuario", "Nombre", "Rol"];
    const rows = data.map((log) => {
      let f = "Nunca",
        h = "";
      if (log.fecha !== "Nunca") {
        const d = new Date(log.fecha);
        f = d.toLocaleDateString("es-CO");
        h = d.toLocaleTimeString("es-CO");
      }
      return [
        f,
        h,
        sanitizeCSVField(log.correo),
        sanitizeCSVField(log.usuario),
        sanitizeCSVField(log.nombre),
        sanitizeCSVField(log.rol),
      ];
    });

    triggerCSVDownload(headers, rows, prefix);
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-[#fafae6] p-6 lg:p-12 font-sans selection:bg-[#e9d26a] selection:text-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#252525] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-black/20 border-t-2 border-white/10">
            <BarChart3 size={40} className="text-[#e9d26a]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-5xl font-black text-[#252525] tracking-tighter leading-none mb-2">
              Dashboards
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Centro de Reportes • {today}
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            disabled={isLoading}
            className="flex-1 lg:flex-none px-8 py-4 bg-white text-[#252525] border-2 border-gray-100 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:border-[#e9d26a] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="text-[#bba955]" />
            )}
            Actualizar Datos
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 mb-12 bg-white/50 p-2 rounded-[2.5rem] w-max border border-white/20 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
              activeTab === tab.id
                ? "text-black"
                : "text-gray-400 hover:text-[#252525] hover:bg-white"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-[#e9d26a] rounded-[2rem] shadow-lg shadow-[#e9d26a]/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "Actividad" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Column: Charts & Metrics */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                  {/* Main Comparison Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Donut 1: Daily Participation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-black/5 border border-gray-50 flex flex-col items-center"
                    >
                      <DonutChart
                        data={stats.activityComparison}
                        title="Participación Hoy"
                      />
                      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-[#fafae6] p-4 rounded-3xl text-center border border-[#e9d26a]/10">
                          <p className="text-[8px] uppercase font-black text-gray-400 mb-1">
                            Ingresaron
                          </p>
                          <p className="text-2xl font-black text-[#252525]">
                            {stats.loggedInCount}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-3xl text-center">
                          <p className="text-[8px] uppercase font-black text-gray-400 mb-1">
                            Pendientes
                          </p>
                          <p className="text-2xl font-black text-gray-300">
                            {stats.notLoggedInCount}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Donut 2: Hourly Slots */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-black/5 border border-gray-50 flex flex-col items-center"
                    >
                      <DonutChart
                        data={stats.slotDistribution}
                        title="Flujo Horario"
                      />
                      <div className="mt-8 flex flex-wrap justify-center gap-2">
                        {stats.slotDistribution.map((s, i) =>
                          s.value > 0 ? (
                            <div
                              key={s.name}
                              className="px-3 py-1 rounded-full bg-[#252525]/5 text-[9px] font-black uppercase tracking-tighter flex items-center gap-2"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background: COLORS[i % COLORS.length],
                                }}
                              ></span>
                              {s.name} ({s.value})
                            </div>
                          ) : null,
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Big Summary Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#252525] to-[#000] p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="text-center md:text-left">
                        <h3 className="text-4xl font-black tracking-tighter mb-2">
                          Resumen de{" "}
                          <span className="text-[#e9d26a]">Impacto</span>
                        </h3>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">
                          Cálculo basado en base total de usuarios
                        </p>
                      </div>
                      <div className="flex gap-12">
                        <div className="text-center">
                          <p className="text-[5rem] font-black leading-none text-[#e9d26a] tracking-tighter">
                            {stats.totalUsers > 0
                              ? Math.round(
                                  (stats.loggedInCount / stats.totalUsers) *
                                    100,
                                )
                              : 0}
                            <span className="text-3xl"> %</span>
                          </p>
                          <p className="text-[9px] uppercase font-black text-white/40 tracking-widest mt-2">
                            Retención de Hoy
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#e9d26a]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  </motion.div>
                </div>

                {/* Right Column: Recent List */}
                <div className="xl:col-span-4 flex flex-col gap-10">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[4.5rem] shadow-2xl border border-gray-100 flex flex-col h-full overflow-hidden"
                  >
                    <div className="p-10 pb-6 border-b border-gray-50">
                      <h3 className="text-2xl font-black text-[#252525] tracking-tighter mb-1">
                        Timeline
                      </h3>
                      <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest leading-none">
                        Últimos ingresos registrados
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar min-h-[400px]">
                      <AnimatePresence mode="popLayout">
                        {stats.logsToday.length > 0 ? (
                          stats.logsToday.slice(0, 30).map((log, i) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: i * 0.03 }}
                              key={`${log.usuario}-${i}`}
                              className="group bg-white p-5 rounded-[2.5rem] border border-gray-50 flex items-center justify-between hover:bg-[#fafae6] hover:border-[#e9d26a]/40 transition-all cursor-default"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border-b-4 ${
                                    log.rol.toLowerCase().includes("admin")
                                      ? "bg-[#252525] border-black text-[#e9d26a]"
                                      : "bg-[#e9d26a]/10 border-[#e9d26a]/20 text-[#252525]"
                                  }`}
                                >
                                  {log.rol.toLowerCase().includes("admin") ? (
                                    <ShieldCheck size={20} />
                                  ) : (
                                    <User size={20} />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-[#252525] text-sm group-hover:text-black transition-colors">
                                    {log.nombre}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                    {log.rol}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-[#252525]">
                                  {new Date(log.fecha).toLocaleTimeString(
                                    "es-CO",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                                <p className="text-[9px] font-black text-[#bba955] uppercase tracking-tighter">
                                  Entrada
                                </p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                            <Coffee size={48} className="mb-4 text-[#252525]" />
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              Sin datos hoy
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="p-8 bg-[#252525] text-center">
                      <p className="text-[8px] font-black text-[#e9d26a] uppercase tracking-[0.3em]">
                        Corte automático cada 2 horas
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => downloadCSV(stats.logsToday, "actividad_hoy")}
                className="mt-10 w-full py-6 bg-white border-2 border-dashed border-[#e9d26a]/30 rounded-[3rem] text-[#bba955] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#fafae6] hover:border-[#e9d26a] transition-all"
              >
                <FileDown size={18} /> Exportar Datos de Hoy (CSV)
              </motion.button>
            </>
          )}

          {activeTab === "Proyectos" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Status & Resources */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Status Donut */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-black/5 border border-gray-50 flex flex-col items-center"
                    >
                      <DonutChart
                        data={projectStats.statusDist}
                        title="Estados de Proyectos"
                      />
                      <div className="mt-8 flex gap-4 w-full">
                        <div className="flex-1 bg-[#252525]/5 p-4 rounded-3xl text-center">
                          <p className="text-[8px] uppercase font-black text-gray-400 mb-1">
                            En Curso
                          </p>
                          <p className="text-2xl font-black text-[#252525]">
                            {
                              projectStats.statusDist.find(
                                (s) => s.name === "En Curso",
                              )?.value
                            }
                          </p>
                        </div>
                        <div className="flex-1 bg-[#252525]/5 p-4 rounded-3xl text-center">
                          <p className="text-[8px] uppercase font-black text-gray-400 mb-1">
                            Completados
                          </p>
                          <p className="text-2xl font-black text-[#e9d26a]">
                            {
                              projectStats.statusDist.find(
                                (s) => s.name === "Completado",
                              )?.value
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Resources Donut */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-black/5 border border-gray-50 flex flex-col items-center"
                    >
                      <DonutChart
                        data={projectStats.resourceDist}
                        title="Miembros por Proyecto"
                      />
                      <p className="mt-6 text-[9px] uppercase font-black text-gray-300 tracking-[0.2em]">
                        Carga de Trabajo Actual
                      </p>
                    </motion.div>
                  </div>

                  {/* Highlight Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#252525] p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div>
                        <h3 className="text-4xl font-black tracking-tighter mb-2">
                          Recursos{" "}
                          <span className="text-[#e9d26a]">Activos</span>
                        </h3>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">
                          Base total de participaciones vigentes
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[5rem] font-black leading-none text-[#e9d26a] tracking-tighter">
                          {projectStats.totalMembers}
                        </span>
                        <span className="text-white/40 font-black text-xs uppercase">
                          Personas
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#e9d26a]/5 to-transparent"></div>
                  </motion.div>
                </div>

                {/* Vertical Project List */}
                <div className="xl:col-span-4 flex flex-col gap-10">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[4.5rem] shadow-2xl border border-gray-100 h-full overflow-hidden flex flex-col"
                  >
                    <div className="p-10 pb-6 border-b border-gray-50">
                      <h3 className="text-2xl font-black text-[#252525] tracking-tighter mb-1">
                        Proyectos
                      </h3>
                      <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest leading-none">
                        Estado y Asignaciones
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar min-h-[400px]">
                      {projects.length > 0 ? (
                        projects.map((p, i) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-5 rounded-[2.5rem] bg-gray-50 border border-transparent hover:border-[#e9d26a]/40 hover:bg-[#fafae6] transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-black text-[#252525] text-sm tracking-tight capitalize">
                                  {p.nombre}
                                </h4>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                  {p.cliente}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                  p.estado?.toLowerCase() === "completado"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-[#e2d591]/20 text-[#bba955]"
                                }`}
                              >
                                {p.estado}
                              </span>
                            </div>
                            <div className="flex items-center -space-x-3 overflow-hidden mt-4">
                              {p.miembros.slice(0, 5).map((m, idx) => (
                                <div
                                  key={idx}
                                  title={`${m.nombre} - ${m.rol}`}
                                  className="w-8 h-8 rounded-full bg-[#252525] border-2 border-white flex items-center justify-center text-[10px] text-white font-black"
                                >
                                  {m.nombre.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {p.miembros.length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] text-gray-500 font-black">
                                  +{p.miembros.length - 5}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 text-center opacity-30 italic">
                          No hay proyectos registrados
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Specific Export for Projects */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsExporting(true);
                  const headers = [
                    "Proyecto",
                    "Cliente",
                    "Estado",
                    "Fecha Inicio",
                    "Fecha Fin",
                    "Stack",
                    "Cant. Miembros",
                  ];
                  const rows = projects.map((p) => [
                    sanitizeCSVField(p.nombre),
                    sanitizeCSVField(p.cliente),
                    sanitizeCSVField(p.estado || "N/A"),
                    sanitizeCSVField(
                      p.inicio
                        ? new Date(p.inicio).toLocaleDateString("es-CO")
                        : "No definida",
                    ),
                    sanitizeCSVField(
                      p.fin
                        ? new Date(p.fin).toLocaleDateString("es-CO")
                        : "En curso",
                    ),
                    sanitizeCSVField(p.stack || "N/A"),
                    p.miembros.length.toString(),
                  ]);
                  triggerCSVDownload(headers, rows, "reporte_proyectos");
                  setIsExporting(false);
                }}
                className="mt-10 w-full py-6 bg-white border-2 border-dashed border-[#e9d26a]/30 rounded-[3rem] text-[#bba955] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#fafae6] hover:border-[#e9d26a] transition-all"
              >
                <FileDown size={18} /> Exportar Reporte de Proyectos (CSV)
              </motion.button>
            </>
          )}

          {activeTab === "Auditoría" && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Global Rankings */}
                <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Top Performers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <Trophy size={32} className="text-[#e9d26a]" />
                      <div>
                        <h3 className="text-xl font-black text-[#252525] tracking-tight">
                          Top Performers
                        </h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                          Mejores Calificaciones Globales
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {auditData.best.length > 0 ? (
                        auditData.best.map((item, i) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-[#e9d26a] text-black font-black text-[10px] flex items-center justify-center">
                                {i + 1}
                              </span>
                              <span className="font-black text-[#252525] text-xs capitalize">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-black text-[#bba955] text-lg">
                              {item.score.toFixed(1)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="py-10 text-center opacity-30 italic">
                          Sin datos de evaluación
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Lowest Performers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <AlertTriangle size={32} className="text-red-400" />
                      <div>
                        <h3 className="text-xl font-black text-[#252525] tracking-tight">
                          Áreas de Mejora
                        </h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                          Menores Calificaciones Globales
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {auditData.worst.length > 0 ? (
                        auditData.worst.map((item, i) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-black text-[10px] flex items-center justify-center">
                                {i + 1}
                              </span>
                              <span className="font-black text-[#252525] text-xs capitalize">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-black text-red-400 text-lg">
                              {item.score.toFixed(1)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="py-10 text-center opacity-30 italic">
                          Sin datos críticos
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Metric Performance */}
                <div className="xl:col-span-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#252525] p-12 rounded-[4rem] shadow-2xl text-white"
                  >
                    <h3 className="text-2xl font-black tracking-tight mb-2">
                      Desempeño por{" "}
                      <span className="text-[#e9d26a]">Métrica</span>
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em] mb-10">
                      Promedio de resultados por categoría de evaluación
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {auditData.metricAverages.map((m, i) => (
                        <div
                          key={m.name}
                          className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-black text-[10px] uppercase tracking-widest text-[#e9d26a] mb-1">
                                {m.name}
                              </h4>
                              <p className="text-[8px] font-black text-white/30 uppercase tracking-tighter">
                                {m.providerCount}{" "}
                                {m.providerCount === 1
                                  ? "proveedor medido"
                                  : "proveedores medidos"}
                              </p>
                            </div>
                            <span className="text-2xl font-black">
                              {m.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(m.score / 5) * 100}%` }}
                              className="bg-[#e9d26a] h-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Export Audit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsExporting(true);
                  const headers = [
                    "Fecha",
                    "Proveedor",
                    "Proyecto",
                    "Métrica",
                    "Puntaje",
                  ];
                  const rows = auditData.rawRecords.map((r) => [
                    sanitizeCSVField(r.fecha),
                    sanitizeCSVField(r.proveedor),
                    sanitizeCSVField(r.proyecto),
                    sanitizeCSVField(r.metrica),
                    r.puntaje.toString(),
                  ]);
                  triggerCSVDownload(
                    headers,
                    rows,
                    "reporte_auditoria_completo",
                  );
                  setIsExporting(false);
                }}
                className="mt-10 w-full py-6 bg-white border-2 border-dashed border-[#e9d26a]/30 rounded-[3rem] text-[#bba955] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#fafae6] hover:border-[#e9d26a] transition-all"
              >
                <FileDown size={18} /> Exportar Análisis de Auditoría (CSV)
              </motion.button>
            </>
          )}

          {activeTab === "Exportación" && (
            <div className="bg-[#252525] p-20 rounded-[4rem] shadow-2xl text-center border border-white/5">
              <BarChart3 size={64} className="mx-auto mb-6 text-[#e9d26a]" />
              <h3 className="text-2xl font-black text-[#e9d26a] uppercase tracking-widest mb-4">
                Reporte General
              </h3>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em] mb-12 max-w-md mx-auto">
                Incluye datos de conexión, proyectos y desempeño de los
                proveedores.
              </p>
              <button
                onClick={handleMasterExport}
                disabled={isExporting}
                className="px-10 py-5 bg-[#e9d26a] text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#e9d26a]/10 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generando...
                  </>
                ) : (
                  <>
                    <FileDown size={16} /> Descargar Log Maestro Actual
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e2e2;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e9d26a;
        }
      `}</style>
    </div>
  );
}
