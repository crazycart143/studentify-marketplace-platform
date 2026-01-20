"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe, Star, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-green-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-8"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">The Student Marketplace</span>
              </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8"
            >
              Your Campus <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-indigo-500">Essential Shop</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              The safest and easiest way for students to buy, sell, and trade. From textbooks to furniture, find everything you need for your university life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
            >
              <Link
                href="/browse"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center group"
              >
                <span>Start Browsing</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/sell"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center"
              >
                List an Item
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
              <form onSubmit={handleSearch} className="relative bg-white border border-slate-200 rounded-[28px] p-2 shadow-2xl flex items-center">
                <Search className="ml-4 text-slate-400 w-6 h-6" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for electronics, fashion, and more..." 
                  className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-medium"
                />
                <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-[20px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  Search
                </button>
              </form>
              
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Popular:</span>
                {['iPhone', 'Vintage', 'Camera', 'Table'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      router.push(`/browse?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Active Listings", value: "10k+", icon: <Globe className="w-5 h-5" /> },
              { label: "Verified Users", value: "25k+", icon: <Shield className="w-5 h-5" /> },
              { label: "Daily Trades", value: "500+", icon: <Zap className="w-5 h-5" /> },
              { label: "Client Satisfaction", value: "4.9/5", icon: <Star className="w-5 h-5" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600 mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Grid */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Fresh Listings</h2>
              <p className="text-slate-500 text-lg font-medium">Explore the latest items added to our community marketplace today.</p>
            </div>
            <Link href="/browse" className="flex items-center space-x-2 px-6 py-3 bg-slate-50 text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-100">
              <span>View Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: '1', title: "Premium Noise Cancelling Headphones", price: 299, category: "Electronics", user: "AudioPro" },
              { id: '2', title: "Vintage Leather Camera Bag", price: 85, category: "Fashion", user: "StyleFinder" },
              { id: '3', title: "Minimalist Oak Work Desk", price: 450, category: "Home", user: "DesignHub" },
              { id: '4', title: "Modernist Ceramic Planter Set", price: 120, category: "Decor", user: "GreenSpace" },
            ].map((item, i) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 text-left"
              >
                <div className="h-64 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-indigo-600 font-black text-[10px] uppercase tracking-wider">
                    NEW
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[1px]">{item.category}</span>
                    <span className="font-black text-slate-900 text-lg">${item.price}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-4 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center text-slate-400 text-xs">
                      <div className="w-6 h-6 bg-slate-100 rounded-full mr-2 flex items-center justify-center">
                        <Star className="w-3 h-3 text-slate-300" />
                      </div>
                      <span>@{item.user}</span>
                    </div>
                    <Link href="/browse" className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
