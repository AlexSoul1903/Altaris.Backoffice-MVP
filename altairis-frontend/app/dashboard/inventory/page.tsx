/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import InventoryModal from "@/components/InventoryModal";
import Select from "@/components/Select";
import Toast from "@/components/Toast";

export default function InventoryPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  // Estados para Filtros Avanzados
  const [dateSearch, setDateSearch] = useState<string>("");
  const [hotelStatusFilter, setHotelStatusFilter] = useState<any>("active");
  const [availabilityFilter, setAvailabilityFilter] = useState<any>("all");
  
  // 🔥 NUEVOS: Filtros en Cascada
  const [hotelFilter, setHotelFilter] = useState<any>("all");
  const [roomFilter, setRoomFilter] = useState<any>("all");
  
  // Estados para Modal de Edición/Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any>(null);

  // Estados para Modal de Borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<any>(null);

  // Estados para Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("altairis_role"));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, roomsRes, hotelsRes] = await Promise.all([
        api.get("/Inventories"),
        api.get("/RoomTypes"),
        api.get("/Hotels")
      ]);
      
      const sortedInventories = invRes.data.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setInventories(sortedInventories);
      setRoomTypes(roomsRes.data);
      setHotels(hotelsRes.data);
    } catch (err) {
      console.error("Error al cargar inventario", err);
      setToast({ message: "No se pudo cargar la información operativa.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInventory = async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        await api.put(`/Inventories/${formData.id}`, formData);
      } else {
        await api.post("/Inventories", formData);
      }
      setIsModalOpen(false);
      fetchData();
      setToast({ message: "Inventario guardado correctamente.", type: "success" });
    } catch (err: any) {
      const data = err.response?.data;
      let errorMessage = "Error al actualizar el inventario.";

      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        errorMessage = errorMessages.join(" ");
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.title) {
        errorMessage = data.title;
      }

      setToast({ message: errorMessage, type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!inventoryToDelete) return;
    try {
      await api.delete(`/Inventories/${inventoryToDelete.id}`);
      setIsDeleteModalOpen(false);
      setInventoryToDelete(null);
      fetchData();
      setToast({ message: "Registro de inventario eliminado.", type: "success" });

      if (paginatedInventory.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err: any) {
      const data = err.response?.data;
      const errorMessage = typeof data === 'string' ? data : (data?.message || "No se pudo eliminar el registro de inventario.");
      setIsDeleteModalOpen(false);
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const getRoomTypeName = (id: number) => roomTypes.find(rt => rt.id === id)?.name || "Desconocida";

  const formatSafeInventoryDate = (isoDate: string) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  // 🔥 1. Lógica de Filtrado Combinado
  const filteredInventory = inventories.filter(inv => {
    const room = roomTypes.find(rt => rt.id === inv.roomTypeId);
    const hotel = hotels.find(h => h.id === room?.hotelId);
    const isHotelActive = hotel ? hotel.isActive : false;

    const matchAvailability = availabilityFilter === "all" ? true : availabilityFilter === "available" ? inv.availableRooms > 0 : inv.availableRooms === 0;
    const matchDate = dateSearch === "" || inv.date.includes(dateSearch);
    const matchHotelStatus = hotelStatusFilter === "all" ? true : hotelStatusFilter === "active" ? isHotelActive : !isHotelActive;
    
    // Filtros de Cascada (Hotel -> Habitación)
    const matchHotel = hotelFilter === "all" || hotel?.id.toString() === hotelFilter.toString();
    const matchRoom = roomFilter === "all" || inv.roomTypeId.toString() === roomFilter.toString();

    return matchAvailability && matchDate && matchHotelStatus && matchHotel && matchRoom;
  });

  // 2. Lógica de Paginación
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  // 🔥 3. Opciones Dinámicas para los Desplegables
  const hotelOptions = [
    { id: "all", label: "Todos los hoteles" },
    ...hotels.map(h => ({ id: h.id, label: h.name }))
  ];

  const availableRooms = hotelFilter === "all" 
    ? roomTypes 
    : roomTypes.filter(rt => rt.hotelId.toString() === hotelFilter.toString());

  const roomOptions = [
    { id: "all", label: "Todas las habitaciones" },
    ...availableRooms.map(rt => ({ id: rt.id, label: rt.name }))
  ];

  if (loading) return <div className="p-10 font-bold text-slate-500 italic">Cargando disponibilidad hotelera...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Inventario</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Control de disponibilidad diaria de habitaciones.</p>
        </div>
        {userRole === "Admin" && (
          <button onClick={() => { setEditingInventory(null); setIsModalOpen(true); }} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95">
            + Ajustar Inventario
          </button>
        )}
      </div>

      {/* PANEL DE FILTROS REORGANIZADO PARA 5 CONTROLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Buscar por Fecha</label>
          <div className="flex items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <input 
              type="date" value={dateSearch} 
              onChange={(e) => { setDateSearch(e.target.value); setCurrentPage(1); }} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700" 
            />
            {dateSearch && <button onClick={() => { setDateSearch(""); setCurrentPage(1); }} className="ml-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">✕</button>}
          </div>
        </div>

        <Select 
          label="Filtrar por Hotel"
          value={hotelFilter}
          onChange={(val) => { 
            setHotelFilter(val); 
            setRoomFilter("all"); // Reset cascada
            setCurrentPage(1); 
          }}
          options={hotelOptions}
        />

        <Select 
          label="Filtrar por Habitación" 
          value={roomFilter} 
          onChange={(val) => { setRoomFilter(val); setCurrentPage(1); }} 
          options={roomOptions} 
        />

        <Select 
          label="Operatividad de Hotel" value={hotelStatusFilter} onChange={(val) => { setHotelStatusFilter(val); setCurrentPage(1); }}
          options={[{ id: "active", label: "Solo Hoteles Activos" }, { id: "inactive", label: "Solo Historial (Inactivos)" }, { id: "all", label: "Mostrar Todo" }]}
        />

        <Select 
          label="Disponibilidad" value={availabilityFilter} onChange={(val) => { setAvailabilityFilter(val); setCurrentPage(1); }} 
          options={[ { id: "all", label: "Todos los estados" }, { id: "available", label: "Con Disponibilidad (>0)" }, { id: "soldout", label: "Agotadas (0)" } ]} 
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Fecha</th>
              <th className="px-8 py-6">Tipo de Habitación</th>
              <th className="px-8 py-6">Disponibilidad</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedInventory.length > 0 ? paginatedInventory.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">📅</div>
                    <span className="font-bold text-slate-900 capitalize">{formatSafeInventoryDate(inv.date)}</span>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-slate-700">{getRoomTypeName(inv.roomTypeId)}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${inv.availableRooms > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {inv.availableRooms} {inv.availableRooms === 1 ? 'Habitación' : 'Habitaciones'} {inv.availableRooms > 0 ? 'libres' : 'Agotadas'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right space-x-4">
                  {userRole === "Admin" ? (
                    <>
                      <button onClick={() => { setEditingInventory(inv); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm transition-colors">Modificar</button>
                      <button onClick={() => { setInventoryToDelete(inv); setIsDeleteModalOpen(true); }} className="text-red-300 hover:text-red-600 font-bold text-sm transition-colors">Eliminar</button>
                    </>
                  ) : (
                    <span className="text-slate-300 font-medium text-xs italic">Solo lectura</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-500 font-medium italic">No hay inventario registrado para los filtros seleccionados.</td></tr>
            )}
          </tbody>
        </table>

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredInventory.length)} de {filteredInventory.length}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <InventoryModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} inventory={editingInventory} 
        roomTypes={roomTypes.filter((rt: any) => {
          const parentHotel = hotels.find((h: any) => h.id === rt.hotelId);
          return parentHotel?.isActive === true || (editingInventory && rt.id === editingInventory.roomTypeId);
        })} 
        onSubmit={handleSaveInventory} 
      />
      
      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">¿Eliminar Registro?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Estás a punto de borrar el registro de disponibilidad del <strong>{inventoryToDelete ? formatSafeInventoryDate(inventoryToDelete.date) : ''}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-red-500/30 transition-all">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}