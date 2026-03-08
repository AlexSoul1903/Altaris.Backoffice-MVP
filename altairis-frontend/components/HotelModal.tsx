/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEditing: boolean) => Promise<void>;
  hotel: any | null;
}

export default function HotelModal({ isOpen, onClose, onSubmit, hotel }: HotelModalProps) {
  const isEditing = !!hotel;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    stars: 3,
    isActive: true
  });

  useEffect(() => {
    if (hotel) {
      setFormData(hotel);
    } else {
      setFormData({ name: "", address: "", city: "", country: "", phone: "", stars: 3, isActive: true });
    }
  }, [hotel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData, isEditing);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isEditing ? "Editar Hotel" : "Registrar Nuevo Hotel"}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">Completa la información operativa de la propiedad.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nombre Comercial</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
                placeholder="Ej. Altairis Resort & Spa"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">País</label>
                <input 
                  required
                  type="text" 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Ciudad</label>
                <input 
                  required
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Dirección Física</label>
              <input 
                required
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Teléfono de Contacto</label>
                <input 
                  required
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
                />
              </div>
              
              <StarRating 
                label="Categoría"
                value={formData.stars}
                onChange={(val) => setFormData({...formData, stars: val})}
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="isActiveHotel"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActiveHotel" className="text-sm font-bold text-slate-700">Propiedad disponible para reservas</label>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all">
                {loading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Registrar Hotel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}