"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Tag, 
  DollarSign, 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Upload,
  X,
  Loader2,
  Video,
  BoxSelect
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ImageEditor from "./ImageEditor";
import confetti from "canvas-confetti";

const CATEGORIES = [
  "Electronics", "Fashion", "Home & Garden", "Sports & Outdoors", 
  "Collectibles", "Books & Media", "Automotive", "Other"
];

export default function CreateListingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Electronics",
    price: "",
    description: "",
    status: "active"
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found.");

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
          status: 'active'
        });

      if (insertError) throw insertError;

      // Confetti effect!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#7c3aed', '#ec4899']
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
            className={`flex-1 transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-transparent'}`}
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
              <div className="flex items-center space-x-3 text-indigo-600 mb-8">
                <Package className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Listing Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="What are you selling?"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-slate-900 appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
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
              <div className="flex items-center space-x-3 text-indigo-600 mb-8">
                <Tag className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-slate-900">Detailed Description</h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Item Description</label>
                <textarea
                  name="description"
                  rows={6}
                  placeholder="Describe your item in detail (condition, age, reason for selling, etc.)"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium text-slate-900 resize-none"
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
              <div className="flex items-center space-x-3 text-indigo-600 mb-8">
                <ImageIcon className="w-8 h-8" />
                <h2 className="text-2xl font-bold text-slate-900">Upload Images</h2>
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
                            className="p-2 bg-white text-slate-900 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
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
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Add Media</span>
                    <input type="file" multiple accept="image/*,video/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-sm text-slate-500 italic">You can upload up to 8 photos or videos of your item.</p>

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
              className="px-6 py-4 flex items-center space-x-2 text-slate-600 font-bold hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !formData.title}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || images.length === 0}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
