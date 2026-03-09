/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import Select from "@/components/Select";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, isEditing: boolean) => Promise<void>;
  user: any | null; // Si es null, estamos creando. Si tiene datos, estamos editando.
}

export default function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: 2,
    isActive: true
  });

  // Cada vez que se abre el modal o cambia el usuario, reiniciamos el formulario
  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "" }); // Al editar, no traemos la contraseña
    } else {
      setFormData({ firstName: "", lastName: "", email: "", password: "", roleId: 2, isActive: true });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData, isEditing);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">Completa la información de acceso del colaborador.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nombre</label>
                <input 
                  required
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Apellido</label>
                <input 
                  required
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Correo Electrónico</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Contraseña Inicial</label>
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
                  minLength={6}
                />
              </div>
            )}

            <Select 
              label="Rol en el Sistema"
              options={[
                { id: 1, label: "Administrador (Acceso Total)" },
                { id: 2, label: "Agente (Solo lectura y reservas)" }
              ]}
              value={formData.roleId}
              onChange={(val) => setFormData({...formData, roleId: val})}
            />

            {isEditing && (
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Usuario Activo</label>
              </div>
            )}

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
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-4 rounded-2xl font-bold shadow-md transition-all flex justify-center items-center"
              >
                {loading ? "Procesando..." : (isEditing ? "Guardar Cambios" : "Crear Usuario")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}