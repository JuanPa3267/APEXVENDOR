import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;
  const username = request.cookies.get("username")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  const { pathname } = request.nextUrl;

  // 1. Si no hay sesión, nadie entra al dashboard
  if (pathname.startsWith("/dashboard") && (!sessionId || !username)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Si ya están logueados, no necesitan ver el login
  if (pathname === "/login" && sessionId) {
    // Redirección inteligente incluso desde el login
    return userRole === "Admin"
      ? NextResponse.redirect(new URL("/dashboard/chat", request.url))
      : NextResponse.redirect(new URL("/dashboard/profile", request.url));
  }

  // 3. REGLA DE ORO: Admin siempre va al Chat
  // Si un Admin intenta entrar a la raíz del dashboard o al perfil, va al chat
  if (
    (pathname === "/dashboard" || pathname === "/dashboard/profile") &&
    userRole === "Admin"
  ) {
    return NextResponse.redirect(new URL("/dashboard/chat", request.url));
  }

  // 4. PROTECCIÓN DEL CHAT: Solo Admins
  if (pathname.startsWith("/dashboard/chat") && userRole !== "Admin") {
    return NextResponse.redirect(
      new URL("/dashboard/profile?error=unauthorized", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
