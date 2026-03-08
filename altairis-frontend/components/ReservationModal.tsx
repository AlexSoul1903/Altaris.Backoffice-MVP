/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Select from "@/components/Select";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEditing: boolean) => Promise<void>;
  reservation: any | null;
  roomTypes: any[];
}

export default function ReservationModal({ isOpen, onClose, onSubmit, reservation, roomTypes }: ReservationModalProps) {
  const isEditing = !!reservation;
  const [loading, setLoading] = useState(false);

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    id: 0,
    guestName: "",
    roomTypeId: "",
    checkIn: "",
    checkOut: "",
    status: "Confirmada" 
  });

  useEffect(() => {
    if (reservation) {
      setFormData({
        id: reservation.id,
        guestName: reservation.guestName || "",
        roomTypeId: reservation.roomTypeId || (roomTypes.length > 0 ? roomTypes[0].id : ""),
        checkIn: reservation.checkIn ? reservation.checkIn.split('T')[0] : "",
        checkOut: reservation.checkOut ? reservation.checkOut.split('T')[0] : "",
        status: reservation.status || "Confirmeda"
      });
    } else {
      setFormData({ 
        id: 0,
        guestName: "", 
        roomTypeId: roomTypes.length > 0 ? roomTypes[0].id : "", 
        checkIn: "", 
        checkOut: "", 
        status: "Confirmeda" 
      });
    }
  }, [reservation, isOpen, roomTypes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

  
    const cleanPayload = {
      id: formData.id, 
      guestName: formData.guestName,
      roomTypeId: Number(formData.roomTypeId), 
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      status: formData.status
    };

    await onSubmit(cleanPayload, isEditing);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isEditing ? "Gestionar Reserva" : "Nueva Reserva"}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">Registra o modifica los datos del huésped y su estancia.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nombre del Huésped</label>
              <input 
                required 
                type="text" 
                value={formData.guestName} 
                onChange={(e) => setFormData({...formData, guestName: e.target.value})} 
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all" 
                placeholder="Ej. Carlos Polanco"
              />
            </div>

            <Select 
              label="Habitación Reservada" 
              value={formData.roomTypeId} 
              onChange={(val) => setFormData({...formData, roomTypeId: val})} 
              options={roomTypes.map(rt => ({ id: rt.id, label: rt.name }))} 
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Check-in</label>
                <input 
                  required 
                  type="date" 
                  value={formData.checkIn} 
                  onChange={(e) => setFormData({...formData, checkIn: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-700 font-bold" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Check-out</label>
                <input 
                  required 
                  type="date" 
                  value={formData.checkOut} 
                  min={formData.checkIn} // Evita que hagan check-out antes del check-in
                  onChange={(e) => setFormData({...formData, checkOut: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-700 font-bold" 
                />
              </div>
            </div>

            {/* Solo permitimos cambiar el estado si estamos editando una reserva existente */}
            {isEditing && (
              <Select 
                label="Estado de la Reserva"
                value={formData.status}
                onChange={(val) => setFormData({...formData, status: val.toString()})}
                options={[
                  { id: "Confirmada", label: "Confirmada" },
                  { id: "Pendiente", label: "Pendiente" },
                  { id: "Cancelada", label: "Cancelada" },
                ]}
              />
            )}

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-4 rounded-2xl font-bold shadow-lg transition-all"
              >
                {loading ? "Procesando..." : "Guardar Reserva"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}