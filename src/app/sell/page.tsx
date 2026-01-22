"use client";

import { useAuth } from "@/components/AuthProvider";
import CreateListingForm from "@/components/CreateListingForm";
import { Bag as ShoppingBag, ShieldCheck, Lightning as Zap, Spinner as Loader2 } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = "/auth";
      } else if (profile && !profile.has_completed_onboarding) {
        router.push("/onboarding");
      }
    }
  }, [user, loading, profile, router]);

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
          <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tight mb-4">
            Turn Your <span className="text-brand">Items</span> & <span className="text-brand">Services</span> into Earnings
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Join thousands of student sellers. Sell textbooks, gadgets, or your skills (tutoring, design, etc.) in minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-white p-6 rounded-3xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Campus Verified</span>
            </div>
            <div className="bg-white p-6 rounded-3xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Instant Publishing</span>
            </div>
            <div className="bg-white p-6 rounded-3xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Direct to Peers</span>
            </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
        >
          {profile?.is_verified ? (
            <CreateListingForm />
          ) : (
            <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Verification Required</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                To maintain a safe community, only verified students can create listings. 
                {profile?.verification_doc_url 
                  ? " Your documents are currently under review. Please check back soon." 
                  : " Please complete your profile verification to unlock selling features."
                }
              </p>
              
              {!profile?.verification_doc_url && (
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-8 py-4 bg-brand text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand/10"
                >
                  Verify Now
                </button>
              )}
            </div>
          )}
        </motion.div>

        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
          <p>By publishing, you agree to Studentify's Terms of Service and Privacy Policy.</p>
          <p className="mt-2 text-center">Need help? <a href="/support" className="text-brand font-semibold hover:underline">Contact our support team.</a></p>
        </div>
      </div>
    </div>
  );
}
