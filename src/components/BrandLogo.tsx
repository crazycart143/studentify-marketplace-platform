"use client";

import React from "react";
import { motion } from "framer-motion";

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "", 
  iconOnly = false,
  size = "md" 
}) => {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-10 h-10", text: "text-2xl" },
    lg: { icon: "w-14 h-14", text: "text-4xl" },
    xl: { icon: "w-20 h-20", text: "text-6xl" },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* The Styled "S-Shield" Logo */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${currentSize.icon} relative group`}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Main Shield Shape */}
          <path 
            d="M50 5L15 20V45C15 67.5 30 88 50 95C70 88 85 67.5 85 45V20L50 5Z" 
            fill="url(#logo-gradient)" 
          />
          
          {/* The Stylized "S" Path */}
          <path 
            d="M65 35H40C37.2386 35 35 37.2386 35 40V45C35 47.7614 37.2386 50 40 50H60C62.7614 50 65 52.2386 65 55V60C65 62.7614 62.7614 65 60 65H35" 
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Mortarboard Dot (Decoration) */}
          <rect x="42" y="18" width="16" height="4" rx="2" fill="white" opacity="0.8" />

          <defs>
            <linearGradient id="logo-gradient" x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00B853" />
              <stop offset="1" stopColor="#008A3E" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>

      {!iconOnly && (
        <span className={`${currentSize.text} font-bold tracking-tight text-brand flex items-center`}>
          <span>Student</span>
          <span>ify</span>
        </span>
      )}
    </div>
  );
};
