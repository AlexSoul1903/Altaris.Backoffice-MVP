"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface RecentActivity {
  id: string;
  guest: string;
  room: string; 
  status: string;
  date: string;
}

interface DashboardData {
  activeReservations: number;
  availableRooms: number;
  pendingCheckIns: number;
  monthlyReservations: number; 
  recentActivity: RecentActivity[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estado para el rol del usuario
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // 1. Obtenemos el rol para filtrar las acciones
    const role = localStorage.getItem("altairis_role") || "Agente";
    setUserRole(role);

    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/Dashboard/summary");
        setData(response.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        setError(axiosError.response?.data?.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. Definimos las acciones rápidas con sus permisos correspondientes
  const quickActions = [
    { 
      label: "Nueva Reserva", 
      path: "/dashboard/reservations", 
      style: "bg-slate-50 text-slate-700 hover:bg-slate-100",
      allowedRoles: ["Admin", "Administrador", "Agente", "Agent"] 
    },
    { 
      label: "Añadir Hotel", 
      path: "/dashboard/hotels", 
      style: "bg-slate-50 text-slate-700 hover:bg-slate-100",
      allowedRoles: ["Admin", "Administrador"] 
    },
    { 
      label: "Ver Inventario", 
      path: "/dashboard/inventory", 
      style: "bg-slate-50 text-slate-700 hover:bg-slate-100",
      allowedRoles: ["Admin", "Administrador", "Agente", "Agent"] 
    },
    { 
      label: "Gestionar Usuarios", 
      path: "/dashboard/users", 
      style: "bg-[#0f172a] text-white hover:bg-slate-800 shadow-md",
      allowedRoles: ["Admin", "Administrador"] 
    },
  ];

  // Filtramos las acciones según el rol del usuario logueado
  const filteredActions = quickActions.filter(action => action.allowedRoles.includes(userRole));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100 shadow-sm">
          <h2 className="font-bold text-lg mb-2 ml-2">Problema de conexión</h2>
          <p className="ml-2 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { title: "Reservas Activas", value: data.activeReservations.toString(), trend: "Confirmadas", color: "text-amber-500" },
    { title: "Habitaciones Libres", value: data.availableRooms.toString(), trend: "Inventario de hoy", color: "text-slate-900" },
    { title: "Check-ins Pendientes", value: data.pendingCheckIns.toString(), trend: "Para hoy", color: "text-slate-900" },
    { title: "Reservas del Mes", value: data.monthlyReservations.toString(), trend: "Acumulado mensual", color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          ¡Hola, Equipo Altairis!
        </h1>
        <p className="text-slate-500 mt-2 font-medium text-lg">
          Resumen operativo para el rol: <span className="text-amber-600 capitalize">{userRole}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{kpi.title}</h3>
            <div className="mt-6">
              <span className={`text-5xl font-extrabold ${kpi.color}`}>{kpi.value}</span>
              <p className="text-sm font-semibold text-slate-400 mt-3">{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Acciones Rápidas DINÁMICAS */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Acciones rápidas</h2>
          <div className="grid grid-cols-1 gap-4">
            {filteredActions.map((action, index) => (
              <button 
                key={index}
                onClick={() => router.push(action.path)}
                className={`w-full p-4 rounded-2xl font-bold text-sm transition-all border border-slate-200 ${action.style}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Actividad Reciente</h2>
            <button className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors">
              Ver todo ›
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-sm text-slate-400">
                    <th className="pb-4 font-bold uppercase tracking-wider">Reserva</th>
                    <th className="pb-4 font-bold uppercase tracking-wider">Huésped</th>
                    <th className="pb-4 font-bold uppercase tracking-wider">Habitación</th>
                    <th className="pb-4 font-bold uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.recentActivity.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                      <td className="py-5 font-bold text-slate-900">{item.id}</td>
                      <td className="py-5 font-medium text-slate-600">{item.guest}</td>
                      <td className="py-5 font-medium text-slate-600">{item.room}</td>
                      <td className="py-5">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          item.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                          item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
               <div className="text-center py-12">
                 <p className="text-slate-500 font-medium">No hay actividad reciente registrada.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}