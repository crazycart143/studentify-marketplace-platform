"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const supabase = createClient();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        toast.success("Welcome back! Signed in successfully.");
      }
      if (event === 'SIGNED_OUT') {
        toast.info("Signed out successfully.");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-100 p-8 relative z-10 border border-slate-100"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Studentify</span>
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome to the Campus</h1>
          <p className="text-slate-500 font-medium">Join thousands of students buying and selling daily.</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4f46e5',
                  brandAccent: '#4338ca',
                },
                radii: {
                  borderRadiusButton: '12px',
                }
              }
            }
          }}
          providers={['github', 'google']}
          redirectTo={`${origin}/auth/callback`}
        />
      </motion.div>
    </div>
  );
}
