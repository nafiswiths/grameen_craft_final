import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Heart, ShoppingCart, Sparkles, MapPin, Check, Truck, Shield } from "lucide-react";
import { Product, Artisan, Language } from "../types";
import { TRANSLATIONS } from "../data";

interface QuickViewModalProps {
  product: Product;
  artisan: Artisan;
  language: Language;
  isWishlisted: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, qty: number) => void;
  onHearStory: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  artisan,
  language,
  isWishlisted,
  isOpen,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onHearStory,
}: QuickViewModalProps) {
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"details" | "artisan" | "materials">("details");

  const t = TRANSLATIONS[language];

  const formatPrice = (price: number) => {
    return language === "en" ? `৳ ${price.toLocaleString()}` : `৳ ${price.toLocaleString("bn-BD")}`;
  };

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            id="quickview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2D2A26]/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            id="quickview-card"
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl bg-white border border-[#EAE2D6] rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Close Button */}
            <button
              id="quickview-close-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-[#EAE2D6]/40 text-[#6B635B] hover:text-[#2D2A26] rounded-full shadow-xs cursor-pointer transition-colors z-20"
            >
              <X size={18} />
            </button>

            {/* Grid structure */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Image Gallery & Carousel */}
              <div className="md:col-span-6 bg-[#F8F5EF] p-6 flex flex-col justify-between border-r border-[#EAE2D6]">
                <div className="flex-1 flex items-center justify-center min-h-[250px] md:min-h-[350px]">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={activeImage}
                    alt={product.nameEn}
                    referrerPolicy="no-referrer"
                    className="max-h-[300px] md:max-h-[380px] object-contain rounded-2xl shadow-xs"
                  />
                </div>

                {/* Thumbnail Previews */}
                {images.length > 1 && (
                  <div className="flex gap-2.5 mt-4 justify-center">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImage === img ? "border-[#C97B4A] scale-105" : "border-[#EAE2D6] opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.nameEn} thumbnail ${idx}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Information Dashboard */}
              <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  {/* Rating / Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center text-amber-500 gap-0.5">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-mono font-bold text-[#2D2A26] ml-1">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-[#6B635B] text-xs font-mono">|</span>
                    <span className="text-[#C97B4A] text-xs uppercase font-mono tracking-widest font-semibold">
                      {product.category.replace("-", " ")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-[#2D2A26] text-xl md:text-2xl font-bold leading-tight mb-2">
                    {language === "en" ? product.nameEn : product.nameBn}
                  </h2>

                  {/* Price */}
                  <div className="text-xl md:text-2xl font-mono font-bold text-[#C97B4A] mb-4">
                    {formatPrice(product.price)}
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex border-b border-[#EAE2D6] mb-5 font-mono text-xs md:text-sm">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`pb-2.5 px-3 border-b-2 transition-colors duration-200 cursor-pointer ${
                        activeTab === "details"
                          ? "border-[#C97B4A] text-[#2D2A26] font-bold"
                          : "border-transparent text-[#6B635B] hover:text-[#2D2A26]"
                      }`}
                    >
                      {language === "en" ? "Details" : "বিবরণী"}
                    </button>
                    <button
                      onClick={() => setActiveTab("artisan")}
                      className={`pb-2.5 px-3 border-b-2 transition-colors duration-200 cursor-pointer ${
                        activeTab === "artisan"
                          ? "border-[#C97B4A] text-[#2D2A26] font-bold"
                          : "border-transparent text-[#6B635B] hover:text-[#2D2A26]"
                      }`}
                    >
                      {language === "en" ? "About Artisan" : "কারিগর তথ্য"}
                    </button>
                    <button
                      onClick={() => setActiveTab("materials")}
                      className={`pb-2.5 px-3 border-b-2 transition-colors duration-200 cursor-pointer ${
                        activeTab === "materials"
                          ? "border-[#C97B4A] text-[#2D2A26] font-bold"
                          : "border-transparent text-[#6B635B] hover:text-[#2D2A26]"
                      }`}
                    >
                      {t.materials}
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="min-h-[140px] mb-5">
                    {activeTab === "details" && (
                      <p className="text-sm text-[#6B635B] leading-relaxed font-sans">
                        {language === "en" ? product.descEn : product.descBn}
                      </p>
                    )}

                    {activeTab === "artisan" && (
                      <div className="flex items-start gap-4 p-3 bg-[#F8F5EF] rounded-2xl border border-[#EAE2D6]/80">
                        <img
                          src={artisan.avatar}
                          alt={artisan.nameEn}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#A67C52]/30 shrink-0"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-[#2D2A26] text-sm">
                            {language === "en" ? artisan.nameEn : artisan.nameBn}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-[#6B635B] mt-0.5">
                            <MapPin size={12} className="text-[#C97B4A]" />
                            <span>{language === "en" ? artisan.districtEn : artisan.districtBn}</span>
                            <span>•</span>
                            <span>{artisan.experienceYears}+ {t.years} {t.experience}</span>
                          </div>
                          <p className="text-xs text-[#6B635B] mt-2 leading-relaxed">
                            {language === "en" ? artisan.bioEn : artisan.bioBn}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === "materials" && (
                      <ul className="space-y-2">
                        {(language === "en" ? product.materialsEn : product.materialsBn).map((mat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-[#6B635B]">
                            <Check size={14} className="text-[#C97B4A] shrink-0" />
                            <span>{mat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Delivery Info Snippet */}
                  <div className="flex items-center gap-3 text-xs text-[#6B635B] bg-[#F8F5EF]/50 p-3 rounded-xl border border-[#EAE2D6]/60 mb-6">
                    <Truck size={16} className="text-[#C97B4A] shrink-0" />
                    <p>{t.deliveryText.replace("{days}", String(product.deliveryDays))}</p>
                  </div>
                </div>

                {/* Checkout & Quantity Controls */}
                <div className="pt-4 border-t border-[#EAE2D6] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#EAE2D6] rounded-full overflow-hidden bg-[#F8F5EF]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-1.5 text-[#6B635B] hover:text-[#2D2A26] hover:bg-[#EAE2D6]/30 cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 font-mono text-sm font-bold text-[#2D2A26]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3.5 py-1.5 text-[#6B635B] hover:text-[#2D2A26] hover:bg-[#EAE2D6]/30 cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* AI Story Trigger */}
                    <button
                      id="quickview-ai-story"
                      onClick={() => onHearStory(product)}
                      className="flex items-center gap-1.5 bg-[#A67C52]/10 hover:bg-[#A67C52]/20 border border-[#A67C52]/30 text-[#A67C52] px-4 py-2 rounded-full text-xs font-mono font-semibold cursor-pointer transition-all"
                    >
                      <Sparkles size={14} />
                      <span>{t.storyTitle}</span>
                    </button>
                  </div>

                  <div className="flex gap-3">
                    {/* Add to Cart */}
                    <button
                      id="quickview-add-to-cart"
                      onClick={() => {
                        onAddToCart(product, quantity);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-[#F8F5EF] py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={16} />
                      <span>{t.addToCart}</span>
                    </button>

                    {/* Wishlist Toggle */}
                    <button
                      id="quickview-wishlist"
                      onClick={() => onToggleWishlist(product.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isWishlisted
                          ? "bg-[#C97B4A] text-white border-[#C97B4A]"
                          : "bg-[#F8F5EF] text-[#6B635B] border-[#EAE2D6] hover:bg-white hover:text-[#C97B4A]"
                      }`}
                    >
                      <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
