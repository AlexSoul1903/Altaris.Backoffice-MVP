/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Select from "@/components/Select";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEditing: boolean) => Promise<void>;
  inventory: any | null;
  roomTypes: any[];
}

export default function InventoryModal({ isOpen, onClose, onSubmit, inventory, roomTypes }: InventoryModalProps) {
  const isEditing = !!inventory;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    availableRooms: 1,
    roomTypeId: ""
  });

  useEffect(() => {
    if (inventory) {
      setFormData({
        ...inventory,
        date: inventory.date.split('T')[0]
      });
    } else {
      setFormData({ 
        date: new Date().toISOString().split('T')[0], 
        availableRooms: 1, 
        roomTypeId: roomTypes.length > 0 ? roomTypes[0].id : "" 
      });
    }
  }, [inventory, isOpen, roomTypes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData, isEditing);
    setLoading(false);
  };

  const roomOptions = roomTypes.map(rt => ({
    id: rt.id,
    label: rt.name
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="p-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isEditing ? "Ajustar Inventario" : "Cargar Disponibilidad"}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">Define cuántas habitaciones hay libres para una fecha.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select 
              label="Tipo de Habitación"
              options={roomOptions}
              value={formData.roomTypeId}
              onChange={(val) => setFormData({...formData, roomTypeId: val})}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Fecha</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Disponibles</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  value={formData.availableRooms}
                  onChange={(e) => setFormData({...formData, availableRooms: Number(e.target.value)})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all">
                {loading ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}