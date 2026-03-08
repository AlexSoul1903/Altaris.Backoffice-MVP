import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800">
          Altairis <span className="text-amber-500">.</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="block p-3 rounded-lg bg-slate-800 text-white">Tablero</a>
          <a href="/dashboard/hotels" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Hoteles</a>
          <a href="/dashboard/reservations" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Reservas</a>
          <a href="/dashboard/inventory" className="block p-3 rounded-lg hover:bg-slate-800 transition-colors">Inventario</a>
        </nav>

        <div className="p-6 border-t border-slate-800 text-sm text-slate-400">
          Admin: Alex Frias
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}