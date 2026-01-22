"use client";

import { useAuth } from "@/components/AuthProvider";
import CreateListingForm from "@/components/CreateListingForm";
import { ShoppingBag, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function SellPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/auth";
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Checking Authenticity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-4xl text-left">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tight mb-4">
            Turn Your Items into <span className="text-brand">Earnings</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Join thousands of student sellers on Studentify. It takes less than 2 minutes to create a professional listing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-white p-6 rounded-3xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700">Campus Verified</span>
            </div>
            <div className="bg-white p-6 rounded-3xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700">Instant Publishing</span>
            </div>
            <div className="bg-white p-6 rounded-3xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700">Direct to Peers</span>
            </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
        >
          <CreateListingForm />
        </motion.div>

        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
          <p>By publishing, you agree to Studentify's Terms of Service and Privacy Policy.</p>
          <p className="mt-2 text-center">Need help? <a href="/support" className="text-brand font-bold hover:underline">Contact our support team.</a></p>
        </div>
      </div>
    </div>
  );
}
