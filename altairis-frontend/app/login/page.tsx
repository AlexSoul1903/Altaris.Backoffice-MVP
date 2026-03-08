"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import api from "@/services/api"; // O "../../services/api" según te haya funcionado
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/Auth/login", { email, password });
    localStorage.setItem("altairis_token", response.data.token);
localStorage.setItem("altairis_role", response.data.role);
localStorage.setItem("altairis_email", response.data.email);
      router.push("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message || "Error al iniciar sesión. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      

      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
        

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Altairis <span className="text-amber-500">.</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Gestión Hotelera</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
            Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              placeholder="alex@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all shadow-md flex justify-center items-center mt-2"
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </form>


        <div className="mt-8 flex flex-col items-end space-y-3 text-sm font-medium">
         
       <Link 
    href="/register" 
    className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors group"
  >
    <span className="text-amber-500 border border-amber-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] group-hover:bg-amber-500 group-hover:text-white transition-all">
      ›
    </span> 
    Registrarme
  </Link>
        </div>

      </div>
    </div>
  );
}