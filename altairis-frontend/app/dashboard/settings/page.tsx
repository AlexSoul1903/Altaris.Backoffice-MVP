"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Asumiendo que crearás un endpoint GET /api/Users/profile
        const response = await api.get("/Users/profile");
        const { firstName, lastName, email } = response.data;
        setFirstName(firstName);
        setLastName(lastName);
        setEmail(email);
      } catch (err) {
        console.error("Error al cargar perfil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/Users/profile", { firstName, lastName });
      setMessage({ type: "success", text: "Perfil actualizado correctamente." });
    } catch (err) {
      setMessage({ type: "error", text: "No se pudo actualizar el perfil." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10">Cargando perfil...</div>;

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Apellido</label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico (Solo lectura)</label>
          <input 
            type="email" 
            value={email}
            disabled
            className="w-full px-5 py-4 bg-slate-100 text-slate-500 rounded-2xl border-none cursor-not-allowed"
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit"
          disabled={updating}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all shadow-md"
        >
          {updating ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}