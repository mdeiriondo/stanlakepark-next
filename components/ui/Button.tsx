"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "outline"
    | "whiteOutline"
    | "wedding"
    | "weddingOutline";
  children: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "relative px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-500 overflow-hidden group border select-none flex items-center justify-center gap-3";

  const styles = {
    primary:
      "border-[#760235] bg-[#760235] text-white hover:bg-white hover:text-[#760235]",
    outline:
      "border-[#760235] text-[#760235] hover:bg-[#760235] hover:text-white",
    whiteOutline: "border-white text-white hover:bg-white hover:text-black",
    wedding:
      "border-[#1a1a1a] bg-[#1a1a1a] text-white hover:bg-white hover:text-[#1a1a1a]",
    weddingOutline:
      "border-gray-300 text-gray-900 hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-3">
        {children}{" "}
        <ArrowRight
          size={14}
          className="group-hover:translate-x-2 transition-transform duration-500"
        />
      </span>
    </button>
  );
}
