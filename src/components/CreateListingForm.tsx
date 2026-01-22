"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Tag, 
  CurrencyDollar as DollarSign, 
  Image as ImageIcon, 
  CaretRight as ChevronRight, 
  CaretLeft as ChevronLeft, 
  Check,
  UploadSimple as Upload,
  X,
  Spinner as Loader2,
  VideoCamera as Video,
  Crop as BoxSelect,
  Warning as AlertTriangle
} from "@phosphor-icons/react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageEditor from "./ImageEditor";
import confetti from "canvas-confetti";
import SafeZoneSelector from "./SafeZoneSelector";
import PricingAssistant from "./PricingAssistant";

const CATEGORIES = [
  "Electronics", "Fashion", "Home & Garden", "Sports & Outdoors", 
  "Collectibles", "Books & Media", "Automotive", "Other",
  "Tutoring", "Graphic Design", "Technical Support", "Creative Services", "Writing & Proofreading"
];

export default function CreateListingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Electronics",
    price: "",
    description: "",
    status: "active",
    type: "product",
    pricing_model: "fixed",
    delivery_time: "1-3 days",
    revisions_count: 0,
    honor_code_agreed: false,
    safe_zone_id: null as string | null
  });
  const [userUniversity, setUserUniversity] = useState<string>("");
  const [userYear, setUserYear] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUniversity() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('university, year_of_study')
          .eq('id', user.id)
          .single();
        if (data?.university) setUserUniversity(data.university);
        if (data?.year_of_study) setUserYear(data.year_of_study);
      }
    }
    getUniversity();
  }, [user, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 8) {
        toast.error("You can only upload up to 8 items.");
        return;
      }
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Auto-open editor for the first new image if it's an image
      if (newFiles[0].type.startsWith('image/')) {
        setEditingIndex(images.length);
      }
    }
  };

  const handleCropConfirm = (blob: Blob) => {
    if (editingIndex === null) return;

    const croppedFile = new File([blob], images[editingIndex].name, { type: 'image/jpeg' });
    const newImages = [...images];
    newImages[editingIndex] = croppedFile;
    setImages(newImages);

    const newPreviews = [...previews];
    newPreviews[editingIndex] = URL.createObjectURL(blob);
    setPreviews(newPreviews);

    setEditingIndex(null);
    toast.success("Photo optimized!");
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.description || images.length === 0) {
      toast.error("Please fill in all required fields and upload at least one image.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Publishing your listing...");

    try {
      if (!user) {
        toast.error("You must be logged in to create a listing", { id: toastId });
        setLoading(false);
        return;
      }

      // 1. Upload Images
      const imageUrls = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);
        
        imageUrls.push(publicUrl);
      }

      // 2. Create Listing Record
      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          owner_id: user.id,
          title: formData.title,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          images: imageUrls,
          status: 'active',
          type: formData.type,
          pricing_model: formData.type === 'service' ? formData.pricing_model : 'fixed',
          delivery_time: formData.type === 'service' ? formData.delivery_time : null,
          revisions_count: formData.type === 'service' ? parseInt(formData.revisions_count.toString()) : 0,
          honor_code_agreed: formData.honor_code_agreed,
          safe_zone_id: formData.type === 'product' ? formData.safe_zone_id : null
        });

      if (insertError) throw insertError;

      // Confetti effect!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0DAC41', '#000000', '#22c55e']
      });

      toast.success("Listing published successfully!", { id: toastId });
      
      // Delay to let the user see the success
      setTimeout(() => {
        router.push('/profile/listings');
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Error creating listing:", error.message);
      toast.error(error.message || "Failed to create listing. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden text-left">
      {/* Progress Bar */}
      <div className="h-2 bg-slate-50 flex">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`flex-1 transition-all duration-500 ${step >= s ? 'bg-brand' : 'bg-transparent'}`}
          />
        ))}
      </div>

      <div className="p-8 lg:p-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 text-brand mb-8">
                <Package className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-black">Basic Information</h2>
              </div>

              {/* Type Selection */}
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'product' }))}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${formData.type === 'product' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Package className="w-4 h-4" />
                  <span>Physical Product</span>
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, type: 'service' }))}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all ${formData.type === 'service' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Student Service</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                  {formData.type === 'product' ? 'Listing Title' : 'Service Title'}
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder={formData.type === 'product' ? "What are you selling?" : "e.g. Professional Python Tutoring"}
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                    {formData.type === 'product' ? 'Price ($)' : `Service Fee (${formData.pricing_model === 'fixed' ? '$' : '$/hr'})`}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black"
                    />
                  </div>
                </div>
              </div>

              {formData.type === 'service' && (
                <div className="md:col-span-2">
                  <PricingAssistant 
                    category={formData.category}
                    yearOfStudy={userYear}
                    pricingModel={formData.pricing_model as 'fixed' | 'hourly'}
                  />
                </div>
              )}

              {formData.type === 'product' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-8 border-t border-slate-100"
            >
              <SafeZoneSelector 
                university={userUniversity}
                selectedId={formData.safe_zone_id}
                onChangeAction={(id: string | null) => setFormData({ ...formData, safe_zone_id: id })}
              />
            </motion.div>
          )}

          {formData.type === 'service' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 pt-4 border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Pricing Model</label>
                      <select
                        name="pricing_model"
                        value={formData.pricing_model}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black appearance-none"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Est. Delivery Time</label>
                      <input
                        type="text"
                        name="delivery_time"
                        placeholder="e.g. 2 days"
                        value={formData.delivery_time}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Number of Revisions</label>
                    <input
                      type="number"
                      name="revisions_count"
                      value={formData.revisions_count}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black"
                    />
                  </div>

                  {(formData.category === 'Tutoring' || formData.category === 'Writing & Proofreading') && (
                    <div className="md:col-span-2 p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Academic Honor Code</h4>
                          <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
                            By listing this service, you agree to uphold university academic integrity standards. 
                            You will provide educational support and guidance, but will NOT perform homework, 
                            exams, or graded assignments on behalf of other students.
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            required
                            checked={formData.honor_code_agreed}
                            onChange={(e) => setFormData({ ...formData, honor_code_agreed: e.target.checked })}
                            className="peer w-5 h-5 opacity-0 absolute"
                          />
                          <div className="w-5 h-5 border-2 border-amber-200 rounded-lg bg-white peer-checked:bg-amber-600 peer-checked:border-amber-600 transition-all flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-amber-900 group-hover:text-amber-700 transition-colors pt-0.5">
                          I agree to the Studentify Academic Honor Code
                        </span>
                      </label>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 text-brand mb-8">
                <Tag className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-black">Detailed Description</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Item Description</label>
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Describe your item in detail (condition, age, reason for selling, etc.)"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand focus:bg-white transition-all outline-none font-medium text-black resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 text-brand mb-8">
                <ImageIcon className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-black">Upload Images</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, i) => {
                  const isVideo = images[i]?.type.startsWith('video/');
                  return (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                      {isVideo ? (
                        <video src={preview} className="w-full h-full object-cover" />
                      ) : (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        {!isVideo && (
                          <button 
                            onClick={() => setEditingIndex(i)}
                            className="p-2 bg-white text-black rounded-xl hover:bg-brand hover:text-white transition-all shadow-sm"
                            title="Crop Image"
                          >
                            <BoxSelect className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => removeImage(i)}
                          className="p-2 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {isVideo && (
                        <div className="absolute bottom-2 left-2 p-1 bg-black/50 backdrop-blur-md rounded-lg text-white">
                          <Video className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {previews.length < 8 && (
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-slate-50 transition-all text-slate-400 hover:text-brand">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Add Photo/Video</span>
                    <input type="file" multiple accept="image/*,video/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-sm text-slate-500 italic">Showcase your item or describe your service visually (e.g. portfolio screenshots).</p>

              <AnimatePresence>
                {editingIndex !== null && (
                  <ImageEditor 
                    imageSrc={previews[editingIndex]} 
                    onConfirm={handleCropConfirm}
                    onCancel={() => setEditingIndex(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-12 border-t border-slate-100 pt-8">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-4 flex items-center space-x-2 text-slate-600 font-semibold hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !formData.title}
              className="px-8 py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all flex items-center space-x-2 shadow-lg shadow-brand/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || images.length === 0}
              className="px-8 py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all flex items-center space-x-2 shadow-lg shadow-brand/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Publish Listing</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
