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
  
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100 text-slate-900`}
      >
      
        {children}
      </body>
    </html>
  );
}