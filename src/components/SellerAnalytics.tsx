"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import AnalyticsCharts from './AnalyticsCharts';
import { TrendingUp, Eye, Heart, BarChart3, Loader2 } from 'lucide-react';

export default function SellerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalFavorites: 0,
    topListing: ''
  });
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalytics() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        // Fetch views grouped by day for the last 7 days
        const { data: viewsData, error: viewsError } = await supabase
          .from('listing_views')
          .select(`
            created_at,
            listing:listing_id (title, owner_id)
          `)
          .eq('listing.owner_id', user.id);

        if (viewsData && isMounted) {
          // Simple grouping logic for the chart
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();

          const grouped = last7Days.map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: viewsData.filter(v => v.created_at.startsWith(date)).length
          }));

          setData(grouped);
          setStats(prev => ({ ...prev, totalViews: viewsData.length }));
        }

        // Fetch total favorites for seller's listings
        const { data: favsData } = await supabase
          .from('favorites')
          .select(`
            listing:listing_id (owner_id)
          `)
          .eq('listing.owner_id', user.id);
        
        if (favsData && isMounted) {
          setStats(prev => ({ ...prev, totalFavorites: favsData.length }));
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Analytics load error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-brand/5 rounded-3xl border border-brand/10 flex items-center space-x-4">
          <div className="p-3 bg-white rounded-2xl text-brand shadow-sm">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black text-brand/60 uppercase tracking-widest">Growth Views</span>
            <div className="text-2xl font-black text-brand">{stats.totalViews}</div>
          </div>
        </div>
        <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100/50 flex items-center space-x-4">
          <div className="p-3 bg-white rounded-2xl text-rose-600 shadow-sm">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-black text-rose-600/60 uppercase tracking-widest">Total Loves</span>
            <div className="text-2xl font-black text-rose-900">{stats.totalFavorites}</div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">7-Day View Trend</h3>
        </div>
        <AnalyticsCharts data={data} />
      </div>
    </div>
  );
}
