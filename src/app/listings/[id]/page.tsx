import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  MessageCircle, 
  Share2, 
  Heart,
  ChevronRight,
  User,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import ContactSellerButton from "@/components/ContactSellerButton";
import ReviewSection from "@/components/ReviewSection";
import ListingActionButtons from "@/components/ListingActionButtons";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import ReportButton from "@/components/ReportButton";
import VerificationBadge from "@/components/VerificationBadge";
import FollowButton from "@/components/FollowButton";
import SimilarItems from "@/components/SimilarItems";
import ViewTracker from "@/components/ViewTracker";
import * as motion from "framer-motion/client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase.from('listings').select('title, description').eq('id', id).single();

  return {
    title: listing ? `${listing.title} | MarketPro` : 'Listing Not Found',
    description: listing?.description || 'View this item on MarketPro.',
  };
}

export default async function ListingDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ payment?: string }> }) {
  const { id } = await params;
  const { payment } = await searchParams;
  const supabase = await createClient();

  // Fetch listing with owner details
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles:owner_id (
        full_name,
        username,
        avatar_url,
        created_at,
        is_verified
      )
    `)
    .eq('id', id)
    .single();

  if (error || !listing) {
    return notFound();
  }

  const formattedDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <ViewTracker listingId={listing.id} />
      <div className="container mx-auto max-w-7xl">
        {payment === 'success' && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-emerald-900">Purchase Successful!</h3>
                <p className="text-emerald-700/70 text-sm font-medium">Your payment has been processed and the seller has been notified.</p>
              </div>
            </div>
            <Link href="/profile" className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all">
              View Order
            </Link>
          </div>
        )}
        <Link 
          href="/browse" 
          className="inline-flex items-center space-x-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: Images & Description */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[40px] p-4 border border-slate-100 shadow-sm">
              <div className="relative aspect-video rounded-[32px] overflow-hidden bg-slate-100">
                {listing.images && listing.images[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBag className="w-24 h-24" />
                  </div>
                )}
                
                {/* Image Gallery Nav (Mock) */}
                {listing.images?.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                    {listing.images.map((_: any, i: number) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white shadow-lg' : 'bg-white/40'}`} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails (Mock) */}
              {listing.images?.length > 1 && (
                <div className="grid grid-cols-6 gap-4 mt-4 p-2">
                  {listing.images.map((img: string, i: number) => (
                    <div key={i} className={`aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 ${i === 0 ? 'border-indigo-600' : 'border-transparent opacity-60 hover:opacity-100 transition-all'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-100 shadow-sm text-left">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                Description
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Listed</span>
                  <p className="font-bold text-slate-700">{formattedDate}</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Condition</span>
                  <p className="font-bold text-slate-700">Excellent</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</span>
                  <p className="font-bold text-slate-700">Online / Remote</p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category</span>
                  <p className="font-bold text-slate-700">{listing.category}</p>
                </div>
              </div>

              <ReviewSection sellerId={listing.owner_id} listingId={listing.id} />
              <SimilarItems category={listing.category} currentListingId={listing.id} />
            </div>
          </div>

          {/* Right Side: Price, Actions & Seller Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[40px] p-8 lg:p-10 border border-slate-100 shadow-xl shadow-indigo-100/20 text-left">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[2px] rounded-full mb-4">
                    Active Listing
                  </span>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {listing.title}
                  </h1>
                </div>
                <FavoriteButton listingId={listing.id} />
              </div>

              <div className="mb-10">
                <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Current Price</span>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  ${listing.price.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4">
                <ListingActionButtons listing={listing} />
                <ContactSellerButton listingId={listing.id} sellerId={listing.owner_id} />
                <div className="grid grid-cols-2 gap-4">
                  <ShareButton title={listing.title} url={""} />
                  <ReportButton listingId={listing.id} />
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm text-left">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">About the Seller</h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 overflow-hidden border-2 border-white shadow-md">
                  {listing.profiles?.avatar_url ? (
                    <img src={listing.profiles.avatar_url} alt="Seller" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-slate-900 text-lg underline decoration-indigo-100 decoration-4 underline-offset-4">
                      {listing.profiles?.full_name || 'Verified Seller'}
                    </h4>
                    <VerificationBadge isVerified={listing.profiles?.is_verified} showText={false} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-slate-500 font-medium">@{listing.profiles?.username || 'user'}</p>
                    <FollowButton followingId={listing.owner_id} />
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Trusted Seller</span>
                </div>
                <Link href={`/seller/${listing.owner_id}`} className="text-xs font-black text-slate-400 hover:text-indigo-600 flex items-center transition-colors">
                  View Profile <ChevronRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
