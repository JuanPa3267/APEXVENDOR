"use client";

import { logoutAction } from "@/app/logout/action";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  username: string;
  role: string;
}

export default function Navbar({ username, role }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = role === "Admin";
  const isProveedor = role === "Proveedor";

  // Componente del Punto Radar para reutilizar
  const ActiveIndicator = () => (
    <div className="relative flex h-2 w-2 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e9d26a] opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e9d26a] shadow-[0_0_10px_#e9d26a]"></span>
    </div>
  );

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#e9d26a]/40 py-4 px-8 flex justify-between items-center shadow-2xl sticky top-0 z-50">
      <div className="flex items-center gap-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-white uppercase hover:text-[#e9d26a] transition-colors"
        >
          Apex<span className="text-[#e9d26a]">Vendor</span>
        </Link>

        {/* Links de Navegación Dinámicos */}
        <div className="flex gap-8 text-[#f4f4f4]">
          {/* Link: Mi Perfil - SOLO PROVEEDORES */}
          {isProveedor && (
            <Link
              href="/dashboard/profile"
              className={`nav-link flex items-center ${pathname === "/dashboard/profile" ? "active-gold" : ""
                }`}
            >
              {pathname === "/dashboard/profile" && <ActiveIndicator />}
              Mi Perfil
            </Link>
          )}

          {/* Links Exclusivos de Admin */}
          {isAdmin && (
            <>
              <Link
                href="/dashboard/chat"
                className={`nav-link flex items-center ${pathname === "/dashboard/chat" ? "active-gold" : ""
                  }`}
              >
                {pathname === "/dashboard/chat" && <ActiveIndicator />}
                Intelligence Chat
              </Link>

              <Link
                href="/dashboard/projects"
                className={`nav-link flex items-center ${pathname.startsWith("/dashboard/projects") ? "active-gold" : ""
                  }`}
              >
                {pathname.startsWith("/dashboard/projects") && <ActiveIndicator />}
                Proyectos
              </Link>

              <Link
                href="/dashboard/vendors"
                className={`nav-link flex items-center ${pathname.startsWith("/dashboard/vendors") ? "active-gold" : ""
                  }`}
              >
                {pathname.startsWith("/dashboard/vendors") && (
                  <ActiveIndicator />
                )}
                Directorio Vendors
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Info de Usuario */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
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

        {/* Botón Salir */}
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
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      </div>

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
        .active-gold::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #e9d26a;
          box-shadow: 0 0 12px rgba(233, 210, 106, 0.6);
        }
      `}</style>
    </nav>
  );
}
