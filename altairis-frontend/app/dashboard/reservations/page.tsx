/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import ReservationModal from "@/components/ReservationModal";
import Select from "@/components/Select";
import Toast from "@/components/Toast"; 

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);
  
  // Estados para Filtros Avanzados
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>("all");
  const [dateSearch, setDateSearch] = useState<string>("");
  const [hotelStatusFilter, setHotelStatusFilter] = useState<any>("active");
  
  //Estados para los filtros de Hotel y Habitación
  const [hotelFilter, setHotelFilter] = useState<any>("all");
  const [roomFilter, setRoomFilter] = useState<any>("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, roomsRes, hotelsRes] = await Promise.all([
        api.get("/Reservations"),
        api.get("/RoomTypes"),
        api.get("/Hotels")
      ]);
      setReservations(resRes.data);
      setRoomTypes(roomsRes.data);
      setHotels(hotelsRes.data);
    } catch (err) {
      console.error("Error al cargar data", err);
      setToast({ message: "No se pudieron cargar las reservas.", type: "error" });
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
      setToast({ message: isEditing ? "Reserva actualizada correctamente." : "Nueva reserva creada.", type: "success" });
    } catch (err: any) {
      const data = err.response?.data;
      const errorMessage = typeof data === 'string' ? data : (data?.message || data?.title || "Error de conexión con el servidor.");
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const getRoomName = (id: number) => roomTypes.find(rt => rt.id === id)?.name || "Desconocida";

  const formatSafeDate = (isoDate: string) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  //  LÓGICA DE FILTRADO COMBINADO
  const filteredReservations = reservations.filter(res => {
    const room = roomTypes.find(rt => rt.id === res.roomTypeId);
    const hotel = hotels.find(h => h.id === room?.hotelId);
    const isHotelActive = hotel ? hotel.isActive : false;

    // Filtros de texto, estado y fechas
    const matchesSearch = res.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) || res.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    const matchHotelStatus = hotelStatusFilter === "all" ? true : hotelStatusFilter === "active" ? isHotelActive : !isHotelActive;
    
    // Filtros directos de Hotel y Habitación
    const matchHotel = hotelFilter === "all" || hotel?.id.toString() === hotelFilter.toString();
    const matchRoom = roomFilter === "all" || res.roomTypeId.toString() === roomFilter.toString();
    
    let matchesDate = true;
    if (dateSearch) {
        const searchD = new Date(dateSearch).getTime();
        const checkIn = new Date(res.checkIn).getTime();
        const checkOut = new Date(res.checkOut).getTime();
        matchesDate = searchD >= checkIn && searchD <= checkOut;
    }

    return matchesSearch && matchesStatus && matchesDate && matchHotelStatus && matchHotel && matchRoom;
  });


  const hotelOptions = [
    { id: "all", label: "Todos los hoteles" },
    ...hotels.map(h => ({ id: h.id, label: h.name }))
  ];

  // Filtramos las habitaciones para que solo aparezcan las del hotel seleccionado (Cascada)
  const availableRooms = hotelFilter === "all" 
    ? roomTypes 
    : roomTypes.filter(rt => rt.hotelId.toString() === hotelFilter.toString());

  const roomOptions = [
    { id: "all", label: "Todas las habitaciones" },
    ...availableRooms.map(rt => ({ id: rt.id, label: rt.name }))
  ];

  if (loading) return <div className="p-10 font-bold text-slate-500">Cargando reservas operativas...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reservas</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Gestiona las estancias y registros de huéspedes.</p>
        </div>
        <button onClick={() => { setEditingReservation(null); setIsModalOpen(true); }} className="bg-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-all transform hover:scale-105 active:scale-95">
          + Nueva Reserva
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        <div className="space-y-2 lg:col-span-2 xl:col-span-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Buscar huésped o ID</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Ej. Carlos o #1024" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 w-full" />
          </div>
        </div>

        <div className="space-y-2 lg:col-span-1 xl:col-span-1">
          <label className="block text-sm font-bold text-slate-700 ml-1">Huéspedes en fecha</label>
          <div className="flex items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <input type="date" value={dateSearch} onChange={(e) => setDateSearch(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-full" />
            {dateSearch && <button onClick={() => setDateSearch("")} className="ml-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">✕</button>}
          </div>
        </div>

        <Select 
          label="Filtrar por Hotel"
          value={hotelFilter}
          onChange={(val) => { 
            setHotelFilter(val); 
            setRoomFilter("all"); // Resetea la habitación si cambia el hotel
          }}
          options={hotelOptions}
        />

        <Select 
          label="Filtrar por Habitación"
          value={roomFilter}
          onChange={(val) => setRoomFilter(val)}
          options={roomOptions}
        />

        <Select 
          label="Estado de Reserva"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { id: "all", label: "Todos" },
            { id: "Confirmada", label: "Confirmadas" },
            { id: "Pendiente", label: "Pendientes" },
            { id: "Cancelada", label: "Canceladas" }
          ]}
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
                  <div className="text-sm font-bold text-slate-800">In: {formatSafeDate(res.checkIn)}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">Out: {formatSafeDate(res.checkOut)}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    (res.status === 'Confirmed' || res.status === 'Confirmada') ? 'bg-green-100 text-green-700' : 
                    (res.status === 'Cancelled' || res.status === 'Cancelada') ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {(res.status === 'Confirmed' || res.status === 'Confirmada') ? 'Confirmada' : 
                     (res.status === 'Cancelled' || res.status === 'Cancelada') ? 'Cancelada' : 'Pendiente'}
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

      <ReservationModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reservation={editingReservation} 
        roomTypes={roomTypes.filter((rt: any) => {
          const parentHotel = hotels.find((h: any) => h.id === rt.hotelId);
          return parentHotel?.isActive === true || (editingReservation && rt.id === editingReservation.roomTypeId);
        })} 
        onSubmit={handleSave} 
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}