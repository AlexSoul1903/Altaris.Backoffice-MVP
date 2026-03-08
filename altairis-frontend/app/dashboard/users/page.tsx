/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import UserModal from "@/components/UserModal";
import Select from "@/components/Select"; 

export default function UsersAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<any>("all");
  const [statusFilter, setStatusFilter] = useState<any>("all");

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
        await api.post("/Auth/register", formData); 
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el usuario.");
    }
  };

  // Lógica de Filtrado Combinado
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.roleId.toString() === roleFilter.toString();
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <div className="p-10 font-bold text-slate-500 italic">Cargando directorio de equipo...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Encabezado */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Directorio de Usuarios</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Administra el acceso y permisos del equipo de Altairis.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* PANEL DE FILTROS  */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        
        {/* Buscador de texto */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-slate-700 ml-1">Búsqueda rápida</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filtro por Rol */}
        <Select 
          label="Filtrar por Rol"
          value={roleFilter}
          onChange={(val) => setRoleFilter(val)}
          options={[
            { id: "all", label: "Todos los roles" },
            { id: 1, label: "Administradores" },
            { id: 2, label: "Agentes" },
          ]}
        />

        {/* Filtro por Estado */}
        <Select 
          label="Filtrar por Estado"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { id: "all", label: "Todos los estados" },
            { id: "active", label: "Acceso Activo" },
            { id: "inactive", label: "Cuentas Inactivas" },
          ]}
        />
      </div>

      {/* Tabla de Usuarios */}
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
            {filteredUsers.length > 0 ? filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-amber-500 transition-colors">
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
                    <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                    {u.isActive ? "Acceso Activo" : "Cuenta Inactiva"}
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
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-medium italic">
                  No se encontraron usuarios que coincidan con los filtros.
                </td>
              </tr>
            )}
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