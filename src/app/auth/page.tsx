"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingBag, Mail, Lock, Github, Chrome, AlertCircle, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from "@/lib/supabase";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const errorParam = searchParams.get('error_description') || searchParams.get('error');
    if (errorParam) {
      setError(errorParam.replace(/\+/g, ' '));
    }
    
    const view = searchParams.get('view');
    if (view === 'sign_up') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;
        
        if (data.user && data.session === null) {
          // Email confirmation sent
          setStep('success');
          toast.success('Please check your email to verify your account');
        } else {
          toast.success('Account created successfully!');
          router.push('/profile');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        toast.success('Welcome back!');
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    const next = searchParams.get('next') || '/profile';
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      toast.error(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px] opacity-60 animate-pulse" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-brand/10 rounded-full blur-[100px] opacity-40 animate-pulse" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-brand" />
          </div>
          <h2 className="text-3xl font-black text-black mb-4">Check Your Inbox</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            We've sent a verification link to <span className="text-black font-bold">{email}</span>. 
            Please verify your email to activate your account.
          </p>
          <button 
            onClick={() => {
              setStep('form');
              setIsSignUp(false);
            }}
            className="w-full bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-40 pb-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-brand/10 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-brand/10 p-10 relative z-10 border border-white/50"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-all duration-300">
              <ShoppingBag className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-black text-black tracking-tight">Studentify</span>
          </Link>
          <h1 className="text-4xl font-black text-black tracking-tight mb-3">
            {isSignUp ? "Join the Campus" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 font-medium whitespace-pre-line">
            {isSignUp ? "Create your student account to start trading." : "Join the student community today."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-black font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
            </div>
            <input
              type="email"
              required
              className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-black font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              placeholder="Your student email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-black font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm font-bold text-slate-500 hover:text-brand transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full group bg-gradient-to-r from-brand to-brand-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand/20 hover:shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
          >
            <span>{loading ? (isSignUp ? "Creating..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}</span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="flex items-center justify-center space-x-3 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            <Chrome className="w-5 h-5 text-[#4285F4]" />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading}
            className="flex items-center justify-center space-x-3 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-center text-slate-500 font-medium">
          {isSignUp ? "Already have an account?" : "New to Studentify?"}{' '}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand font-bold hover:underline"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
