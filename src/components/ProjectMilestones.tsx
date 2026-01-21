"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  CreditCard, 
  AlertCircle,
  ChevronRight
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'paid';
  due_date?: string;
}

interface ProjectProps {
  project: {
    id: string;
    title: string;
    freelancer_name: string;
    total_amount: number;
    status: 'active' | 'completed' | 'cancelled';
    milestones: Milestone[];
  };
}

export default function ProjectMilestones({ project }: ProjectProps) {
  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'paid': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'submitted': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'in_progress': return 'text-amber-500 bg-amber-50 border-amber-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-5 h-5" />;
      case 'submitted': return <Clock className="w-5 h-5" />;
      case 'in_progress': return <Circle className="w-5 h-5 fill-current opacity-20" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden text-left">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{project.title}</h3>
          <p className="text-sm text-slate-500 font-medium">Freelancer: <span className="text-indigo-600 font-bold">{project.freelancer_name}</span></p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">${project.total_amount.toLocaleString()}</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Project Value</span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {project.milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative flex items-start space-x-6">
            {/* Step Line */}
            {index !== project.milestones.length - 1 && (
              <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100" />
            )}

            <div className={`z-10 w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0 ${getStatusColor(milestone.status)}`}>
              {getStatusIcon(milestone.status)}
            </div>

            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-slate-900">{milestone.title}</h4>
                <div className="text-sm font-black text-slate-900">${milestone.amount.toLocaleString()}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusColor(milestone.status)}`}>
                  {milestone.status.replace('_', ' ')}
                </span>
                {milestone.due_date && (
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3 mr-1" />
                    Due {new Date(milestone.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {milestone.status === 'submitted' && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Release Payment</span>
                </motion.button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-slate-50 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Funds are held in escrow until milestone is released.</span>
        </div>
        <button className="flex items-center space-x-2 text-indigo-600 font-bold text-sm hover:translate-x-1 transition-transform">
          <span>View Project Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
