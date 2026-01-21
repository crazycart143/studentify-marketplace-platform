"use client";

import React, { useState } from 'react';
import { X, Tag, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OfferModal({ listing, isOpen, onClose }: any) {
  const [amount, setAmount] = useState(listing.price);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to make an offer");
        return;
      }

      if (amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const { error } = await supabase
        .from('offers')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          amount: amount,
          message: message,
          status: 'pending',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success("Offer sent successfully!");
      onClose();
      router.refresh();
    } catch (err: any) {
      console.error('Error sending offer:', err);
      toast.error(err.message || "Failed to send offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-8 lg:p-10 text-left">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Make an Offer</h2>
                  <p className="text-slate-500 font-medium">For: {listing.title}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Your Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-5 pl-12 pr-6 text-2xl font-black text-slate-900 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400 font-bold">Asking Price: ${listing.price.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Optional Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 font-medium text-slate-900 focus:border-indigo-600 focus:bg-white transition-all outline-none resize-none"
                    placeholder="Tell the seller why you're making this offer..."
                  />
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-indigo-900 text-sm">Offer Policy</h4>
                      <p className="text-indigo-700/70 text-xs font-medium mt-1 leading-relaxed">
                        Offers expire in 48 hours. If the seller accepts, you'll be notified to complete the payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Offer</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all font-black"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
