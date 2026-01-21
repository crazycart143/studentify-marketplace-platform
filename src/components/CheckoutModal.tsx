"use client";

import React, { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutForm = ({ clientSecret, listing, onSuccess, onCancel }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/listings/${listing.id}?payment=success`,
      },
      // If we don't want a redirect, we can handle it manually:
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {message && (
        <div id="payment-message" className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
          {message}
        </div>
      )}

      <div className="flex flex-col space-y-4 pt-4">
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <span>Pay ${listing.price.toLocaleString()}</span>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
      </div>
      
      <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
        <ShieldCheck className="w-4 h-4" />
        <span>Secure Secure Payment via Stripe</span>
      </div>
    </form>
  );
};

export default function CheckoutModal({ listing, isOpen, onClose }: any) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [isOpen, listing.id]);

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
            <div className="p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Complete Purchase</h2>
                  <p className="text-slate-500 font-medium">Buying: {listing.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {clientSecret ? (
                <Elements
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#4f46e5', // indigo-600
                        borderRadius: '16px',
                      },
                    },
                  }}
                  stripe={getStripe()}
                >
                  <CheckoutForm
                    clientSecret={clientSecret}
                    listing={listing}
                    onSuccess={() => {
                      onClose();
                      window.location.href = `/listings/${listing.id}?payment=success`;
                    }}
                    onCancel={onClose}
                  />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Checkout...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
