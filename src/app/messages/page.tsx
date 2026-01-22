"use client";

import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ShoppingBag, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getConversations() {
      // Wait until auth is determined
      if (authLoading) return;

      // Redirect if not logged in
      if (!user) {
        window.location.href = "/auth";
        return;
      }

      try {
        console.log('[MessagesPage] Fetching conversations for user:', user.id);
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            listing:listings (id, title, images),
            buyer:profiles!buyer_id (id, full_name, avatar_url),
            seller:profiles!seller_id (id, full_name, avatar_url)
          `)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('[MessagesPage] Found conversations:', data?.length || 0);
        setConversations(data || []);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setDataLoading(false);
      }
    }
    
    getConversations();
  }, [user, authLoading]);

  // Show loading while auth OR data is still fetching
  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 text-left">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-black tracking-tight">Your Messages</h1>
          <p className="text-slate-500 font-medium">Manage your deals and conversations.</p>
        </div>

        {conversations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-black">No messages yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mt-2 font-medium">
              Start browsing and contact sellers to see your messages here.
            </p>
            <Link 
              href="/browse" 
              className="mt-8 inline-block px-8 py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-xl shadow-brand/10"
            >
              Browse Marketplace
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {conversations.map((convo: any) => {
              // Correctly identify the "other" person using IDs since IDs are more reliable than names
              const otherPerson = convo.buyer.id === user?.id ? convo.seller : convo.buyer;
              const listingImage = convo.listing?.images?.[0];

              return (
                <motion.div
                  key={convo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link 
                    href={`/messages/${convo.id}`}
                    className="group block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden">
                          {otherPerson.avatar_url ? (
                            <img src={otherPerson.avatar_url} alt={otherPerson.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <User className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-2 border-white rounded-xl shadow-md overflow-hidden">
                          {listingImage ? (
                            <img src={listingImage} alt="Listing" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                              <ShoppingBag className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grow min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-black text-black truncate group-hover:text-brand transition-colors">
                            {otherPerson.full_name || 'User'}
                          </h3>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(convo.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-500 font-bold text-sm truncate mb-1">
                          Re: {convo.listing?.title || 'Shared Listing'}
                        </p>
                        <p className="text-slate-400 text-sm truncate italic">
                          Click to view conversation...
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
