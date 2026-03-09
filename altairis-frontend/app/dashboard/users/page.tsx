/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import UserModal from "@/components/UserModal"; 
import Select from "@/components/Select";
import Toast from "@/components/Toast";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<any>("all");
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Users");
      setUsers(response.data);
    } catch (err) {
      setToast({ message: "No se pudo cargar el directorio.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (formData: any, isEditing: boolean) => {
    try {
      if (isEditing) {
        await api.put(`/Users/${formData.id}`, formData);
      } else {
        await api.post("/Users", formData); 
      }
      setIsModalOpen(false);
      fetchData();
      setToast({ message: isEditing ? "Actualizado." : "Creado.", type: "success" });
    } catch (err: any) {
      setToast({ message: "Error al guardar.", type: "error" });
    }
  };

const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/Users/${userToDelete.id}`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchData();
      setToast({ message: "Usuario eliminado del sistema.", type: "success" });

      if (paginatedUsers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err: any) {
      // 1. Extraemos la respuesta del servidor
      const data = err.response?.data;
      
      let errorMessage = "Ocurrió un error inesperado.";

      // 2. Lógica para capturar el mensaje real enviado por el BadRequest de .NET
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data?.message) {
    
        errorMessage = data.message;
      } else if (data?.errors) {
    
        errorMessage = Object.values(data.errors).flat().join(" ");
      } else if (data?.title) {
        errorMessage = data.title;
      }

      setIsDeleteModalOpen(false);
      // 3. Pasamos el mensaje real al Toast
      setToast({ message: errorMessage, type: "error" });
    }
  };
  // --- LÓGICA FILTRADO ---
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email?.toLowerCase() || "";

    const matchesSearch = name.includes(term) || email.includes(term);
    
    // roleFilter "Admin" busca ID 1, "Agent" busca ID 2
    let matchesRole = true;
    if (roleFilter === "Admin") matchesRole = u.roleId === 1;
    if (roleFilter === "Agent") matchesRole = u.roleId === 2;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="p-10 font-bold text-slate-500 italic">Cargando...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Usuarios del Sistema</h1>
          <p className="text-slate-500 mt-2 font-medium">Administra los accesos y roles del hotel.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all transform hover:scale-105"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-slate-700">Buscar por nombre o correo</label>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-amber-500">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" placeholder="Ej. Alex Frías..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700"
            />
          </div>
        </div>

        <Select 
          label="Filtrar por Rol" 
          value={roleFilter} 
          onChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
          options={[
            { id: "all", label: "Todos los roles" }, 
            { id: "Admin", label: "Administradores" }, 
            { id: "Agent", label: "Agentes de Reserva" }
          ]}
        />
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase text-xs tracking-widest">
            <tr>
              <th className="px-8 py-6">Perfil del Usuario</th>
              <th className="px-8 py-6">Nivel de Acceso</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                      {u.firstName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-sm font-medium text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    u.roleId === 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {u.roleId === 1 ? 'Administrador' : 'Agente'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right space-x-4">
                  <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="text-slate-400 hover:text-amber-600 font-bold text-sm">Editar</button>
                  <button onClick={() => { setUserToDelete(u); setIsDeleteModalOpen(true); }} className="text-red-300 hover:text-red-600 font-bold text-sm">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-bold bg-white border rounded-lg disabled:opacity-50">Anterior</button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-bold bg-white border rounded-lg disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      <UserModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        user={editingUser} onSubmit={handleSaveUser}
      />

      {/* MODAL BORRADO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">¿Eliminar Usuario?</h3>
            <p className="text-slate-500 mb-8">Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white px-6 py-4 rounded-2xl font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}