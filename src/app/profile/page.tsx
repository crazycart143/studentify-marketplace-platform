"use client";

import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Settings, 
  Package, 
  MessageSquare, 
  LogOut, 
  Camera,
  LayoutDashboard
} from 'lucide-react';

import AvatarUpload from '@/components/AvatarUpload';
import OffersList from '@/components/OffersList';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    listings: 0,
    sales: 0,
    messages: 0
  });

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        // Fetch stats
        const { count: listingsCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);

        const { count: convosCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        setStats({
          listings: listingsCount || 0,
          sales: 0, // Placeholder until payments/orders are implemented
          messages: convosCount || 0
        });
      }
      setLoading(false);
    }
    getData();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <AvatarUpload 
                  url={profile?.avatar_url} 
                  onUploadAction={(url: string) => setProfile({ ...profile, avatar_url: url })} 
                />
                <div className="mt-6">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {profile?.full_name || 'New User'}
                  </h2>
                  <p className="text-sm text-slate-500 font-bold mt-1">
                    @{profile?.username || 'user'}
                  </p>
                </div>
                <div className="mt-6 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider inline-block">
                  {profile?.role || 'Verified Member'}
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', href: '/profile' },
                  { icon: Package, label: 'My Listings', href: '/profile/listings' },
                  { icon: MessageSquare, label: 'Messages', href: '/messages' },
                  { icon: Settings, label: 'Settings', href: '/profile/settings' },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-bold text-sm"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm mt-6"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left"
            >
              <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                Account Overview
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Total Listings</span>
                  <div className="text-4xl font-black text-slate-900 mt-2">{stats.listings}</div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Total Balance</span>
                  <div className="text-4xl font-black text-slate-900 mt-2">${stats.sales.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Conversations</span>
                  <div className="text-4xl font-black text-slate-900 mt-2">{stats.messages}</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center">
                  Recent Offers
                </h2>
                <Link href="/profile/offers" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center">
                  View All Offers
                </Link>
              </div>
              <OffersList />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 text-left">Recent Activity</h2>
                <Link href="/profile/activity" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
              </div>
              
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900">No activity yet</h3>
                <p className="text-slate-500 max-w-xs mt-2">When you create listings or message sellers, your activity will appear here.</p>
                <Link 
                  href="/sell" 
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Create Your First Listing
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
