// src/components/Select.tsx
"use client";

import { useState, useRef, useEffect } from "react";

// Definimos la estructura exacta que deben tener las opciones
export interface SelectOption {
  id: string | number;
  label: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
}

export default function Select({ label, options, value, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.id === value)?.label || "Seleccionar...";


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 bg-slate-50 text-slate-900 rounded-2xl cursor-pointer flex items-center justify-between transition-all select-none border border-transparent ${isOpen ? 'ring-2 ring-amber-500 bg-white' : 'hover:bg-slate-100'}`}
      >
        <span className="truncate pr-4">{selectedLabel}</span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`px-5 py-4 cursor-pointer transition-colors text-sm font-medium flex items-center justify-between
                  ${value === option.id 
                    ? 'bg-amber-50 text-amber-700' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-amber-600'
                  }`}
              >
                {option.label}
                {value === option.id && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}