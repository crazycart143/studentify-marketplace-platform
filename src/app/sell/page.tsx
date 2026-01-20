import CreateListingForm from "@/components/CreateListingForm";
import { Metadata } from "next";
import { ShoppingBag, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Sell an Item | Studentify",
  description: "List your item on Studentify and reach thousands of students in minutes.",
};

export default function SellPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 text-center">
            Turn Your Items into <span className="text-indigo-600">Earnings</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 text-center">
            Join thousands of sellers on MarketPro. It takes less than 2 minutes to create a professional listing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-white p-4 rounded-2xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700">Secure Payments</span>
            </div>
            <div className="bg-white p-4 rounded-2xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700">Instant Publishing</span>
            </div>
            <div className="bg-white p-4 rounded-2xl flex items-center space-x-3 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-700">Wide Reach</span>
            </div>
          </div>
        </div>

        <CreateListingForm />

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>By publishing, you agree to MarketPro's Terms of Service and Privacy Policy.</p>
          <p className="mt-2 text-center">Need help? <a href="/support" className="text-indigo-600 font-bold hover:underline">Contact our seller support team.</a></p>
        </div>
      </div>
    </div>
  );
}
