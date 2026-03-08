"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import api from "@/services/api";
import Select from "@/components/Select"; 
import Toast from "@/components/Toast"; 

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState<number>(2); // 2 = Agente por defecto
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para el Toast
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null); // Limpiamos errores previos
    
    if (password !== confirmPassword) {
      setToast({ message: "Las contraseñas no coinciden.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      await api.post("/Auth/register", { 
        firstName, 
        lastName, 
        email, 
        password, 
        roleId 
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000); 
      
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setToast({ 
        message: axiosError.response?.data?.message || "Error al crear la cuenta. Verifica los datos.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-10 relative overflow-hidden">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Altairis <span className="text-amber-500">.</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Crear cuenta de acceso</p>
        </div>

        {success ? (
          <div className="p-6 bg-green-50 text-green-700 text-center rounded-2xl border border-green-200 animate-in zoom-in-95 duration-300">
            <h3 className="font-bold text-lg mb-1">¡Cuenta creada!</h3>
            <p className="text-sm">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            
            <Select 
              label="Nivel de Acceso"
              options={[
                { id: 2, label: "Agente (Lectura y reservas)" },
                { id: 1, label: "Administrador (Acceso total)" }
              ]}
              value={roleId}
              onChange={setRoleId}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
                  placeholder="Cristal Yamilet"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
                  placeholder="Frias Molina"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
                placeholder="cristal@altairis.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Confirmar
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-semibold py-4 rounded-2xl transition-all shadow-md mt-4"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-8 flex justify-end">
            <Link href="/login" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors group text-sm font-medium">
              <span className="text-amber-500 border border-amber-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] group-hover:bg-amber-500 group-hover:text-white transition-all">
                ›
              </span> 
              Volver al inicio
            </Link>
          </div>
        )}
      </div>

  
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