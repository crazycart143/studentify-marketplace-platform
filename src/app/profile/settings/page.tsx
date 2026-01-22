"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { User, ShieldCheck as Shield, Bell, Lock, FloppyDisk as Save, Spinner as Loader2 } from "@phosphor-icons/react";
import { toast } from "sonner";
import { UniversitySearch } from "@/components/UniversitySearch";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    role: "buyer",
    university: "",
    major: "",
    year_of_study: "",
    bio: ""
  });

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            username: data.username || "",
            role: data.role || "buyer",
            university: data.university || "",
            major: data.major || "",
            year_of_study: data.year_of_study || "",
            bio: data.bio || ""
          });
        }
      }
      setLoading(false);
    }
    getProfile();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          role: profile.role,
          university: profile.university,
          major: profile.major,
          year_of_study: profile.year_of_study,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 text-left">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-black tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your account preferences and profile details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Tabs Sidebar */}
          <aside className="md:col-span-4 space-y-2">
            {[
              { icon: User, label: "Public Profile", active: true },
              { icon: Lock, label: "Security", active: false },
              { icon: Bell, label: "Notifications", active: false },
              { icon: Shield, label: "Privacy", active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center space-x-3 px-6 py-4 rounded-[20px] font-semibold text-sm transition-all ${
                  item.active 
                    ? "bg-white text-brand shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:bg-slate-100/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </aside>

          {/* Settings Form */}
          <main className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm"
            >
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">Full Name</label>
                    <input 
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand text-black font-semibold"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">@</span>
                      <input 
                        type="text"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand text-black font-semibold"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">Account Type</label>
                    <select
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand text-black font-semibold appearance-none cursor-pointer"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>

                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">University</label>
                      <UniversitySearch 
                        value={profile.university}
                        onChange={(val) => setProfile({ ...profile, university: val })}
                        placeholder="e.g. Stanford University"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">Major / Course</label>
                      <input 
                        type="text"
                        value={profile.major}
                        onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand text-black font-semibold"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">Year of Study</label>
                    <select
                      value={profile.year_of_study}
                      onChange={(e) => setProfile({ ...profile, year_of_study: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand text-black font-semibold appearance-none cursor-pointer"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] ml-1">Professional Bio</label>
                    <textarea 
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-brand text-black font-semibold min-h-[120px] resize-none"
                      placeholder="Tell us about your skills and experience..."
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                   <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-brand transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
