import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, AlertCircle, Quote } from "lucide-react";
import { Product, Artisan, Language } from "../types";
import { TRANSLATIONS } from "../data";

interface StoryModalProps {
  product: Product;
  artisan: Artisan;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryModal({ product, artisan, language, isOpen, onClose }: StoryModalProps) {
  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!isOpen) return;

    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/heritage-story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: product.nameEn,
            artisanName: artisan.nameEn,
            artisanDistrict: artisan.districtEn,
            category: product.category,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to load cultural story.");
        }

        const data = await response.json();
        setStory(data.story);
      } catch (err: any) {
        console.error("Story fetching error:", err);
        setError("Could not connect to village database. Using cached local legend.");
        // Fallback story
        setStory(
          language === "en"
            ? `${product.nameEn} was handcrafted by ${artisan.nameEn} in ${artisan.districtEn}. Every stitch and contour is a piece of cultural resilience passed down through centuries, supporting sustainable living.`
            : `${product.nameBn} কারিগর ${artisan.nameBn} দ্বারা ${artisan.districtBn} জেলায় অত্যন্ত মমতায় তৈরি। এই হস্তশিল্পের প্রতিটি বুনন বাংলাদেশের শত বছরের ঐতিহ্য ও সংস্কৃতির স্মারক।`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [isOpen, product, artisan, language]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            id="story-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2D2A26]/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            id="story-modal-card"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-2xl bg-[#F8F5EF] border border-[#EAE2D6] rounded-3xl shadow-xl overflow-hidden z-10"
          >
            {/* Top Close Button */}
            <button
              id="story-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#EAE2D6]/40 transition-all text-[#6B635B] hover:text-[#2D2A26] z-10"
            >
              <X size={20} />
            </button>

            {/* Banner Decor */}
            <div className="h-3 bg-gradient-to-r from-[#A67C52] via-[#C97B4A] to-[#A67C52]" />

            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#A67C52]/10 rounded-xl text-[#A67C52]">
                  <Sparkles size={20} className={loading ? "animate-pulse" : ""} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-[#2D2A26] font-semibold leading-tight">
                    {t.storyModalTitle}
                  </h3>
                  <p className="text-xs font-sans text-[#6B635B] mt-0.5 tracking-wide">
                    {t.tagline}
                  </p>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left side: Artisan Portrait & details */}
                <div className="md:col-span-4 flex flex-col items-center text-center bg-white p-4 rounded-2xl border border-[#EAE2D6]">
                  <img
                    src={artisan.avatar}
                    alt={artisan.nameEn}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#A67C52]/30 mb-3"
                  />
                  <span className="text-xs uppercase tracking-widest text-[#A67C52] font-semibold font-mono">
                    {t.storyBy}
                  </span>
                  <h4 className="font-serif font-bold text-[#2D2A26] mt-1 text-sm md:text-base">
                    {language === "en" ? artisan.nameEn : artisan.nameBn}
                  </h4>
                  <p className="text-xs text-[#6B635B] mt-1">
                    📍 {language === "en" ? artisan.districtEn : artisan.districtBn}
                  </p>
                  <p className="text-[11px] bg-[#F8F5EF] px-2.5 py-1 rounded-full text-[#A67C52] border border-[#EAE2D6] mt-3 font-mono">
                    {artisan.experienceYears}+ {t.years} {t.experience}
                  </p>
                </div>

                {/* Right side: Story Content */}
                <div className="md:col-span-8 flex flex-col justify-center min-h-[220px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      {/* Earthen spinner */}
                      <div className="w-12 h-12 border-4 border-[#A67C52]/30 border-t-[#C97B4A] rounded-full animate-spin mb-4" />
                      <p className="text-sm font-serif italic text-[#A67C52] animate-pulse">
                        {t.storyGenerating}
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative"
                    >
                      {/* Quote icon décor */}
                      <Quote className="absolute -top-6 -left-4 w-10 h-10 text-[#A67C52]/10 pointer-events-none" />
                      
                      <p className="font-serif text-base md:text-lg text-[#2D2A26] leading-relaxed italic pr-2">
                        "{story}"
                      </p>

                      <div className="mt-6 pt-4 border-t border-[#EAE2D6]/60 flex items-center justify-between text-[11px] text-[#6B635B] font-mono">
                        <span>✨ AI Storyteller enabled</span>
                        <span className="text-[#C97B4A] uppercase font-bold tracking-wider">
                          {language === "en" ? product.nameEn.split(" ")[0] : product.nameBn.split(" ")[0]}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Disclaimer footer */}
              <div className="mt-8 flex items-center gap-2 bg-[#A67C52]/5 border border-[#A67C52]/10 p-3 rounded-xl text-[10px] md:text-xs text-[#6B635B] font-mono">
                <AlertCircle size={14} className="text-[#A67C52] shrink-0" />
                <p>{t.storyDisclaimer}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
