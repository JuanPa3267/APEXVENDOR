import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApexVendor | AI Intelligence Terminal",
  description:
    "Plataforma inteligente de gestión de proveedores y licitaciones.",
  icons: {
    // Esto buscará favicon.ico o icon.png en la carpeta /public
    icon: "/favicon.ico",
    // Opcional: Icono para cuando guardan la web en iPhone
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true} // <--- Añade esto aquí
        className={`${geistSans.variable} ${geistMono.variable} antialiased no-scrollbar`}
      >
        {children}
      </body>
    </html>
  );
}
