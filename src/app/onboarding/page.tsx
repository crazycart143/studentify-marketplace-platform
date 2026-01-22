"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Student, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  User as UserIcon,
  CheckCircle,
  RocketLaunch,
  Buildings,
  ChalkboardTeacher,
  UploadSimple,
  FileText,
  X
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { UniversitySearch } from "@/components/UniversitySearch";
import { toast } from "sonner";

const SHS_STRANDS = [
  "STEM (Science, Technology, Engineering, Mathematics)",
  "ABM (Accountancy, Business, and Management)",
  "HUMSS (Humanities and Social Sciences)",
  "GAS (General Academic Strand)",
  "TVL - ICT (Information & Communication Technology)",
  "TVL - Home Economics",
  "TVL - Agri-Fishery",
  "TVL - Industrial Arts",
  "Arts and Design",
  "Sports"
];

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // New State for Student Type and Verification File
  const [studentType, setStudentType] = useState<'college' | 'shs'>('college');
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    university: "",
    major: "",
    year_of_study: "",
    bio: "",
    username: "",
  });

  useEffect(() => {
    if (profile?.has_completed_onboarding) {
       router.push("/profile");
    }
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username || "",
        university: profile.university || "",
        major: profile.major || "",
        year_of_study: profile.year_of_study || "",
        bio: profile.bio || "",
      }));
      if (profile.student_type) setStudentType(profile.student_type as 'college' | 'shs');
    }
  }, [profile, router]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      setVerificationFile(file);
    }
  };

  const handleSubmit = async () => {
    // Permissive check: Username required, but file optional (if skipping)
    if (!formData.username) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Setting up your profile...");

    try {
      let verificationDocPath = null;

      // 1. Upload Verification Document
      if (verificationFile && user) {
        const fileExt = verificationFile.name.split('.').pop();
        const fileName = `verification_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('verifications')
          .upload(filePath, verificationFile);

        if (uploadError) throw uploadError;
        verificationDocPath = filePath;
      }

      // 2. Update Profile
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          student_type: studentType,
          verification_doc_url: verificationDocPath,
          has_completed_onboarding: true,
          role: 'seller', 
          updated_at: new Date().toISOString()
        })
        .eq("id", user?.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success("Profile created successfully!", { id: toastId });
      setStep(5); // Move to Success Step (now Step 5)
    } catch (err: any) {
      console.error("Onboarding error:", err);
      toast.error(err.message || "Failed to create profile", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-6">
      <div className="max-w-xl w-full">
        {/* Progress Bar - Updated to 5 steps? No, keep visual simple, maybe just 3 dots but actually 4 logical steps + success */}
        <div className="flex justify-between mb-12 px-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= s ? "bg-brand w-[22%]" : "bg-slate-200 w-[22%]"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl overflow-hidden">
                <BrandLogo iconOnly size="lg" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-4">Welcome to the inner circle</h1>
              <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                Studentify is a trusted community for students. We verify everyone to keep the platform safe, secure, and exclusive.
              </p>
              
              <button
                onClick={handleNext}
                className="w-full bg-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/10"
              >
                <span>LET'S GET STARTED</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-black mb-2 flex items-center">
                <Student className="w-6 h-6 mr-3 text-brand" />
                Academic Profile
              </h2>
              <p className="text-slate-500 mb-8 font-medium">Tell us where you study.</p>

              {/* Student Type Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                <button
                  onClick={() => setStudentType('college')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${studentType === 'college' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Buildings className="w-4 h-4" />
                  <span>College / Uni</span>
                </button>
                <button
                  onClick={() => setStudentType('shs')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${studentType === 'shs' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <ChalkboardTeacher className="w-4 h-4" />
                  <span>Senior High</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {studentType === 'shs' ? 'SCHOOL NAME' : 'UNIVERSITY / CAMPUS'}
                  </label>
                  <UniversitySearch 
                    value={formData.university}
                    onChange={(val) => setFormData({...formData, university: val})}
                    placeholder={studentType === 'shs' ? "e.g. Ateneo Senior High School" : "e.g. University of the Philippines"}
                    type={studentType}
                  />
                </div>
                
                {studentType === 'shs' ? (
                  // SHS Fields
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">STRAND</label>
                      <select
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black"
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                      >
                        <option value="">Select Strand</option>
                        {SHS_STRANDS.map(strand => (
                          <option key={strand} value={strand}>{strand}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">GRADE LEVEL</label>
                      <select
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black"
                        value={formData.year_of_study}
                        onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                      >
                        <option value="">Select Level</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  // College Fields
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">MAJOR / COURSE</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black"
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">YEAR OF STUDY</label>
                      <select
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black"
                        value={formData.year_of_study}
                        onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year+">5th Year+</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-12">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 text-slate-500 font-semibold hover:text-black transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.university || !formData.major || !formData.year_of_study}
                  className="flex-2 bg-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/10 disabled:opacity-50 disabled:shadow-none"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-black mb-2 flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-brand" />
                Public Profile
              </h2>
              <p className="text-slate-500 mb-8 font-medium">How students will see you.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">UNIQUE USERNAME</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                    <input
                      type="text"
                      className="w-full p-4 pl-9 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">SHORT BIO</label>
                  <textarea
                    rows={4}
                    placeholder={studentType === 'shs' ? "e.g. Grade 12 ABM Student. Selling my old accounting books!" : "Tell us about yourself..."}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-medium text-black"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-12">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 text-slate-500 font-semibold hover:text-black transition-colors"
                >
                  Back
                </button>
                <button
                   onClick={handleNext}
                   disabled={!formData.username}
                   className="flex-2 bg-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/10 disabled:opacity-50 disabled:shadow-none"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div 
               key="step4"
               variants={containerVariants}
               initial="initial"
               animate="animate"
               exit="exit"
               className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100"
             >
               <h2 className="text-2xl font-bold text-black mb-2 flex items-center">
                 <ShieldCheck className="w-6 h-6 mr-3 text-brand" />
                 Verification
               </h2>
               <p className="text-slate-500 mb-8 font-medium">
                 To ensure the safety of our community, please upload proof of enrollment (e.g. School ID, Form 137, or Registration Card).
               </p>
 
               <div className="space-y-6">
                 <div className="p-1 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <label className={`flex flex-col items-center justify-center w-full h-64 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all ${verificationFile ? 'bg-green-50 border-green-200' : ''}`}>
                      {verificationFile ? (
                         <>
                           <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                           <p className="text-sm font-bold text-green-700">{verificationFile.name}</p>
                           <p className="text-xs text-green-600 mt-2">Click to change file</p>
                         </>
                      ) : (
                        <>
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                              <UploadSimple className="w-8 h-8 text-brand" />
                           </div>
                           <p className="text-sm font-bold text-slate-600">Click to upload document</p>
                           <p className="text-xs text-slate-400 mt-2">PDF, JPG, or PNG (Max 5MB)</p>
                        </>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                    </label>
                 </div>
                 
                 <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3">
                   <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-blue-600" /></div>
                   <p className="text-xs text-blue-700 leading-relaxed">
                     <strong>Privacy Context:</strong> This document is encrypted and only visible to our verification team. It will never be shared publicly.
                   </p>
                 </div>
               </div>
 
               <div className="flex items-center space-x-4 mt-12">
                 <button
                   onClick={handleBack}
                   className="flex-1 py-4 text-slate-500 font-semibold hover:text-black transition-colors"
                 >
                   Back
                 </button>
                 <div className="flex-2 flex flex-col space-y-3">
                   <button
                     onClick={handleSubmit}
                     disabled={loading || !verificationFile}
                     className="w-full bg-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/10 disabled:opacity-50 disabled:shadow-none"
                   >
                     {loading ? (
                       <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <>
                         <span>SUBMIT & FINISH</span>
                         <CheckCircle className="w-5 h-5" />
                       </>
                     )}
                   </button>
                   {!verificationFile && (
                     <button
                       onClick={handleSubmit} 
                       disabled={loading}
                       className="w-full py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                     >
                       Skip for now (Restricted Access)
                     </button>
                   )}
                 </div>
               </div>
             </motion.div>
           )}

          {step === 5 && (
            <motion.div 
              key="step5"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <RocketLaunch className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-4">You're all set!</h2>
              <p className="text-slate-600 mb-8 text-lg">
                Your profile is under review. Our team will verify your documents within <strong>1-2 days</strong>. You can browse listings immediately, but selling features will be unlocked once approved.
              </p>

              <button
                onClick={() => router.push("/sell")}
                className="w-full bg-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand/10"
              >
                <span>ENTER THE MARKETPLACE</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-12 text-slate-400 text-xs font-semibold uppercase tracking-widest">
          Secured by Studentify Internal Verification
        </p>
      </div>
    </div>
  );
}
