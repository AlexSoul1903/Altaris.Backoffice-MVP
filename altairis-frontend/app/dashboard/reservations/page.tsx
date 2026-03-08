/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import ReservationModal from "@/components/ReservationModal";
import Select from "@/components/Select";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Filtros Avanzados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>("all");
  const [dateSearch, setDateSearch] = useState<string>("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, roomsRes] = await Promise.all([
        api.get("/Reservations"),
        api.get("/RoomTypes")
      ]);
      setReservations(resRes.data);
      setRoomTypes(roomsRes.data);
    } catch (err) {
      console.error("Error al cargar data", err);
    } finally {
      setLoading(false);
    }
  };

 const handleSave = async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        await api.put(`/Reservations/${formData.id}`, formData);
      } else {
        await api.post("/Reservations", formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
  
      const errorMessage = err.response?.data?.message || err.response?.data?.title || "Error desconocido";
      
    
      console.error("Error", err.response?.data);
      

      alert("No se pudo guardar: " + errorMessage);
    }
  };

  const getRoomName = (id: number) => roomTypes.find(rt => rt.id === id)?.name || "Desconocida";

  // Lógica de Filtrado Combinado
  const filteredReservations = reservations.filter(res => {
    // 1. Búsqueda por Huésped o ID
    const matchesSearch = 
      res.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      res.id.toString().includes(searchTerm);
      
    // 2. Filtro por Estado
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    
    // 3. Filtro por Fecha corregido
    let matchesDate = true;
    if (dateSearch) {
        const searchD = new Date(dateSearch).getTime();
        const checkIn = new Date(res.checkIn).getTime();
        const checkOut = new Date(res.checkOut).getTime();
        matchesDate = searchD >= checkIn && searchD <= checkOut;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

const statusOptions = [
    { id: "all", label: "Todos los estados" },
    { id: "Confirmada", label: "Confirmadas" }, 
    { id: "Pendiente", label: "Pendientes" },
    { id: "Cancelada", label: "Canceladas" },  
  ];

  if (loading) return <div className="p-10 font-bold text-slate-500">Cargando reservas operativas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reservas</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Gestiona las estancias y registros de huéspedes.</p>
        </div>
        <button onClick={() => { setEditingReservation(null); setIsModalOpen(true); }} className="bg-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-all transform hover:scale-105 active:scale-95">
          + Nueva Reserva
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Buscar huésped o ID</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Ej. Carlos o #1024" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Huéspedes en fecha:</label>
          <div className="flex items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <input 
              type="date" 
              value={dateSearch} 
              onChange={(e) => setDateSearch(e.target.value)} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
            />
            {dateSearch && (
              <button onClick={() => setDateSearch("")} className="ml-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">✕</button>
            )}
          </div>
        </div>

        <Select 
          label="Estado"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={statusOptions}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Huésped / ID</th>
              <th className="px-8 py-6">Habitación</th>
              <th className="px-8 py-6">Fechas</th>
              <th className="px-8 py-6">Estado</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredReservations.length > 0 ? filteredReservations.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {res.guestName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{res.guestName}</p>
                      <p className="text-xs text-slate-500 font-medium font-mono">ID Ref: #{res.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-slate-700">🛏️ {getRoomName(res.roomTypeId)}</td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold text-slate-800">In: {new Date(res.checkIn).toLocaleDateString()}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Out: {new Date(res.checkOut).toLocaleDateString()}</div>
                </td>
           <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    (res.status === 'Confirmed' || res.status === 'Confirmada') ? 'bg-green-100 text-green-700' : 
                    (res.status === 'Cancelled' || res.status === 'Cancelada') ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {(res.status === 'Confirmed' || res.status === 'Confirmada') ? 'Confirmada' : 
                     (res.status === 'Cancelled' || res.status === 'Cancelada') ? 'Cancelada' : 
                     'Pendiente'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => { setEditingReservation(res); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm transition-colors">Gestionar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-500 font-medium italic">No se encontraron reservas con esos criterios.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reservation={editingReservation} roomTypes={roomTypes} onSubmit={handleSave} />
    </div>
  );
}