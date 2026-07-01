import React from "react";
import { motion } from "motion/react";
import { Heart, Eye, Sparkles, Star, ShoppingCart } from "lucide-react";
import { Product, Language } from "../types";
import { TRANSLATIONS } from "../data";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  language: Language;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onHearStory: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  language,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onHearStory,
  onAddToCart,
}: ProductCardProps) {
  const t = TRANSLATIONS[language];

  // Helper to format currency
  const formatPrice = (price: number) => {
    return language === "en" ? `৳ ${price.toLocaleString()}` : `৳ ${price.toLocaleString("bn-BD")}`;
  };

  const categoryLabels: Record<string, Record<string, string>> = {
    "nakshi-katha": { en: "Nakshi Katha", bn: "নকশী কাঁথা" },
    "jute-creations": { en: "Jute Creations", bn: "পাটজাত শিল্প" },
    "clay-crafts": { en: "Clay Crafts", bn: "মৃৎশিল্প" },
    "bamboo-crafts": { en: "Bamboo Crafts", bn: "বাঁশ ও বেত" },
    "handloom-clothing": { en: "Handloom", bn: "তাঁত শিল্প" },
    "homemade-food": { en: "Homemade Food", bn: "খাবার সামগ্রী" },
  };

  const currentCategoryLabel = categoryLabels[product.category]?.[language] || product.category;

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white border border-[#EAE2D6] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Thumbnail Container */}
      <div className="relative overflow-hidden aspect-4/3 bg-[#F8F5EF] shrink-0">
        <img
          src={product.image}
          alt={language === "en" ? product.nameEn : product.nameBn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-[#2D2A26] text-[#F8F5EF] text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-full z-10 tracking-wide font-mono">
          {currentCategoryLabel}
        </span>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full border border-[#EAE2D6] shadow-xs cursor-pointer backdrop-blur-xs transition-colors duration-200 z-10 ${
            isWishlisted
              ? "bg-[#C97B4A] text-white border-[#C97B4A]"
              : "bg-white/85 text-[#6B635B] hover:text-[#C97B4A] hover:bg-white"
          }`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-[#2D2A26]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          {/* Quick View */}
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={() => onQuickView(product)}
            className="p-2.5 bg-[#F8F5EF] hover:bg-white text-[#2D2A26] rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
            title={t.quickView}
          >
            <Eye size={18} />
          </button>

          {/* Hear Story AI */}
          <button
            id={`story-btn-${product.id}`}
            onClick={() => onHearStory(product)}
            className="p-2.5 bg-[#C97B4A] hover:bg-[#C97B4A]/90 text-[#F8F5EF] rounded-full shadow-md hover:scale-105 transition-all flex items-center gap-1 font-mono font-semibold px-4 cursor-pointer"
            title={t.storyTitle}
          >
            <Sparkles size={16} />
            <span className="text-[11px] uppercase tracking-wider">{t.storyTitle.split(" ")[1]}</span>
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-amber-500">
              <Star size={12} fill="currentColor" />
            </div>
            <span className="text-xs font-mono font-semibold text-[#2D2A26]">
              {product.rating}
            </span>
            <span className="text-[10px] text-[#6B635B] font-mono">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-[#2D2A26] font-bold text-sm md:text-base leading-snug group-hover:text-[#A67C52] transition-colors line-clamp-2">
            {language === "en" ? product.nameEn : product.nameBn}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EAE2D6]/40 flex items-center justify-between">
          {/* Price */}
          <span className="text-base md:text-lg font-mono font-bold text-[#C97B4A]">
            {formatPrice(product.price)}
          </span>

          {/* Add to Cart button */}
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 bg-[#F8F5EF] border border-[#EAE2D6] hover:bg-[#C97B4A] hover:text-white hover:border-[#C97B4A] text-[#2D2A26] px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-300"
          >
            <ShoppingCart size={14} />
            <span>{t.addToCart.split(" ")[0]}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
