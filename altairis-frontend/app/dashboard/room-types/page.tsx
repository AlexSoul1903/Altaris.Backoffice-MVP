/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import RoomTypeModal from "@/components/RoomTypeModal";

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomTypesRes, hotelsRes] = await Promise.all([
        api.get("/RoomTypes"),
        api.get("/Hotels")
      ]);
      setRoomTypes(roomTypesRes.data);
      setHotels(hotelsRes.data);
    } catch (err) {
      console.error("Error al cargar la data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoomType = async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        await api.put(`/RoomTypes/${formData.id}`, formData);
      } else {
        await api.post("/RoomTypes", formData);
      }
      setIsModalOpen(false);
      fetchData(); 
    } catch (err) {
      alert("Error al guardar el tipo de habitación.");
    }
  };

  // Función para obtener el nombre del hotel dado su ID
  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : "Hotel no encontrado";
  };

  // Búsqueda en tiempo real por nombre de habitación o nombre del hotel
  const filteredRoomTypes = roomTypes.filter(rt => {
    const hotelName = getHotelName(rt.hotelId).toLowerCase();
    const roomName = rt.name.toLowerCase();
    const term = searchTerm.toLowerCase();
    return roomName.includes(term) || hotelName.includes(term);
  });

  if (loading) return <div className="p-10 font-bold text-slate-500">Cargando inventario base...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tipos de Habitación</h1>
          <p className="text-slate-500 mt-2 font-medium">Configura las categorías de habitaciones para cada hotel.</p>
        </div>
        <button 
          onClick={() => { setEditingRoomType(null); setIsModalOpen(true); }}
          className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
        >
          + Añadir Tipo de Hab.
        </button>
      </div>

      {/* Buscador Dinámico */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
        <svg className="w-6 h-6 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text"
          placeholder="Buscar por tipo o nombre del hotel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 font-medium placeholder-slate-400"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Tipo de Habitación</th>
              <th className="px-8 py-6">Hotel Asociado</th>
              <th className="px-8 py-6">Capacidad</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRoomTypes.length > 0 ? filteredRoomTypes.map((rt) => (
              <tr key={rt.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-100">
                      🛏️
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{rt.name}</p>
                      <p className="text-xs text-slate-500 font-medium">ID Ref: #{rt.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                    🏨 {getHotelName(rt.hotelId)}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    {rt.capacity} {rt.capacity === 1 ? 'Persona' : 'Personas'}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => { setEditingRoomType(rt); setIsModalOpen(true); }}
                    className="text-slate-400 hover:text-amber-600 font-bold text-sm transition-colors"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-medium italic">
                  {hotels.length === 0 
                    ? "Primero debes crear al menos un Hotel en el catálogo." 
                    : "No se encontraron tipos de habitación con esos criterios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RoomTypeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomType={editingRoomType}
        hotels={hotels}
        onSubmit={handleSaveRoomType}
      />
    </div>
  );
}