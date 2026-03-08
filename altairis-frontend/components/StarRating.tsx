"use client";
import React, { useState } from "react";

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (rating: number) => void;
}

export default function StarRating({ label, value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="flex gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-fit">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-all duration-200 transform ${
              star <= (hover || value) ? "scale-125 grayscale-0" : "grayscale opacity-40 scale-100"
            }`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ⭐
          </button>
        ))}
        <span className="ml-2 text-sm font-bold text-slate-400 self-center">
          {value} {value === 1 ? "Estrella" : "Estrellas"}
        </span>
      </div>
    </div>
  );
}