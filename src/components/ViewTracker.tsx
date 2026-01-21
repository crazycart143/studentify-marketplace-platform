"use client";

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function ViewTracker({ listingId }: { listingId: string }) {
  const supabase = createClient();

  useEffect(() => {
    // Small delay to ensure it's a "real" view and not a bounce
    const timer = setTimeout(async () => {
      try {
        await supabase.rpc('increment_listing_view', { l_id: listingId });
      } catch (err) {
        console.error('Error tracking view:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [listingId, supabase]);

  return null;
}
