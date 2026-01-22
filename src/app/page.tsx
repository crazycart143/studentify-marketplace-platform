"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Globe, Star, Search, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Analytics or other initialization
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white selection:bg-brand/10 selection:text-brand">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#000000_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-5" />
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-bold mb-8 border border-brand/20 shadow-sm"
            >
              <Star className="w-4 h-4 fill-brand" />
              <span>OFFICIAL STUDENT SITE</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
            >
              The Next Gen
              <br />
              <span className="text-brand">Student Market</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium"
            >
              Experience the safest, fastest way to trade gear, services, and
              expertise within your university network. Built by students, for the
              future.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link
                href="/browse"
                className="group bg-brand text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center space-x-2 shadow-xl shadow-brand/20 hover:shadow-2xl hover:shadow-brand/30 hover:scale-105 transition-all"
              >
                <span>EXPLORE MARKET</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/sell"
                className="group bg-white text-black border-2 border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-brand hover:text-brand transition-all"
              >
                START SELLING
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto"
            >
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search electronics, fashion, textbooks..."
                  className="w-full pl-16 pr-6 py-5 rounded-2xl border-2 border-slate-200 focus:border-brand focus:outline-none text-lg font-medium shadow-sm focus:shadow-lg transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-dark transition-colors"
                >
                  SEARCH
                </button>
              </div>
            </motion.form>

            {/* Trending Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-8"
            >
              <span className="text-sm text-slate-500 font-semibold">TRENDING NOW:</span>
              {["MacBook", "Vintage", "Tutor", "Chair", "Roommate"].map((tag) => (
                <Link
                  key={tag}
                  href={`/browse?q=${tag.toLowerCase()}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-brand/10 text-slate-700 hover:text-brand rounded-xl text-sm font-semibold border border-slate-200 hover:border-brand/20 transition-all"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Students Choose <span className="text-brand">Studentify</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built specifically for campus life with features that matter to you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Campus Verified",
                description:
                  "Trade only with verified students from your university. Safety first, always.",
                color: "brand",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "List items in seconds. Chat instantly. Meet on campus. No shipping delays.",
                color: "brand",
              },
              {
                icon: Globe,
                title: "Local First",
                description:
                  "Connect with students nearby. Reduce waste. Support your campus community.",
                color: "brand",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-brand/20 hover:shadow-xl transition-all group"
              >
                <div className={`w-16 h-16 bg-${feature.color}/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
