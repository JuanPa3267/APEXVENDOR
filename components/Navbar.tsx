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

  return (
    <nav className="bg-[#252525] border-b border-[#e9d26a]/30 py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-white uppercase hover:opacity-80 transition-opacity"
        >
          Apex<span className="text-[#e9d26a]">Vendor</span>
        </Link>

        {/* Links de Navegación Dinámicos */}
        <div className="flex gap-6">
          {role === "Proveedor" && (
            <Link
              href="/dashboard/profile"
              className={`nav-link ${
                pathname === "/dashboard/profile" ? "active-gold" : ""
              }`}
            >
              Mi Perfil
            </Link>
          )}

          {role === "Admin" && (
            <Link
              href="/dashboard/chat"
              className={`nav-link ${
                pathname === "/dashboard/chat" ? "active-gold" : ""
              }`}
            >
              Apex Intelligence (Chat)
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] leading-none mb-1">
            Conectado como
          </p>
          <p className="text-[#e9d26a] font-bold text-sm">@{username}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 py-2 px-5 rounded-lg text-[10px] uppercase font-black transition-all duration-300"
          >
            Salir
          </button>
        </form>
      </div>

      <style jsx>{`
        .nav-link {
          color: #888;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          transition: all 0.3s ease;
          padding: 5px 0;
        }
        .nav-link:hover {
          color: #e9d26a;
        }
        .active-gold {
          color: #e9d26a;
          border-bottom: 2px solid #e9d26a;
        }
      `}</style>
    </nav>
  );
}
