/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Select from "@/components/Select";

interface RoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEditing: boolean) => Promise<void>;
  roomType: any | null;
  hotels: any[]; // Recibimos la lista de hoteles para el Select
}

export default function RoomTypeModal({ isOpen, onClose, onSubmit, roomType, hotels }: RoomTypeModalProps) {
  const isEditing = !!roomType;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    capacity: 2, 
    hotelId: "" 
  });

  useEffect(() => {
    if (roomType) {
      setFormData(roomType);
    } else {
      // Si hay hoteles disponibles, seleccionamos el primero por defecto
      setFormData({ 
        name: "", 
        capacity: 2, 
        hotelId: hotels.length > 0 ? hotels[0].id : "" 
      });
    }
  }, [roomType, isOpen, hotels]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hotelId) {
      alert("Debes seleccionar un hotel para este tipo de habitación.");
      return;
    }
    setLoading(true);
    await onSubmit(formData, isEditing);
    setLoading(false);
  };

  // Transformamos la data de hoteles para que el componente Select la entienda
  const hotelOptions = hotels.map(h => ({
    id: h.id,
    label: h.name
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isEditing ? "Editar Tipo de Hab." : "Nuevo Tipo de Hab."}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">Define las características de la habitación y asígnala a un hotel.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Select 
              label="Hotel Asociado"
              options={hotelOptions}
              value={formData.hotelId}
              onChange={(val) => setFormData({...formData, hotelId: val})}
            />

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nombre de la Habitación</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="Ej. Suite Presidencial, Doble Estándar..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Capacidad (Personas)</label>
              <input 
                required
                type="number" 
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-4 rounded-2xl font-bold shadow-md transition-all"
              >
                {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear Tipo")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}