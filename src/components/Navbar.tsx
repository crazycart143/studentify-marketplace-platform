"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, MessageCircle, Menu, X, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getData();
      } else {
        setProfile(null);
      }
    });

    getData();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className={`text-2xl font-bold tracking-tight ${isScrolled ? "text-slate-900" : "text-white"}`}>
            Studentify
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex space-x-6">
            {['Browse', 'Sell', 'About'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`font-medium transition-colors hover:text-indigo-600 ${
                  isScrolled ? "text-slate-600" : "text-slate-100"
                }`}
              >
                {item}
              </Link>
            ))}
          </nav>
          
          <div className="h-6 w-px bg-slate-200/20" />

          <div className="flex items-center space-x-4">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.form
                  key="search-form"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearch}
                  className="relative flex items-center"
                >
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search market..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                  />
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <button 
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsSearchOpen(true)}
                  className={`p-2 rounded-full transition-colors hover:bg-slate-100/10 ${
                    isScrolled ? "text-slate-600" : "text-white"
                  }`}
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <Link 
              href="/messages"
              className={`p-2 rounded-full transition-colors hover:bg-slate-100/10 ${
                isScrolled ? "text-slate-600" : "text-white"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </Link>
            
            <Link
              href={user ? "/profile" : "/auth"}
              className={`flex items-center space-x-2 p-1.5 pr-4 rounded-full font-black transition-all ${
                isScrolled
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                  : "bg-white text-indigo-600 hover:bg-slate-50 shadow-xl"
              }`}
            >
              {user ? (
                <>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm">Dashboard</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Sign In</span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className={isScrolled ? "text-slate-900" : "text-white"} />
          ) : (
            <Menu className={isScrolled ? "text-slate-900" : "text-white"} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl py-6 px-6 md:hidden flex flex-col space-y-4"
          >
            <form onSubmit={handleSearch} className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search market..."
                className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </form>
            {['Browse', 'Sell', 'About', 'Account'].map((item) => (
              <Link
                key={item}
                href={item === 'Account' ? (user ? '/profile' : '/auth') : `/${item.toLowerCase()}`}
                className="text-lg font-medium text-slate-900 hover:text-indigo-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
