/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import RoomTypeModal from "@/components/RoomTypeModal";
import Select from "@/components/Select";
import Toast from "@/components/Toast"; 

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hotelStatusFilter, setHotelStatusFilter] = useState<any>("active");
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

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
      setToast({ message: "No se pudo cargar la información.", type: "error" });
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
      setToast({ message: isEditing ? "Actualizado correctamente." : "Creado correctamente.", type: "success" });
    } catch (err: any) {
      const data = err.response?.data;
      const errorMessage = typeof data === 'string' ? data : (data?.message || "Error al procesar la solicitud.");
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!roomTypeToDelete) return;
    try {
      await api.delete(`/RoomTypes/${roomTypeToDelete.id}`);
      setIsDeleteModalOpen(false);
      setRoomTypeToDelete(null);
      fetchData();
      setToast({ message: "Habitación eliminada correctamente.", type: "success" });
      
      if (paginatedRoomTypes.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err: any) {
      // CAPTURA DEL ERROR 400 (Bad Request) DEL BACKEND
      const data = err.response?.data;
      const errorMessage = typeof data === 'string' ? data : (data?.message || "No se puede eliminar: tiene reservas o inventario.");
      setIsDeleteModalOpen(false);
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : "Hotel no encontrado";
  };

  const filteredRoomTypes = roomTypes.filter(rt => {
    const hotel = hotels.find(h => h.id === rt.hotelId);
    const isHotelActive = hotel ? hotel.isActive : false;
    const hotelName = (hotel ? hotel.name : "").toLowerCase();
    const roomName = rt.name.toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = roomName.includes(term) || hotelName.includes(term);
    const matchHotelStatus = hotelStatusFilter === "all" ? true : hotelStatusFilter === "active" ? isHotelActive : !isHotelActive;

    return matchesSearch && matchHotelStatus;
  });

  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoomTypes = filteredRoomTypes.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="p-10 font-bold text-slate-500 italic">Cargando catálogo...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tipos de Habitación</h1>
          <p className="text-slate-500 mt-2 font-medium">Configura las categorías de habitaciones para cada hotel.</p>
        </div>
        <button 
          onClick={() => { setEditingRoomType(null); setIsModalOpen(true); }}
          className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all transform hover:scale-105"
        >
          + Añadir Tipo de Hab.
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-slate-700">Buscar habitación u hotel</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" placeholder="Ej. Suite Presidencial..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700"
            />
          </div>
        </div>
        <Select 
          label="Operatividad de Hotel" value={hotelStatusFilter} onChange={(val) => { setHotelStatusFilter(val); setCurrentPage(1); }}
          options={[{ id: "active", label: "Solo Hoteles Activos" }, { id: "inactive", label: "Solo Historial (Inactivos)" }, { id: "all", label: "Mostrar Todo" }]}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Tipo de Habitación</th>
              <th className="px-8 py-6">Hotel Asociado</th>
              <th className="px-8 py-6">Capacidad e Inventario</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedRoomTypes.map((rt) => (
              <tr key={rt.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm">🛏️</div>
                    <div>
                      <p className="font-bold text-slate-900">{rt.name}</p>
                      <p className="text-xs text-slate-500 font-medium">ID Ref: #{rt.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6"><span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">🏨 {getHotelName(rt.hotelId)}</span></td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      {rt.capacity} Pax
                    </div>
                    <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                       {rt.totalRooms} Unidades físicas
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right space-x-4">
                  <button onClick={() => { setEditingRoomType(rt); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm">Editar</button>
                  <button onClick={() => { setRoomTypeToDelete(rt); setIsDeleteModalOpen(true); }} className="text-red-300 hover:text-red-600 font-bold text-sm">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Mostrando página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold bg-white border rounded-lg">Anterior</button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold bg-white border rounded-lg">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      <RoomTypeModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} roomType={editingRoomType}
        hotels={hotels.filter((h: any) => h.isActive === true || (editingRoomType && h.id === editingRoomType.hotelId))}
        onSubmit={handleSaveRoomType}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">¿Eliminar Habitación?</h3>
            <p className="text-slate-500 font-medium mb-8">Borrarás <strong>{roomTypeToDelete?.name}</strong>. Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white px-6 py-4 rounded-2xl font-bold">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}