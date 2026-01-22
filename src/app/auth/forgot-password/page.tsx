"use client";

import { useState } from "react";
import { sendResetPasswordEmail } from "@/app/actions/auth";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    console.log('[Forgot Password] Sending reset email to:', email);
    
    try {
      const result = await sendResetPasswordEmail(email);
      
      console.log('[Forgot Password] Result:', result);

      if (result.success) {
        setSent(true);
        toast.success("Reset link sent! Check your email (and spam folder)");
      } else {
        console.error('[Forgot Password] Error:', result.error);
        toast.error(result.error || "Failed to send reset link.");
      }
    } catch (error) {
      console.error('[Forgot Password] Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-40 pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-brand/10 p-10 border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        
        <div className="text-center mb-10">
          <Link href="/auth" className="inline-flex items-center text-slate-400 hover:text-brand transition-colors font-bold text-sm mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
          
          <div className="w-16 h-16 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-brand w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-black text-black tracking-tight mb-3">Forgot Password?</h1>
          <p className="text-slate-500 font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        {sent ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500 w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">Check your email</h2>
            <p className="text-slate-500 mb-8">
              We've sent a password reset link to <br /><span className="font-bold text-black">{email}</span>
            </p>
            <button 
              onClick={() => setSent(false)}
              className="text-brand font-bold hover:underline"
            >
              Didn't receive the email? Try again
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-brand/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
