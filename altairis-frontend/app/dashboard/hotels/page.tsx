/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import HotelModal from "@/components/HotelModal";
import Select from "@/components/Select";
import Toast from "@/components/Toast";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<any>("all");
  // Estado para el filtro de estrellas
  const [starsFilter, setStarsFilter] = useState<any>("all");

  // Estado del Toast
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  // Estados para Modal de Edición/Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);

  // Estados para Modal de Borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<any>(null);

  // Estados para Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Hotels");
      setHotels(response.data);
    } catch (err) {
      console.error("Error al cargar hoteles", err);
      setToast({ message: "No se pudo cargar el catálogo de hoteles.", type: "error" });
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
      fetchData();
      setToast({ message: isEditing ? "Hotel actualizado correctamente." : "Nuevo hotel registrado.", type: "success" });
    } catch (err: any) {
      const data = err.response?.data;
      let errorMessage = "Error al procesar la solicitud.";

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
    if (!hotelToDelete) return;
    try {
      await api.delete(`/Hotels/${hotelToDelete.id}`);
      setIsDeleteModalOpen(false);
      setHotelToDelete(null);
      fetchData();
      setToast({ message: "Hotel eliminado correctamente.", type: "success" });

      if (paginatedHotels.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err: any) {
      const data = err.response?.data;
      const errorMessage = typeof data === 'string' ? data : (data?.message || "No se pudo eliminar el hotel porque tiene datos asociados.");
      setIsDeleteModalOpen(false);
      setToast({ message: errorMessage, type: "error" });
    }
  };

  // 1. Lógica de Filtrado Combinado
  const filteredHotels = hotels.filter(h => {
    const term = searchTerm.toLowerCase();
    const name = h.name?.toLowerCase() || "";
    const city = h.city?.toLowerCase() || "";
    const country = h.country?.toLowerCase() || "";

    const matchesSearch = name.includes(term) || city.includes(term) || country.includes(term);
    const matchesStatus = statusFilter === "all" ? true : statusFilter === "active" ? h.isActive : !h.isActive;
    // 🔥 NUEVO: Condición para el filtro de estrellas
    const matchesStars = starsFilter === "all" ? true : h.stars.toString() === starsFilter.toString();

    return matchesSearch && matchesStatus && matchesStars;
  });

  // 2. Lógica de Paginación
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Volver a la primera página al buscar
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-lg ${i < count ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
    ));
  };

  if (loading) return <div className="p-10 font-bold text-slate-500 italic">Cargando catálogo de hoteles...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Catálogo de Hoteles</h1>
          <p className="text-slate-500 mt-2 font-medium">Administra las propiedades y locaciones disponibles.</p>
        </div>
        <button 
          onClick={() => { setEditingHotel(null); setIsModalOpen(true); }}
          className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95"
        >
          + Nuevo Hotel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Buscar por nombre o locación</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" placeholder="Ej. Hard Rock o Punta Cana..."
              value={searchTerm} onChange={handleSearchChange}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        <Select 
          label="Categoría" 
          value={starsFilter} 
          onChange={(val) => { setStarsFilter(val); setCurrentPage(1); }}
          options={[
            { id: "all", label: "Todas las estrellas" },
            { id: "5", label: "5 Estrellas" },
            { id: "4", label: "4 Estrellas" },
            { id: "3", label: "3 Estrellas" },
            { id: "2", label: "2 Estrellas" },
            { id: "1", label: "1 Estrella" }
          ]}
        />

        <Select 
          label="Operatividad" value={statusFilter} onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          options={[{ id: "all", label: "Mostrar Todos" }, { id: "active", label: "Operativos (Activos)" }, { id: "inactive", label: "Cerrados (Inactivos)" }]}
        />
      </div>

      {/* TABLA CON PAGINACIÓN */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Propiedad</th>
              <th className="px-8 py-6">Locación</th>
              <th className="px-8 py-6">Estado</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedHotels.length > 0 ? paginatedHotels.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm border border-amber-100">🏨</div>
                    <div>
                      <p className="font-bold text-slate-900">{h.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">{renderStars(h.stars)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-700">{h.city}, {h.country}</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">{h.phone}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`flex items-center w-max gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${h.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${h.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {h.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right space-x-4">
                  <button onClick={() => { setEditingHotel(h); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm transition-colors">Editar</button>
                  <button onClick={() => { setHotelToDelete(h); setIsDeleteModalOpen(true); }} className="text-red-300 hover:text-red-600 font-bold text-sm transition-colors">Eliminar</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-500 font-medium italic">No se encontraron hoteles con esos filtros.</td></tr>
            )}
          </tbody>
        </table>

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredHotels.length)} de {filteredHotels.length}
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

      <HotelModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        hotel={editingHotel} onSubmit={handleSaveHotel}
      />

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">¿Eliminar Hotel?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Estás a punto de borrar el hotel <strong>{hotelToDelete?.name}</strong>. Esta acción no se puede deshacer.
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