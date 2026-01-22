"use client";

import { useAuth } from "@/components/AuthProvider";
import { Warning, Info, X, CaretUp } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationWidget() {
  const { profile, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show if user is logged in, profile exists, and NOT verified
    // Also hide on onboarding and auth pages to avoid clutter
    if (user && profile && !profile.is_verified && !pathname.includes('/auth') && !pathname.includes('/onboarding')) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, profile, pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-2 bg-white px-4 py-3 rounded-full shadow-xl border border-amber-200 hover:bg-slate-50 transition-colors group"
          >
             <div className="relative">
               <Warning className="w-5 h-5 text-amber-500 fill-current" weight="fill" />
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
             </div>
             <span className="text-xs font-bold text-slate-700">Account Restricted</span>
             <CaretUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand transition-colors" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white p-5 rounded-2xl shadow-2xl border border-amber-100 max-w-sm flex items-start space-x-4 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
            
            <div className="mt-1 shrink-0">
              {profile?.verification_doc_url ? (
                <Info className="w-6 h-6 text-blue-500 fill-current" weight="fill" />
              ) : (
                <Warning className="w-6 h-6 text-amber-500 fill-current" weight="fill" />
              )}
            </div>

            <div className="flex-1 pr-6">
              <h4 className="text-sm font-bold text-slate-800">
                {profile?.verification_doc_url ? "Verification in Progress" : "Account Restricted"}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {profile?.verification_doc_url 
                  ? "We're reviewing your documents. Full access coming soon!"
                  : "You can visit the marketplace, but you need to verify your student status to sell."
                }
              </p>

              {!profile?.verification_doc_url && (
                <Link 
                  href="/onboarding" 
                  className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest text-brand hover:text-brand-dark hover:underline"
                >
                  Verify Now &rarr;
                </Link>
              )}
            </div>

            <button 
              onClick={() => setIsMinimized(true)}
              className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
