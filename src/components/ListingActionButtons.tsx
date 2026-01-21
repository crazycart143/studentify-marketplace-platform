"use client";

import React, { useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import OfferModal from './OfferModal';

export default function ListingActionButtons({ listing }: any) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full py-4 bg-indigo-600 text-white rounded-[24px] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2 group"
        >
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Buy Now</span>
        </button>
        
        <button
          onClick={() => setIsOfferOpen(true)}
          className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-[24px] font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2 group"
        >
          <Tag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Make Offer</span>
        </button>
      </div>

      <CheckoutModal 
        listing={listing} 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      <OfferModal 
        listing={listing} 
        isOpen={isOfferOpen} 
        onClose={() => setIsOfferOpen(false)} 
      />
    </div>
  );
}
