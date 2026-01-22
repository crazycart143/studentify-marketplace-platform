"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MagnifyingGlass, 
  ChatCircleDots, 
  User as UserIcon, 
  List, 
  X,
  SignOut
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

import { BrandLogo } from "@/components/BrandLogo";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.onscroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
  }

  const navLinks = [
    { name: "Browse", href: "/browse" },
    { name: "Sell", href: "/sell" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/98 backdrop-blur-xl py-3 mt-4 mx-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-none"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="z-10">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Navigation - Centered Absolutely */}
        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium hover:text-brand transition-colors ${
                pathname === link.href ? "text-brand" : "text-slate-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-4 z-10">
          <button className="p-2 text-slate-600 hover:text-brand transition-colors">
            <MagnifyingGlass className="w-5 h-5" />
          </button>
          
          {loading ? (
             <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            <>
              <Link href="/messages" className="p-2 text-slate-600 hover:text-brand transition-colors relative">
                <ChatCircleDots className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full border-2 border-white" />
              </Link>
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <Link
                href="/profile"
                className="flex items-center space-x-3 pl-2 group"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-black group-hover:text-brand transition-colors">
                    {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "Student User"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Dashboard</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-brand/20 p-0.5 group-hover:border-brand transition-all">
                  {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                    <img
                      src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>
              </Link>
              <button 
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <SignOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <Link
                href="/auth"
                className="flex items-center space-x-2 bg-brand/10 text-brand px-5 py-2.5 rounded-xl font-semibold hover:bg-brand hover:text-white transition-all shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 bg-white mt-4 p-6 rounded-3xl shadow-2xl border border-slate-100 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-semibold text-slate-600 hover:text-brand px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-2xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-black">{profile?.full_name || user?.user_metadata?.full_name || "Dashboard"}</p>
                      <p className="text-sm text-slate-500 font-medium">View Profile</p>
                    </div>
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-2 text-red-500 font-bold px-4 py-2"
                  >
                    <SignOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-brand text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-brand/20"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
