"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Estados para la información del usuario
  const [userRole, setUserRole] = useState<string>("Agente");
  const [userEmail, setUserEmail] = useState<string>("usuario@altairis.com");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const token = localStorage.getItem("altairis_token");
    const role = localStorage.getItem("altairis_role") || "Agente"; // Leemos el rol
    const email = localStorage.getItem("altairis_email") || "usuario@altairis.com";

    if (!token) {
      router.push("/login");
    } else {
      setUserRole(role);
      setUserEmail(email);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("altairis_token");
    localStorage.removeItem("altairis_role");
    localStorage.removeItem("altairis_email");
    router.push("/login");
  };

  if (!isMounted) return null;

  // 1. Definimos los módulos y a qué roles pertenecen
  const navItems = [
    { name: "Tablero Principal", path: "/dashboard", icon: "📊", allowedRoles: ["Admin", "Administrador", "Agente", "Agent"] },
    { name: "Catálogo de Hoteles", path: "/dashboard/hotels", icon: "🏨", allowedRoles: ["Admin", "Administrador"] },
    { name: "Tipos de Habitación", path: "/dashboard/room-types", icon: "🛏️", allowedRoles: ["Admin", "Administrador"] },
    { name: "Inventario", path: "/dashboard/inventory", icon: "📅", allowedRoles: ["Admin", "Administrador", "Agente", "Agent"] },
    { name: "Reservas", path: "/dashboard/reservations", icon: "📝", allowedRoles: ["Admin", "Administrador", "Agente", "Agent"] },
    { name: "Usuarios", path: "/dashboard/users", icon: "👥", allowedRoles: ["Admin", "Administrador"] }, 
  ];

  // 2. Filtramos el menú: Solo dejamos los que incluyan el rol actual del usuario
  const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(userRole));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      <aside className="w-72 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
               <Link href="/dashboard">Altairis</Link> 
               <span className="text-amber-500">.</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {/* 3. Renderizamos el menú ya filtrado */}
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-amber-500 text-slate-900 shadow-md" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          Altairis MVP v1.0
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-gray-200 border-b border-slate-200 flex items-center justify-between px-10 z-10 shadow-sm">
          
          <div className="text-slate-400 font-medium text-sm flex items-center gap-2 ">
          
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="text-right hidden md:block">
           
                <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{userEmail.split('@')[0]}</p>
                <p className="text-xs font-semibold text-amber-600 capitalize">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm uppercase">
                {userEmail.charAt(0)}
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-900 truncate">{userEmail}</p>
                </div>
                <div className="p-2">
                  {/* ENLACE A CONFIGURACIÓN DE USUARIO */}
                  <Link 
                    href="/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Configuración
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          {children}
        </main>

      </div>
    </div>
  );
}