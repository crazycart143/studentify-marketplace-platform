"use client";

import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Users, 
  ShieldCheck, 
  Zap, 
  GraduationCap, 
  Heart,
  Target,
  Rocket
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { label: "Active Students", value: "50k+", icon: Users },
    { label: "Deals Made", value: "120k", icon: Zap },
    { label: "Universities", value: "45", icon: GraduationCap },
    { label: "Trust Rating", value: "4.9/5", icon: ShieldCheck },
  ];

  const features = [
    {
      title: "Built for Students",
      description: "We understand student life. Everything from textbooks to dorm furniture, priced for student budgets.",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Safe & Verified",
      description: "Only verified student emails can list items. We keep our community safe and focused on your campus.",
      icon: ShieldCheck,
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Sustainable Trading",
      description: "Giving items a second life reduces waste and helps fellow students save money. It's a win-win.",
      icon: Heart,
      color: "bg-rose-50 text-rose-600"
    },
    {
      title: "Instant Connections",
      description: "Chat directly with sellers, meet up on campus, and get what you need without the shipping wait.",
      icon: Zap,
      color: "bg-amber-50 text-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-6 relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand/10 text-brand rounded-full text-xs font-black uppercase tracking-widest mb-6"
          >
            <Target className="w-3 h-3" />
            <span>Our Mission</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-black tracking-tight leading-[1.1] mb-8"
          >
            The Marketplace <br />
            <span className="text-brand">By Students, For Students.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Studentify was born in a dorm room with a simple goal: making it easier for students to buy, sell, and share within their trusted university network.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mb-32">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-8 bg-slate-50 rounded-[32px] text-center border border-slate-100 hover:border-brand/20 transition-all hover:shadow-xl hover:shadow-brand/5 group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-black mb-1">{stat.value}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-black mb-4">Why Studentify?</h2>
            <div className="w-20 h-1.5 bg-brand rounded-full mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start space-x-6 p-8 rounded-[40px] bg-white border border-slate-100 hover:shadow-2xl transition-all group"
              >
                <div className={`shrink-0 w-16 h-16 ${feature.color} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black mb-3">{feature.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-black rounded-[60px] p-12 lg:p-24 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-[100px] z-0" />
          <div className="relative z-10">
            <Rocket className="w-16 h-16 text-brand mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">
              Ready to clear your desk?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/sell"
                className="w-full sm:w-auto px-10 py-5 bg-brand text-white rounded-3xl font-black text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 flex items-center justify-center space-x-3"
              >
                <ShoppingBag className="w-6 h-6" />
                <span>Start Selling</span>
              </Link>
              <Link
                href="/browse"
                className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-3xl font-black text-lg hover:bg-white/20 transition-all flex items-center justify-center"
              >
                Browse Marketplace
              </Link>
            </div>
            <p className="mt-8 text-white/40 font-bold uppercase tracking-widest text-xs">Join the fastest growing student community</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
