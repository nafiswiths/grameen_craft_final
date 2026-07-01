export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  image: string;
  descEn: string;
  descBn: string;
}

export interface Artisan {
  id: string;
  nameEn: string;
  nameBn: string;
  districtEn: string;
  districtBn: string;
  experienceYears: number;
  avatar: string;
  bioEn: string;
  bioBn: string;
  rating: number;
  specialtyEn: string;
  specialtyBn: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  price: number; // in BDT (৳) or equivalent USD
  rating: number;
  reviewsCount: number;
  category: string;
  image: string;
  gallery: string[];
  artisanId: string;
  materialsEn: string[];
  materialsBn: string[];
  deliveryDays: number;
  descEn: string;
  descBn: string;
  inStock: boolean;
  featured?: boolean;
  trending?: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  commentEn: string;
  commentBn: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Language = "en" | "bn";
