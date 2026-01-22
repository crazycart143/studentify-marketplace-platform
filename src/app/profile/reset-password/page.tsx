"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Strength Calculation
    let score = 0;
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-brand"];
    
    setStrength({
      score,
      label: labels[score],
      color: colors[score]
    });
  }, [password]);

  // On mount, if there's a token in the URL, apply it silently
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token });
      }
    }
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Your secure window expired. Please request a new link.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Account secured! Redirecting to sign in...");
      await supabase.auth.signOut();
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => router.replace("/auth"), 2000);
    }
    setLoading(false);
  }

  const isMatching = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-40 pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-brand/10 p-10 border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-brand w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-black tracking-tight mb-3">New Password</h1>
          <p className="text-slate-500 font-medium">Reset your password to regain access.</p>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <CheckCircle2 className="text-green-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Updated!</h2>
            <p className="text-slate-500">Taking you back to your profile...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Studentify2024!"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl outline-none transition-all font-medium pr-14"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-3 px-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strength: {strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={`h-full flex-1 transition-all duration-500 ${strength.score >= i ? strength.color : "bg-slate-100"}`} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative text-left">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center ${isMatching ? "text-green-500" : "text-red-400"}`}>
                    {isMatching ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Match</>
                    ) : (
                      "No Match"
                    )}
                  </span>
                )}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium ${
                  confirmPassword.length > 0 
                    ? isMatching 
                      ? "border-green-100 focus:border-green-200" 
                      : "border-red-100 focus:border-red-200"
                    : "border-transparent focus:border-brand/20 focus:bg-white"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isMatching || strength.score < 2}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <span>Update Password</span>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
