"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Briefcase, Package, Search, Filter } from "lucide-react";
import ProjectMilestones from "@/components/ProjectMilestones";

export default function ProjectsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  // Mock data for immediate visual feedback since projects table might be empty
  const mockProjects = [
    {
      id: "1",
      title: "Custom React E-commerce Dashboard",
      freelancer_name: "Alex Dev (Computer Science)",
      total_amount: 450,
      status: "active",
      milestones: [
        { id: "m1", title: "UI Design & Prototyping", amount: 150, status: "paid", due_date: "2026-01-15" },
        { id: "m2", title: "API Integration & Checkout", amount: 200, status: "submitted", due_date: "2026-01-22" },
        { id: "m3", title: "Testing & Deployment", amount: 100, status: "pending", due_date: "2026-01-30" },
      ]
    },
    {
      id: "2",
      title: "Professional Physics Tutoring (5 Sessions)",
      freelancer_name: "Sarah Miller (Physics)",
      total_amount: 250,
      status: "active",
      milestones: [
        { id: "m4", title: "Session 1 & 2 Completed", amount: 100, status: "paid", due_date: "2026-01-18" },
        { id: "m5", title: "Final 3 Sessions", amount: 150, status: "in_progress", due_date: "2026-01-25" },
      ]
    }
  ];

  useEffect(() => {
    // In a real app, we would fetch from the 'projects' table joined with 'milestones'
    // For the demo, we'll use mock data
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6 text-left">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Projects</h1>
            <p className="text-slate-500 font-medium">Track your student freelance collaborations and milestones.</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-64"
                />
             </div>
             <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectMilestones project={project} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Briefcase className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No projects yet</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">When you hire a student or get hired for a service, your projects will appear here.</p>
            <div className="mt-8 flex items-center justify-center space-x-4">
               <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  Browse Services
               </button>
               <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all">
                  How it Works
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
