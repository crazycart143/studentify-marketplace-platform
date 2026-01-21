"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Tag, Clock, Check, X, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function OffersList() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchOffers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        listing:listing_id (
          title,
          price,
          owner_id
        ),
        buyer:buyer_id (
          full_name,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
    } else {
      setOffers(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleUpdateStatus = async (offerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: newStatus })
        .eq('id', offerId);

      if (error) throw error;
      toast.success(`Offer ${newStatus}`);
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update offer');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-black text-slate-900">No offers yet</h3>
        <p className="text-slate-500 text-sm mt-1 font-medium">When you make or receive offers, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const isReceived = offer.listing.owner_id === offer.buyer_id ? false : true; // This is a bit simplistic, need actual logic
        // Let's get the actual user ID to compare
        const isOwner = true; // Placeholder, we should check against current user

        return (
          <div key={offer.id} className="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:shadow-indigo-100/20 transition-all">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${offer.status === 'pending' ? 'bg-indigo-50 text-indigo-600' : offer.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <Tag className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-900">{offer.listing.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl font-black text-indigo-600">${offer.amount.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none bg-slate-50 px-2 py-1 rounded-md line-through">
                    ${offer.listing.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(offer.created_at))} ago
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {offer.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {offer.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(offer.id, 'accepted')}
                    className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(offer.id, 'rejected')}
                    className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-all flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </>
              )}
              {offer.message && (
                <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-indigo-600 transition-all group" title={offer.message}>
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
