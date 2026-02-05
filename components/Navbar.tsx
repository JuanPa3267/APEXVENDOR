"use client";

import { logoutAction } from "@/app/logout/action";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  username: string;
  role: string;
}

export default function Navbar({ username, role }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = role === "Admin";
  const isProveedor = role === "Proveedor";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Componente del Punto Radar para reutilizar con animación sliding
  const ActiveIndicator = () => (
    <motion.div
      layoutId="active-dot"
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="relative flex h-2 w-2 mr-2"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e9d26a] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e9d26a] shadow-[0_0_10px_#e9d26a]"></span>
    </motion.div>
  );

  return (
    <nav className="bg-[#1a1a1a] py-4 px-8 flex justify-between items-center shadow-2xl sticky top-0 z-50">
      <div className="flex items-center gap-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-white uppercase hover:text-[#e9d26a] transition-colors"
        >
          Apex<span className="text-[#e9d26a]">Vendor</span>
        </Link>

        {/* Links de Navegación Dinámicos (Desktop) */}
        <div className="hidden md:flex gap-8 text-[#f4f4f4]">
          {/* Link: Mi Perfil - SOLO PROVEEDORES */}
          {isProveedor && (
            <Link
              href="/dashboard/profile"
              className={`nav-link flex items-center ${
                pathname === "/dashboard/profile" ? "active-gold" : ""
              }`}
            >
              {pathname === "/dashboard/profile" && <ActiveIndicator />}
              Mi Perfil
              {pathname === "/dashboard/profile" && (
                <motion.div
                  layoutId="active-underline"
                  className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-[#e9d26a] shadow-[0_0_15px_rgba(233,210,106,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )}

          {/* Links Exclusivos de Admin */}
          {isAdmin && (
            <>
              <Link
                href="/dashboard/chat"
                className={`nav-link flex items-center ${
                  pathname === "/dashboard/chat" ? "active-gold" : ""
                }`}
              >
                {pathname === "/dashboard/chat" && <ActiveIndicator />}
                Intelligence Chat
                {pathname === "/dashboard/chat" && (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-[#e9d26a] shadow-[0_0_15px_rgba(233,210,106,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>

              <Link
                href="/dashboard/projects"
                className={`nav-link flex items-center ${
                  pathname.startsWith("/dashboard/projects")
                    ? "active-gold"
                    : ""
                }`}
              >
                {pathname.startsWith("/dashboard/projects") && (
                  <ActiveIndicator />
                )}
                Proyectos
                {pathname.startsWith("/dashboard/projects") && (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-[#e9d26a] shadow-[0_0_15px_rgba(233,210,106,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>

              <Link
                href="/dashboard/vendors"
                className={`nav-link flex items-center ${
                  pathname.startsWith("/dashboard/vendors") ? "active-gold" : ""
                }`}
              >
                {pathname.startsWith("/dashboard/vendors") && (
                  <ActiveIndicator />
                )}
                Directorio Vendors
                {pathname.startsWith("/dashboard/vendors") && (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-[#e9d26a] shadow-[0_0_15px_rgba(233,210,106,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
              <Link
                href="/dashboard/rankings"
                className={`nav-link flex items-center ${
                  pathname.startsWith("/dashboard/rankings")
                    ? "active-gold"
                    : ""
                }`}
              >
                {pathname.startsWith("/dashboard/rankings") && (
                  <ActiveIndicator />
                )}
                Rankings
                {pathname.startsWith("/dashboard/rankings") && (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-[#e9d26a] shadow-[0_0_15px_rgba(233,210,106,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Info de Usuario (Desktop) */}
        <div className="flex items-center gap-4 hidden md:flex">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.15em] leading-none mb-1.5">
              Sesión Activa
            </p>
            <div className="flex items-center gap-2 justify-end">
              {isAdmin && (
                <span className="bg-[#e9d26a] text-black text-[9px] font-black px-2 py-0.5 rounded-sm shadow-sm">
                  ADMIN
                </span>
              )}
              <p className="text-[#f4f4f4] font-bold text-sm tracking-tight">
                @{username}
              </p>
            </div>
          </div>
        </div>

        {/* Botón Salir (Desktop) */}
        <div className="hidden md:block">
          <form action={logoutAction}>
            <button
              type="submit"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("apex_chat_history");
                }
              }}
              className="group relative overflow-hidden bg-transparent border border-red-500/50 hover:border-red-500 py-2 px-6 rounded-xl transition-all cursor-pointer duration-300"
            >
              <span className="relative z-10 text-red-500 group-hover:text-white text-[10px] font-black uppercase tracking-widest">
                Salir
              </span>
              <div className="absolute inset-0 bg-[#EB2328] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>
        </div>

        {/* HAMBURGER MENU (Mobile) */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-[#e9d26a] transition-colors p-2"
          >
            {isMobileMenuOpen ? (
              // X icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[72px] left-0 w-full bg-[#1a1a1a] border-t border-[#333] shadow-2xl flex flex-col p-6 gap-4 md:hidden"
          >
            {isProveedor && (
              <Link
                href="/dashboard/profile"
                className="nav-link-mobile"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Mi Perfil
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  href="/dashboard/chat"
                  className="nav-link-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Intelligence Chat
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="nav-link-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Proyectos
                </Link>
                <Link
                  href="/dashboard/vendors"
                  className="nav-link-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Directorio Vendors
                </Link>
                <Link
                  href="/dashboard/rankings"
                  className="nav-link-mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Rankings
                </Link>
              </>
            )}

            <div className="h-[1px] bg-[#333] w-full my-2" />

            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.15em] leading-none mb-1.5">
                  Sesión Activa
                </p>
                <p className="text-[#f4f4f4] font-bold text-sm tracking-tight">
                  @{username}
                </p>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("apex_chat_history");
                    }
                  }}
                  className="text-red-500 font-bold uppercase text-xs hover:text-red-400 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .nav-link {
          color: #f4f4f4;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          transition: all 0.2s ease;
          padding: 8px 0;
          position: relative;
          opacity: 0.9;
        }
        .nav-link:hover {
          color: #e9d26a;
          opacity: 1;
        }
        .active-gold {
          color: #e9d26a !important;
          opacity: 1;
        }
        .nav-link-mobile {
          color: #f4f4f4;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 1.5px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nav-link-mobile:hover {
          color: #e9d26a;
          padding-left: 10px;
        }
      `}</style>
    </nav>
  );
}
