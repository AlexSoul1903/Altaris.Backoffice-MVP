/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import InventoryModal from "@/components/InventoryModal";
import Select from "@/components/Select";

export default function InventoryPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Filtros Avanzados
  const [roomFilter, setRoomFilter] = useState<any>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<any>("all");
  const [dateSearch, setDateSearch] = useState<string>("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, roomsRes] = await Promise.all([
        api.get("/Inventories"),
        api.get("/RoomTypes")
      ]);
      setInventories(invRes.data);
      setRoomTypes(roomsRes.data);
    } catch (err) {
      console.error("Error al cargar inventario", err);
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
    } catch (err) {
      alert("Error al actualizar inventario.");
    }
  };

  const getRoomTypeName = (id: number) => {
    return roomTypes.find(rt => rt.id === id)?.name || "Desconocida";
  };

  // Lógica de Filtrado Combinado
  const filteredInventory = inventories.filter(inv => {
    // 1. Filtro por Habitación
    const matchRoom = roomFilter === "all" || inv.roomTypeId.toString() === roomFilter.toString();
    
    // 2. Filtro por Disponibilidad
    const matchAvailability = availabilityFilter === "all" 
      ? true 
      : availabilityFilter === "available" 
        ? inv.availableRooms > 0 
        : inv.availableRooms === 0;

    // 3. Filtro por Fecha (si el usuario seleccionó una)
    const matchDate = dateSearch === "" || inv.date.includes(dateSearch);

    return matchRoom && matchAvailability && matchDate;
  });

  // Opciones de filtro para los Select
  const roomFilterOptions = [
    { id: "all", label: "Todas las habitaciones" },
    ...roomTypes.map(rt => ({ id: rt.id, label: rt.name }))
  ];

  const availabilityOptions = [
    { id: "all", label: "Todos los estados" },
    { id: "available", label: "Con Disponibilidad (>0)" },
    { id: "soldout", label: "Agotadas (0)" }
  ];

  if (loading) return <div className="p-10 font-bold text-slate-500">Cargando disponibilidad...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Inventario</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Control de disponibilidad diaria.</p>
        </div>
        <button onClick={() => { setEditingInventory(null); setIsModalOpen(true); }} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all">
          + Ajustar Inventario
        </button>
      </div>

      {/* PANEL DE FILTROS AVANZADOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        {/* Filtro de Fecha */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Buscar por Fecha</label>
          <div className="flex items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <input 
              type="date" 
              value={dateSearch} 
              onChange={(e) => setDateSearch(e.target.value)} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
            />
            {dateSearch && (
              <button 
                onClick={() => setDateSearch("")}
                className="ml-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                title="Limpiar fecha"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtro por Tipo de Habitación */}
        <Select 
          label="Filtrar por Habitación"
          value={roomFilter}
          onChange={(val) => setRoomFilter(val)}
          options={roomFilterOptions}
        />

        {/* Filtro por Estado de Disponibilidad */}
        <Select 
          label="Estado de Disponibilidad"
          value={availabilityFilter}
          onChange={(val) => setAvailabilityFilter(val)}
          options={availabilityOptions}
        />
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Fecha</th>
              <th className="px-8 py-6">Tipo de Habitación</th>
              <th className="px-8 py-6">Disponibilidad</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredInventory.length > 0 ? filteredInventory.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">📅</div>
                    <span className="font-bold text-slate-900 capitalize">
                      {new Date(inv.date).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-slate-600">{getRoomTypeName(inv.roomTypeId)}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${inv.availableRooms > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {inv.availableRooms} {inv.availableRooms === 1 ? 'Habitación' : 'Habitaciones'} {inv.availableRooms > 0 ? 'libres' : 'Agotadas'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => { setEditingInventory(inv); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm">Modificar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-500 font-medium italic">No hay inventario registrado para los filtros seleccionados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} inventory={editingInventory} roomTypes={roomTypes} onSubmit={handleSaveInventory} />
    </div>
  );
}