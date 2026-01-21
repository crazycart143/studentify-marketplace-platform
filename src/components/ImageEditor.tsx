"use client";

import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw, BoxSelect } from 'lucide-react';

interface ImageEditorProps {
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditor({ imageSrc, onConfirm, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 90 },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  const getCroppedImg = async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-[40px] shadow-2xl overflow-hidden max-w-4xl w-full"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BoxSelect className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Crop Image</h2>
          </div>
          <button onClick={onCancel} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto flex items-center justify-center bg-slate-50">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            className="max-w-full"
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              onLoad={onImageLoad} 
              className="max-h-[60vh] object-contain"
              alt="Crop target"
            />
          </ReactCrop>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={getCroppedImg}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2"
          >
            <Check className="w-5 h-5" />
            <span>Save Crop</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
