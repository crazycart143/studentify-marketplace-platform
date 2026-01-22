"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlass, CaretDown, Check } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface University {
  name: string;
  country: string;
  domains: string[];
}

interface UniversitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'college' | 'shs';
}

export const UniversitySearch: React.FC<UniversitySearchProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search your university...",
  type = 'college'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState(value);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset search when type changes
    if (!value) setSearch("");
    setUniversities([]);
    
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'shs' ? "/api/universities?type=shs" : "/api/universities";
        const res = await fetch(endpoint);
        const data = await res.json();
        // Remove duplicates and sort
        const unique = Array.from(new Set(data.map((u: any) => u.name)))
          .sort()
          .map(name => data.find((u: any) => u.name === name));
        
        // Manual Additions
        const customUniversities = [
          { name: "Philippine Women's College of Davao", country: "Philippines", domains: [] }
          // Add other missing ones here
        ];

        setUniversities([...unique, ...customUniversities].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error("Failed to fetch universities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, [type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUniversities = universities.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10); // Show top 10 matches

  const handleSelect = (name: string) => {
    onChange(name);
    setSearch(name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative group">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors" />
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            // Also allow custom entry if not in list
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black placeholder:text-slate-400"
        />
        <CaretDown 
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (filteredUniversities.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center text-slate-400 text-sm font-medium flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                <span>Loading campuses...</span>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {filteredUniversities.map((uni) => (
                  <button
                    key={uni.name}
                    onClick={() => handleSelect(uni.name)}
                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                  >
                    <span className={`text-sm font-medium ${value === uni.name ? "text-brand" : "text-slate-700 hover:text-black"}`}>
                      {uni.name}
                    </span>
                    {value === uni.name && <Check className="w-4 h-4 text-brand" />}
                  </button>
                ))}
                
                {search && filteredUniversities.length === 0 && (
                  <button
                    onClick={() => handleSelect(search)}
                    className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex flex-col items-start group border-t border-slate-50"
                  >
                    <span className="text-sm font-semibold text-black group-hover:text-brand flex items-center">
                       Use "{search}"
                       {value === search && <Check className="w-4 h-4 ml-2 text-brand" />}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Campus not listed? Select this to submit it for verification.
                    </span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
