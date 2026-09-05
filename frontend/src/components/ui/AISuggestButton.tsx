"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface AISuggestButtonProps {
  onClick?: (e?: React.MouseEvent) => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const AISuggestButton: React.FC<AISuggestButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  label = "SUGERIR CON IA",
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full 
        bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 
        text-white font-semibold text-xs shadow-md shadow-purple-900/20 
        border border-purple-300/30 transition-all duration-200 active:scale-95 
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
      ) : (
        <span className="text-sm select-none">🤖</span>
      )}
      <span className="tracking-wide">{isLoading ? "GENERANDO..." : label}</span>
    </button>
  );
};

export default AISuggestButton;
