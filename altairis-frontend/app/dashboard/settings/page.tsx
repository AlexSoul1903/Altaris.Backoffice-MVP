/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import Toast from "@/components/Toast"; // Importamos el Toast

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Estado para el componente Toast (reemplaza a la variable 'message' antigua)
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/Users/profile");
        const { firstName, lastName, email } = response.data;
        setFirstName(firstName);
        setLastName(lastName);
        setEmail(email);
      } catch (err) {
        console.error("Error al cargar perfil", err);
        setToast({ message: "No se pudo cargar la información de tu perfil.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setToast(null); // Limpiamos notificaciones previas

    try {
      await api.put("/Users/profile", { firstName, lastName });
      setToast({ message: "Perfil actualizado correctamente.", type: "success" });
    } catch (err: any) {
      // Capturamos el error real del backend si lo hay
      const errorMessage = err.response?.data?.message || err.response?.data?.title || "No se pudo actualizar el perfil.";
      console.error("Error al actualizar:", err.response?.data);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-500 italic">Cargando perfil...</div>;

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Mi Perfil</h1>
      <p className="text-slate-500 mb-8 font-medium">Gestiona tu información personal y cuenta.</p>

      <form onSubmit={handleUpdate} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Apellido</label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico (Solo lectura)</label>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full px-5 py-4 bg-slate-100 text-slate-500 font-medium rounded-2xl border-none cursor-not-allowed opacity-70"
          />
        </div>

        <button 
          type="submit"
          disabled={updating}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all shadow-md active:scale-95"
        >
          {updating ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>

      {/* Renderizamos el Toast al final del contenedor */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}