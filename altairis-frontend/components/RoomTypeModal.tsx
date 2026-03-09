/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Select from "@/components/Select";
import Toast from "@/components/Toast";

interface RoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEditing: boolean) => Promise<void>;
  roomType: any | null;
  hotels: any[]; 
}

export default function RoomTypeModal({ isOpen, onClose, onSubmit, roomType, hotels }: RoomTypeModalProps) {
  const isEditing = !!roomType;
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    capacity: 2, 
    totalRooms: 10,
    hotelId: "" 
  });

  useEffect(() => {
    if (roomType) {
      setFormData({
        id: roomType.id,
        name: roomType.name,
        capacity: roomType.capacity,
        totalRooms: roomType.totalRooms || 0, // Aseguramos capturar el valor
        hotelId: roomType.hotelId.toString()
      });
    } else {
      setFormData({ 
        id: 0,
        name: "", 
        capacity: 2, 
        totalRooms: 10,
        hotelId: hotels.length > 0 ? hotels[0].id.toString() : "" 
      });
    }
  }, [roomType, isOpen, hotels]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hotelId) {
      setToast({ message: "Debes asignar este tipo de habitación a un hotel específico.", type: "error" });
      return;
    }
    
    setLoading(true);
  
    const cleanPayload = {
      id: formData.id,
      name: formData.name,
      capacity: Number(formData.capacity),
      totalRooms: Number(formData.totalRooms), 
      hotelId: Number(formData.hotelId)
    };

    await onSubmit(cleanPayload, isEditing);
    setLoading(false);
  };

  const hotelOptions = hotels.map(h => ({
    id: h.id.toString(),
    label: h.name
  }));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {isEditing ? "Editar Tipo de Hab." : "Nuevo Tipo de Hab."}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">Define las características de la habitación y su inventario base.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <Select 
                label="Hotel Asociado"
                options={hotelOptions}
                value={formData.hotelId}
                onChange={(val) => setFormData({...formData, hotelId: val.toString()})}
              />

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nombre de la Habitación</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Ej. Suite Royal, Hab. Estándar..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Capacidad</label>
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
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Unidades Totales</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={formData.totalRooms}
                    onChange={(e) => setFormData({...formData, totalRooms: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-4 rounded-2xl font-bold shadow-md transition-all">
                  {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear Tipo")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}