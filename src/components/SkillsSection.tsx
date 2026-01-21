"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Award, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  endorsements_count: number;
}

export default function SkillsSection({ profileId, isOwnProfile }: { profileId: string; isOwnProfile: boolean }) {
  const supabase = createClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, [profileId]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_skills')
        .select(`
          skill_id,
          skills (id, name)
        `)
        .eq('profile_id', profileId);

      if (error) throw error;

      // Extract skills and get endorsement counts
      const skillsWithCounts = await Promise.all((data || []).map(async (item: any) => {
        const { count } = await supabase
          .from('skill_endorsements')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', profileId)
          .eq('skill_id', item.skills.id);
        
        return {
          id: item.skills.id,
          name: item.skills.name,
          endorsements_count: count || 0
        };
      }));

      setSkills(skillsWithCounts);
    } catch (error: any) {
      console.error("Error fetching skills:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setAdding(true);
    try {
      // 1. Check if skill exists in master table or create it
      let skillId;
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('name', newSkill.trim().toLowerCase())
        .single();

      if (existingSkill) {
        skillId = existingSkill.id;
      } else {
        const { data: createdSkill, error: createError } = await supabase
          .from('skills')
          .insert({ name: newSkill.trim().toLowerCase() })
          .select()
          .single();
        if (createError) throw createError;
        skillId = createdSkill.id;
      }

      // 2. Link to profile
      const { error: linkError } = await supabase
        .from('profile_skills')
        .insert({ profile_id: profileId, skill_id: skillId });

      if (linkError) {
        if (linkError.code === '23505') {
          toast.error("You already have this skill listed!");
        } else {
          throw linkError;
        }
      } else {
        toast.success("Skill added!");
        setNewSkill("");
        fetchSkills();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleEndorse = async (skillId: string) => {
    if (isOwnProfile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to endorse skills.");
        return;
      }

      const { error } = await supabase
        .from('skill_endorsements')
        .insert({
          skill_id: skillId,
          endorser_id: user.id,
          recipient_id: profileId
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You've already endorsed this skill!");
        } else {
          throw error;
        }
      } else {
        toast.success("Endorsement added!");
        fetchSkills();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="animate-pulse flex space-x-2"><div className="h-8 w-24 bg-slate-100 rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {skills.map((skill) => (
            <motion.button
              key={skill.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => handleEndorse(skill.id)}
              disabled={isOwnProfile}
              className={`group flex items-center space-x-2 px-4 py-2 rounded-2xl border-2 transition-all ${
                isOwnProfile 
                  ? "bg-slate-50 border-slate-100 cursor-default" 
                  : "bg-white border-slate-100 hover:border-indigo-600 hover:shadow-md"
              }`}
            >
              <span className="font-bold text-slate-700 capitalize">{skill.name}</span>
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                <Award className={`w-3.5 h-3.5 ${skill.endorsements_count > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                <span className="text-xs font-black text-slate-500">{skill.endorsements_count}</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {isOwnProfile && (
          <form onSubmit={handleAddSkill} className="relative flex items-center">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. React)"
              className="pl-4 pr-10 py-2 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-sm font-bold text-indigo-700 placeholder:text-indigo-300 focus:outline-none focus:border-indigo-600 w-48 transition-all"
            />
            <button 
              type="submit"
              disabled={adding || !newSkill.trim()}
              className="absolute right-2 p-1 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </form>
        )}
      </div>
      
      {!isOwnProfile && skills.length > 0 && (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Click a skill to endorse this student</p>
      )}
    </div>
  );
}
