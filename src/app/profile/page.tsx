"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Gear as Settings, 
  Package, 
  ChatCircleDots as MessageSquare, 
  SignOut as LogOut, 
  SquaresFour as LayoutDashboard,
  Student as GraduationCap,
  Briefcase,
  FileText,
  Users,
  Spinner as Loader2,
  Clock
} from '@phosphor-icons/react';

import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';
import AvatarUpload from '@/components/AvatarUpload';
import OffersList from '@/components/OffersList';
import FavoritesList from '@/components/FavoritesList';
import SellerAnalytics from '@/components/SellerAnalytics';
import SkillsSection from '@/components/SkillsSection';
import VerificationBadge from '@/components/VerificationBadge';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const supabase = createClient();
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    listings: 0,
    sales: 0,
    messages: 0
  });

  useEffect(() => {
    async function getStats() {
      if (user) {
        try {
          const [listingsRes, convosRes] = await Promise.all([
            supabase.from('listings').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
            supabase.from('conversations').select('*', { count: 'exact', head: true }).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          ]);

          setStats({
            listings: listingsRes.count || 0,
            sales: 0,
            messages: convosRes.count || 0
          });
        } catch (err) {
          console.error("Stats load error:", err);
        } finally {
          setDataLoading(false);
        }
      } else {
        setDataLoading(false);
      }
    }
    getStats();
  }, [user]);

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 font-sans">
      <div className="container mx-auto max-w-7xl">
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
                  url={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                  onUploadAction={refreshProfile} 
                />
                <div className="mt-6 w-full px-2">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center space-x-2 max-w-full">
                      <h2 className="text-xl font-semibold text-black leading-tight truncate w-full text-center" title={profile?.full_name || 'User'}>
                        {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'New User'}
                      </h2>
                      <div className="shrink-0">
                        <VerificationBadge isVerified={profile?.is_verified} showText={false} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-1 truncate w-full text-center">
                      @{profile?.username || user?.user_metadata?.user_name || 'user'}
                    </p>
                  </div>
                </div>
                
                {profile?.university && (
                  <div className="mt-6 flex flex-col items-center gap-2 text-center w-full">
                    <div className="text-brand font-semibold text-[11px] uppercase tracking-wider leading-snug px-4">
                      <span>{profile.university}</span>
                    </div>
                    {profile.major && (
                      <div className="text-slate-500 text-[10px] font-medium px-4">
                        {profile.major} • {profile.year_of_study || 'Student'}
                      </div>
                    )}
                  </div>
                )}

                <div className={`mt-6 px-4 py-1.5 text-[10px] font-semibold rounded-full uppercase tracking-wider inline-block ${profile?.is_verified ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-500'}`}>
                  {profile?.is_verified ? 'Verified Seller' : 'Unverified Student'}
                </div>

                {!profile?.is_verified && profile?.verification_doc_url && (
                  <div className="mt-4 w-full p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3 text-left">
                     <div className="mt-0.5"><Clock className="w-4 h-4 text-amber-600 animate-pulse" /></div>
                     <div>
                       <p className="text-xs font-bold text-amber-800">Verification Pending</p>
                       <p className="text-[10px] text-amber-700 font-medium mt-0.5 leading-relaxed">
                         Our team is reviewing your documents. This typically takes 1-2 days.
                       </p>
                     </div>
                  </div>
                )}
              </div>

              <nav className="space-y-2">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', href: '/profile' },
                  { icon: Package, label: 'My Listings', href: '/profile/listings' },
                  { icon: Briefcase, label: 'My Projects', href: '/profile/projects' },
                  { icon: Users, label: 'My Agencies', href: '/profile/agencies' },
                  { icon: MessageSquare, label: 'Messages', href: '/messages' },
                  { icon: Settings, label: 'Settings', href: '/profile/settings' },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.label === 'Messages' ? '/messages' : item.href}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-brand transition-all font-medium text-sm"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button 
                  onClick={signOut}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm mt-6"
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
              <h1 className="text-2xl font-semibold text-black mb-8 flex items-center justify-between">
                <span>Account Overview</span>
                <Link 
                  href="/profile/resume"
                  className="px-6 py-3 bg-brand text-white rounded-2xl font-semibold text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand/10"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume Autopilot</span>
                </Link>
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[2px]">Total Listings</span>
                  <div className="text-4xl font-semibold text-black mt-2">{stats.listings}</div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[2px]">Total Balance</span>
                  <div className="text-4xl font-semibold text-black mt-2">${stats.sales.toFixed(2)}</div>
                </div>
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[2px]">Conversations</span>
                  <div className="text-4xl font-semibold text-black mt-2">{stats.messages}</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left"
            >
              <h2 className="text-2xl font-semibold text-black mb-8 flex items-center">
                Seller Insights
              </h2>
              <SellerAnalytics />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-black flex items-center">
                  Recent Offers
                </h2>
                <Link href="/profile/offers" className="text-xs font-semibold text-brand uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center">
                  View All Offers
                </Link>
              </div>
              <OffersList />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-black flex items-center">
                  My Favorites
                </h2>
                <Link href="/profile/favorites" className="text-xs font-bold text-brand uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center">
                  View All Favorites
                </Link>
              </div>
              <FavoritesList />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left"
            >
              <h2 className="text-2xl font-semibold text-black mb-8 flex items-center">
                Skills & Endorsements
              </h2>
              <SkillsSection profileId={user?.id || ''} isOwnProfile={true} />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
