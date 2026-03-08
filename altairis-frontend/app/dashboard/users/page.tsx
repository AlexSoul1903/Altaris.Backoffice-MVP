/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import UserModal from "@/components/UserModal";

export default function UsersAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    const role = localStorage.getItem("altairis_role");
    if (role !== "Admin" && role !== "Administrador") {
      router.push("/dashboard");
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/Users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error al cargar usuarios", err);
    } finally {
      setLoading(false);
    }
  };


  
 const handleSaveUser = async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
     
        await api.put(`/Users/${formData.id}`, formData); 
      } else {
        // Ruta para crear un nuevo usuario
        await api.post("/Auth/register", formData); 
      }
      setIsModalOpen(false);
      fetchUsers(); // Recargamos la tabla
    } catch (err) {
      console.error(err);
      alert("Error al guardar el usuario. Verifica la consola.");
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-500">Cargando directorio...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Directorio de Usuarios</h1>
          <p className="text-slate-500 mt-2 font-medium">Administra el acceso del equipo de Altairis.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Usuario</th>
              <th className="px-8 py-6">Rol</th>
              <th className="px-8 py-6">Estado</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {u.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${u.roleId === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.roleId === 1 ? "Administrador" : "Agente"}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`flex items-center gap-2 text-xs font-bold ${u.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                    className="text-slate-400 hover:text-amber-600 font-bold text-sm transition-colors"
                  >
                    Editar Perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSubmit={handleSaveUser}
      />

    </div>
  );
}