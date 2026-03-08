/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import HotelModal from "@/components/HotelModal";
import Select from "@/components/Select";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [starFilter, setStarFilter] = useState<any>("all");
  const [statusFilter, setStatusFilter] = useState<any>("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get("/Hotels");
      setHotels(response.data);
    } catch (err) {
      console.error("Error al cargar hoteles", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHotel = async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        await api.put(`/Hotels/${formData.id}`, formData);
      } else {
        await api.post("/Hotels", formData);
      }
      setIsModalOpen(false);
      fetchHotels();
    } catch (err) {
      alert("Error al guardar.");
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStars = starFilter === "all" || hotel.stars.toString() === starFilter.toString();
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? hotel.isActive : !hotel.isActive);

    return matchesSearch && matchesStars && matchesStatus;
  });

  if (loading) return <div className="p-10 font-bold text-slate-500">Cargando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Catálogo de Hoteles</h1>
          <p className="text-slate-500 mt-2 font-medium">Visualización y búsqueda eficiente de propiedades.</p>
        </div>
        <button onClick={() => { setEditingHotel(null); setIsModalOpen(true); }} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all">
          + Añadir Hotel
        </button>
      </div>

      {/* PANEL DE FILTROS UNIFICADO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Búsqueda rápida</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Nombre, ciudad o país..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400" />
          </div>
        </div>

        <Select 
          label="Categoría"
          value={starFilter}
          onChange={(val) => setStarFilter(val)}
          options={[
            { id: "all", label: "Todas" },
            { id: 5, label: "5 Estrellas" },
            { id: 4, label: "4 Estrellas" },
            { id: 3, label: "3 Estrellas" },
            { id: 2, label: "2 Estrellas" },
            { id: 1, label: "1 Estrella" },
          ]}
        />

        <Select 
          label="Estado"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { id: "all", label: "Todos" },
            { id: "active", label: "Operativos" },
            { id: "inactive", label: "Inactivos" },
          ]}
        />
      </div>

      {/* TABLA DE HOTELES */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Propiedad</th>
              <th className="px-8 py-6">Ubicación</th>
              <th className="px-8 py-6">Categoría</th>
              <th className="px-8 py-6">Estado</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredHotels.length > 0 ? filteredHotels.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-sm border border-slate-200 group-hover:bg-white transition-colors">🏨</div>
                    <div>
                      <p className="font-bold text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{h.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-700">{h.city}</p>
                  <p className="text-xs text-slate-500 font-medium">{h.country}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-0.5">{Array(h.stars).fill('⭐').join('')}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${h.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {h.isActive ? "Operativo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => { setEditingHotel(h); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm transition-colors">Editar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium italic">No se encontraron resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <HotelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} hotel={editingHotel} onSubmit={handleSaveHotel} />
    </div>
  );
}