import React from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "error", onClose }: ToastProps) {
  const isError = type === "error";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Tarjeta del Popup */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-8 text-center flex flex-col items-center">
          
          {/* Círculo con Icono animado */}
          <div className={`flex items-center justify-center w-24 h-24 rounded-[2rem] mb-6 ${
            isError ? 'bg-red-50 text-red-500 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]' : 'bg-emerald-50 text-emerald-500 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]'
          }`}>
            {isError ? (
              // Icono de Error
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            ) : (
              // Icono de Éxito
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>

          {/* Textos */}
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
            {isError ? '¡Atención!' : '¡Éxito!'}
          </h3>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {message}
          </p>

          {/* Botón de Acción */}
          <button 
            onClick={onClose} 
            className={`w-full py-4 rounded-2xl font-bold transition-all transform active:scale-95 ${
              isError 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
            }`}
          >
            {isError ? 'Entendido' : 'Continuar'}
          </button>
          
        </div>
      </div>
    </div>
  );
}