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

// Personalizamos los metadatos para Altairis
export const metadata: Metadata = {
  title: "Altairis | Gestión Hotelera",
  description: "Sistema avanzado de administración de reservas e inventarios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Cambiamos el idioma a español para mejores prácticas de SEO y accesibilidad
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100 text-slate-900`}
      >
        {/* Aquí puedes envolver los children con proveedores de contexto (AuthContext) más adelante */}
        {children}
      </body>
    </html>
  );
}