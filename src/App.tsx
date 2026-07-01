import React, { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Heart, ShoppingBag, User, Globe, ArrowRight, Star, 
  MapPin, Award, CheckCircle2, ChevronRight, Sparkles, LogIn,
  Trash2, CreditCard, ShoppingCart, MessageSquare, History, Bookmark, Quote,
  Plus, Check, Package, Mail, Shield, ShieldAlert
} from "lucide-react";

import { Product, Artisan, CartItem, Language } from "./types";
import { CATEGORIES, ARTISANS, PRODUCTS, REVIEWS, TRANSLATIONS } from "./data";
import NakshiBackground from "./components/NakshiBackground";
import ProductCard from "./components/ProductCard";
import QuickViewModal from "./components/QuickViewModal";
import StoryModal from "./components/StoryModal";
import AdminDashboardView from "./components/AdminDashboardView";

export default function App() {
  // 1. Core Reactive States
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("grameen_lang");
    return (saved as Language) || "en";
  });

  const [view, setView] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number>(8000);
  
  // Persistent items via LocalStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("grameen_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("grameen_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("grameen_products");
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("grameen_user");
    return saved ? JSON.parse(saved) : {
      name: "Sajid Ahmed",
      email: "sajid@dhaka.com",
      phone: "+8801712345678",
      address: "House 45, Road 12, Dhanmondi",
      district: "Dhaka",
      role: "buyer"
    };
  });

  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem("grameen_orders");
    return saved ? JSON.parse(saved) : [
      {
        id: "ORD-9281",
        date: "June 12, 2026",
        itemsCount: 1,
        total: 4500,
        status: "Shipped",
        productName: "Traditional Jamalpur Nakshi Katha"
      }
    ];
  });

  // Modal control states
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [storyProduct, setStoryProduct] = useState<Product | null>(null);

  // Authentication states
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPass, setLoginPass] = useState<string>("");
  const [loginRole, setLoginRole] = useState<"buyer" | "seller" | "admin">("buyer");
  const [registerName, setRegisterName] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPhone, setRegisterPhone] = useState<string>("");
  const [registerAddress, setRegisterAddress] = useState<string>("");
  const [registerDistrict, setRegisterDistrict] = useState<string>("Jamalpur");
  const [registerRole, setRegisterRole] = useState<"buyer" | "seller" | "admin">("buyer");
  const [registerPass, setRegisterPass] = useState<string>("");

  // Verification and user records simulation states
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem("grameen_registered_users");
    return saved ? JSON.parse(saved) : [
      {
        name: "Sajid Ahmed",
        email: "sajid@dhaka.com",
        phone: "+8801712345678",
        address: "House 45, Road 12, Dhanmondi",
        district: "Dhaka",
        role: "buyer",
        password: "password123"
      },
      {
        name: "Rahima Begum",
        email: "rahima@jamalpur.org",
        phone: "+8801987654321",
        address: "Katha Palli, Melandaha",
        district: "Jamalpur",
        role: "seller",
        password: "password123"
      },
      {
        name: "GrameenCraft Admin",
        email: "admin@grameencraft.org",
        phone: "+8801700000000",
        address: "GrameenCraft Headquarters, Mirpur",
        district: "Dhaka",
        role: "admin",
        password: "adminpassword"
      }
    ];
  });

  const [allArtisans, setAllArtisans] = useState<Artisan[]>(() => {
    const saved = localStorage.getItem("grameen_artisans");
    return saved ? JSON.parse(saved) : ARTISANS;
  });

  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

  // Seller product listing states
  const [newProdNameEn, setNewProdNameEn] = useState("");
  const [newProdNameBn, setNewProdNameBn] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("nakshi-katha");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdDescEn, setNewProdDescEn] = useState("");
  const [newProdDescBn, setNewProdDescBn] = useState("");

  // Database status state
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; urlConfigured: boolean; error: string | null }>({
    connected: false,
    urlConfigured: false,
    error: null
  });

  // Custom Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  // Checkout shipping state
  const [checkoutName, setCheckoutName] = useState<string>("");
  const [checkoutAddress, setCheckoutAddress] = useState<string>("");
  const [checkoutPhone, setCheckoutPhone] = useState<string>("");
  const [checkoutDistrict, setCheckoutDistrict] = useState<string>("Dhaka");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");

  // bKash Checkout Simulator States
  const [showBkashModal, setShowBkashModal] = useState<boolean>(false);
  const [bkashStep, setBkashStep] = useState<"number" | "otp" | "pin" | "processing" | "success">("number");
  const [bkashNumber, setBkashNumber] = useState<string>("");
  const [bkashOtp, setBkashOtp] = useState<string>("");
  const [bkashInputOtp, setBkashInputOtp] = useState<string>("");
  const [bkashPin, setBkashPin] = useState<string>("");
  const [bkashAgreement, setBkashAgreement] = useState<boolean>(true);
  const [bkashProcessingText, setBkashProcessingText] = useState<string>("");
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any | null>(null);

  // Search suggestion ref
  const searchRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];

  // 2. Synchronize Storage
  useEffect(() => {
    localStorage.setItem("grameen_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("grameen_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("grameen_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("grameen_products", JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem("grameen_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("grameen_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem("grameen_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("grameen_artisans", JSON.stringify(allArtisans));
  }, [allArtisans]);

  // Click outside listener for search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // PostgreSQL Database Syncing & Connection Check
  useEffect(() => {
    // Check connection status
    fetch("/api/db-status")
      .then(res => res.json())
      .then(status => {
        setDbStatus({
          connected: status.connected,
          urlConfigured: status.configured,
          error: status.error
        });
      })
      .catch(err => {
        console.error("Database status check error:", err);
      });

    // Sync state
    fetch("/api/sync")
      .then(res => {
        if (!res.ok) throw new Error("Sync API failed");
        return res.json();
      })
      .then(data => {
        if (data.source === "postgresql") {
          console.log("State synced successfully with Supabase PostgreSQL!");
          if (data.products && data.products.length > 0) {
            setAllProducts(data.products);
          }
          if (data.artisans && data.artisans.length > 0) {
            setAllArtisans(data.artisans);
          }
          if (data.users && data.users.length > 0) {
            setRegisteredUsers(data.users);
          }
          if (data.orders && data.orders.length > 0) {
            setOrders(data.orders);
          }
        }
      })
      .catch(err => {
        console.error("Failed to sync database with grameen village:", err);
      });
  }, []);

  // Pre-fill checkout if user exists
  useEffect(() => {
    if (currentUser) {
      setCheckoutName(currentUser.name || "");
      setCheckoutAddress(currentUser.address || "");
      setCheckoutPhone(currentUser.phone || "");
      setCheckoutDistrict(currentUser.district || "Dhaka");
    }
  }, [currentUser, view]);

  // 3. Handlers
  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const handleToggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      triggerToast(t.wishlistRemoved);
    } else {
      setWishlist([...wishlist, productId]);
      triggerToast(t.wishlistAdded);
    }
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity }]);
    }
    triggerToast(t.addedToCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutAddress || !checkoutPhone) {
      triggerToast(language === "en" ? "Please fill all shipping fields" : "অনুগ্রহ করে সব ঠিকানা পূরণ করুন");
      return;
    }

    const totalCost = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) + 120; // 120 standard organic packaging delivery

    if (paymentMethod === "bkash") {
      const newOrderTemp = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(language === "en" ? "en-US" : "bn-BD", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        itemsCount: cart.length,
        total: totalCost,
        status: "Paid & Processing",
        productName: cart[0]?.product[`name${language === "en" ? "En" : "Bn"}` as const] || "Village Crafts",
        paymentMethod: "bkash",
        bkashNumber: "",
        bkashTxnId: ""
      };
      setPendingOrderDetails(newOrderTemp);
      
      // Auto-populate with cleaned phone number
      const cleanedPhone = checkoutPhone.replace(/\D/g, "");
      setBkashNumber(cleanedPhone.length >= 11 ? cleanedPhone.slice(-11) : "01712345678");
      setBkashStep("number");
      setBkashInputOtp("");
      setBkashPin("");
      setBkashAgreement(true);
      setShowBkashModal(true);
      return;
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(language === "en" ? "en-US" : "bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      itemsCount: cart.length,
      total: totalCost,
      status: paymentMethod === "cod" ? "Pending Approval" : "Paid & Processing",
      productName: cart[0]?.product[`name${language === "en" ? "En" : "Bn"}` as const] || "Village Crafts",
      paymentMethod: paymentMethod
    };

    setOrders([newOrder, ...orders]);

    // Save order to PostgreSQL database
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newOrder,
        userEmail: currentUser?.email || "sajid@dhaka.com"
      })
    }).catch(err => console.error("Error saving order to Postgres:", err));

    setCart([]); // Clear Cart
    setView("order-success");
  };

  // bKash Checkout Event Handlers
  const handleBkashProceedNumber = () => {
    if (!bkashNumber || bkashNumber.length < 11) {
      triggerToast(language === "en" ? "Please enter a valid 11-digit bKash number" : "দয়া করে একটি সঠিক ১১-সংখ্যার বিকাশ নম্বর দিন");
      return;
    }
    setBkashStep("processing");
    setBkashProcessingText(language === "en" ? "Sending verification code..." : "ভেরিফিকেশন কোড পাঠানো হচ্ছে...");
    
    setTimeout(() => {
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setBkashOtp(simulatedOtp);
      setBkashStep("otp");
      triggerToast(language === "en" ? "bKash OTP Code sent!" : "বিকাশ ওটিপি কোড পাঠানো হয়েছে!");
    }, 1200);
  };

  const handleBkashProceedOtp = () => {
    if (bkashInputOtp !== bkashOtp) {
      triggerToast(language === "en" ? "Incorrect verification code" : "ভুল ভেরিফিকেশন কোড");
      return;
    }
    setBkashStep("processing");
    setBkashProcessingText(language === "en" ? "Verifying code..." : "কোড যাচাই করা হচ্ছে...");
    
    setTimeout(() => {
      setBkashStep("pin");
    }, 1000);
  };

  const handleBkashProceedPin = () => {
    if (bkashPin.length < 5) {
      triggerToast(language === "en" ? "Please enter your 5-digit PIN" : "দয়া করে ৫-সংখ্যার পিন নম্বর দিন");
      return;
    }
    setBkashStep("processing");
    setBkashProcessingText(language === "en" ? "Authorizing transaction with bKash..." : "বিকাশ ট্রানজেকশন সম্পন্ন করা হচ্ছে...");
    
    setTimeout(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let txnId = "BK";
      for (let i = 0; i < 8; i++) {
        txnId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const finalOrder = {
        ...pendingOrderDetails,
        bkashNumber: `01${bkashNumber.slice(-9, -3)}****${bkashNumber.slice(-2)}`,
        bkashTxnId: txnId,
        status: "Paid & Processing"
      };
      
      setOrders([finalOrder, ...orders]);
      
      // Save bKash order to PostgreSQL database
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...finalOrder,
          userEmail: currentUser?.email || "sajid@dhaka.com"
        })
      }).catch(err => console.error("Error saving bKash order to Postgres:", err));

      setCart([]); // Clear Cart
      setShowBkashModal(false);
      setView("order-success");
      triggerToast(language === "en" ? "bKash Payment Successful!" : "বিকাশ পেমেন্ট সফল হয়েছে!");
    }, 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      triggerToast(language === "en" ? "Please fill in all credentials" : "অনুগ্রহ করে সম্পূর্ণ তথ্য লিখুন");
      return;
    }
    
    // Find matching user in our registered users list
    const existingUser = registeredUsers.find(
      u => u.email.toLowerCase() === loginEmail.toLowerCase() && u.role === loginRole
    );

    if (!existingUser) {
      triggerToast(
        language === "en"
          ? "No account found with this email & role. Please sign up!"
          : "এই ইমেইল ও রোলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন!"
      );
      return;
    }

    if (existingUser.password !== loginPass) {
      triggerToast(
        language === "en" ? "Incorrect password. Please try again." : "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।"
      );
      return;
    }

    setCurrentUser(existingUser);
    const roleLabelEn = loginRole === "admin" ? "Admin" : loginRole === "seller" ? "Seller" : "Buyer";
    const roleLabelBn = loginRole === "admin" ? "অ্যাডমিন" : loginRole === "seller" ? "বিক্রেতা" : "ক্রেতা";
    triggerToast(
      language === "en"
        ? `Logged in successfully as ${roleLabelEn}!`
        : `সফলভাবে ${roleLabelBn} হিসেবে লগইন হয়েছে!`
    );
    setView("home");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerAddress || !registerPass) {
      triggerToast(language === "en" ? "Please fill all details" : "সব তথ্য পূরণ করুন");
      return;
    }

    const emailExists = registeredUsers.some(
      u => u.email.toLowerCase() === registerEmail.toLowerCase()
    );

    if (emailExists) {
      triggerToast(
        language === "en"
          ? "This email is already registered. Please sign in!"
          : "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত হয়েছে। দয়া করে সাইন ইন করুন!"
      );
      return;
    }

    // Generate simulated 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newUser = {
      name: registerName,
      email: registerEmail,
      phone: registerPhone,
      address: registerAddress,
      district: registerDistrict,
      role: registerRole,
      password: registerPass
    };

    setPendingUser(newUser);
    setVerificationCode(code);
    setInputCode("");
    setShowVerificationModal(true);

    triggerToast(
      language === "en"
        ? `Simulated verification code sent to ${registerEmail}!`
        : `সিমুলেটেড ভেরিফিকেশন কোড পাঠানো হয়েছে আপনার ইমেইলে!`
    );
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === verificationCode) {
      if (pendingUser) {
        const updatedUsers = [...registeredUsers, pendingUser];
        setRegisteredUsers(updatedUsers);
        setCurrentUser(pendingUser);
        
        // Save user to PostgreSQL database
        fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingUser)
        }).catch(err => console.error("Error registering user to Postgres:", err));
        
        if (pendingUser.role === "seller") {
          const artisanId = `artisan-${pendingUser.email.replace(/[^a-zA-Z0-9]/g, "-")}`;
          if (!allArtisans.some(art => art.id === artisanId)) {
            const newArtisan: Artisan = {
              id: artisanId,
              nameEn: pendingUser.name,
              nameBn: pendingUser.name,
              districtEn: pendingUser.district || "Jamalpur",
              districtBn: pendingUser.district || "জামালপুর",
              experienceYears: 1,
              avatar: "https://i.pinimg.com/736x/fb/52/fa/fb52fa410d9d37e31ea136faae8ec358.jpg",
              bioEn: `${pendingUser.name} is a dedicated rural artisan from ${pendingUser.district || "rural Bangladesh"}, reviving precious local handcraft traditions.`,
              bioBn: `${pendingUser.name} একজন নিবেদিত গ্রামীণ হস্তশিল্পী যিনি ঐতিহ্যবাহী কারুশিল্পের পুনরুজ্জীবনে নিয়োজিত রয়েছেন।`,
              rating: 5.0,
              specialtyEn: "Authentic handmade rural crafts",
              specialtyBn: "খাঁটি হাতে তৈরি গ্রামীণ হস্তশিল্প"
            };
            setAllArtisans(prev => [...prev, newArtisan]);
            
            // Save artisan to PostgreSQL database
            fetch("/api/artisans", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newArtisan)
            }).catch(err => console.error("Error saving artisan to Postgres:", err));
          }
        }

        setPendingUser(null);
        setShowVerificationModal(false);
        triggerToast(
          language === "en"
            ? "Email verified! Welcome to GrameenCraft family."
            : "ইমেইল ভেরিফাইড! গ্রামীণক্রাফট পরিবারে স্বাগতম।"
        );
        setView("home");
      }
    } else {
      triggerToast(
        language === "en"
          ? "Incorrect verification code. Please check and try again."
          : "ভুল ভেরিফিকেশন কোড। দয়া করে আবার চেষ্টা করুন।"
      );
    }
  };

  // 4. Utility calculations
  const filteredProducts = allProducts.filter(prod => {
    const matchesCategory = selectedCategory ? prod.category === selectedCategory : true;
    const matchesPrice = prod.price <= priceRange;
    const title = language === "en" ? prod.nameEn.toLowerCase() : prod.nameBn;
    const matchesSearch = searchQuery
      ? title.includes(searchQuery.toLowerCase()) || prod.category.includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesPrice && matchesSearch;
  });

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Search live autocomplete list
  const autocompleteSuggestions = allProducts.filter(prod => {
    const title = language === "en" ? prod.nameEn.toLowerCase() : prod.nameBn;
    return searchQuery && title.includes(searchQuery.toLowerCase());
  }).slice(0, 5);

  const formatPrice = (price: number) => {
    return language === "en" ? `৳ ${price.toLocaleString()}` : `৳ ${price.toLocaleString("bn-BD")}`;
  };

  return (
    <div className="relative min-h-screen font-sans bg-bg-brand text-text-primary selection:bg-accent/20 selection:text-clay-accent overflow-x-hidden">
      {/* 1. Traditional Nakshi Embroidery Background pattern */}
      <NakshiBackground />

      {/* 2. Custom Floating Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border-l-4 border-clay-accent p-4 rounded-xl shadow-xl border border-border-brand max-w-sm"
          >
            <Sparkles className="text-clay-accent animate-pulse" size={18} />
            <p className="text-xs md:text-sm font-medium text-text-primary">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Translucent Glass Navbar */}
      <nav className="sticky top-0 z-40 bg-bg-brand/85 backdrop-blur-md border-b border-border-brand transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand Logo with delicate woven feel */}
            <div 
              onClick={() => { setView("home"); setSelectedCategory(""); }} 
              className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-full border border-accent/40 bg-white flex items-center justify-center text-clay-accent font-serif font-bold text-xl group-hover:bg-clay-accent group-hover:text-white transition-all shadow-xs">
                G
              </div>
              <div>
                <span className="font-serif font-extrabold text-xl md:text-2xl tracking-tight text-text-primary group-hover:text-accent transition-colors">
                  {t.appName}
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-text-secondary font-mono -mt-1 font-semibold">
                  {language === "en" ? "Artisanal Hub" : "হস্তশিল্পালয়"}
                </span>
              </div>
            </div>

            {/* Interactive Search Autocomplete bar */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  className="w-full bg-white text-text-primary pl-10 pr-4 py-2 text-sm rounded-full border border-border-brand focus:border-accent focus:ring-1 focus:ring-accent outline-hidden transition-all shadow-2xs"
                />
                <Search className="absolute left-3.5 top-2.5 text-text-secondary" size={16} />
              </div>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showSearchSuggestions && autocompleteSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-brand rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                  >
                    {autocompleteSuggestions.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setQuickViewProduct(prod);
                          setShowSearchSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-bg-brand rounded-xl cursor-pointer transition-colors"
                      >
                        <img 
                          src={prod.image} 
                          alt={prod.nameEn} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg" 
                        />
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-serif text-xs md:text-sm font-bold text-text-primary truncate">
                            {language === "en" ? prod.nameEn : prod.nameBn}
                          </h4>
                          <span className="text-[10px] text-clay-accent font-mono">
                            {formatPrice(prod.price)}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-text-secondary" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nav Menu Actions */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
              {/* Database Connection Pill */}
              <div 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold transition-all shadow-2xs ${
                  dbStatus.connected 
                    ? "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]" 
                    : dbStatus.urlConfigured
                      ? "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]"
                      : "bg-[#FFF0E0] border-[#FFE0C0] text-[#B06000]"
                }`}
                title={dbStatus.error || (dbStatus.connected ? "Database Connected" : "Local Mode")}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? "bg-green-600" : "bg-red-500 animate-ping"}`} />
                <span>
                  {dbStatus.connected 
                    ? (language === "en" ? "DB CONNECTED" : "ডাটাবেজ সংযুক্ত") 
                    : (language === "en" ? "LOCAL OFFLINE" : "অফলাইন মোড")}
                </span>
              </div>

              {/* English/Bangla language instant switcher */}
              <button
                onClick={() => setLanguage(language === "en" ? "bn" : "en")}
                className="flex items-center gap-1.5 border border-border-brand hover:border-accent bg-white text-xs px-3.5 py-2 rounded-full font-mono text-text-primary hover:text-clay-accent cursor-pointer shadow-2xs transition-all"
                title="Instant translation"
              >
                <Globe size={13} />
                <span className="font-bold">
                  {language === "en" ? "বাংলা" : "English"}
                </span>
              </button>

              {/* Navigation icons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Shop Browse icon */}
                <button
                  onClick={() => { setView("shop"); setSelectedCategory(""); }}
                  className={`p-2.5 rounded-full hover:bg-white border text-[#6B635B] hover:text-[#2D2A26] cursor-pointer transition-colors ${
                    view === "shop" ? "bg-white border-accent text-accent" : "border-transparent"
                  }`}
                  title={t.navShop}
                >
                  <ShoppingBag size={18} />
                </button>

                {/* Wishlist triggers profile with active tab or simple navigation */}
                <button
                  onClick={() => setView("profile")}
                  className="relative p-2.5 rounded-full hover:bg-white border border-transparent text-[#6B635B] hover:text-[#C97B4A] cursor-pointer transition-colors"
                  title={t.wishlistTitle}
                >
                  <Heart size={18} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 bg-clay-accent text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Shopping Cart Drawer Trigger */}
                <button
                  onClick={() => setView("cart")}
                  className={`relative p-2.5 rounded-full hover:bg-white border text-[#6B635B] hover:text-[#2D2A26] cursor-pointer transition-colors ${
                    view === "cart" ? "bg-white border-accent text-accent" : "border-transparent"
                  }`}
                  title={t.navCart}
                >
                  <ShoppingCart size={18} />
                  {cart.length > 0 && (
                    <span className="absolute top-1 right-1 bg-accent text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>

                {/* Profile Avatar / User dashboard */}
                <button
                  onClick={() => setView(currentUser ? "profile" : "login")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-white border text-[#6B635B] hover:text-[#2D2A26] cursor-pointer transition-all ${
                    view === "profile" || view === "login" ? "bg-white border-accent text-accent animate-pulse" : "border-transparent"
                  }`}
                  title={t.navProfile}
                >
                  <User size={18} />
                  {currentUser && (
                    <span className="text-xs font-mono font-bold tracking-tight text-[#2D2A26] border-l border-border-brand/50 pl-2">
                      {language === "en" ? `Hi, ${currentUser.name.split(" ")[0]}` : `${currentUser.name.split(" ")[0]}`}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. Core Router Section mapping views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 min-h-[60vh]">
        <AnimatePresence mode="wait">
          
          {/* A. HOMEPAGE VIEW */}
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-16 md:space-y-24"
            >
              {/* 1. Hero banner Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Side Details */}
                <div className="lg:col-span-7 space-y-6 py-4 md:py-8">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.3em] font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full uppercase">
                      {language === "en" ? "Empowering Rural Bangladesh" : "স্বনির্ভর গ্রামীণ অর্থনীতি"}
                    </span>
                    <div className="hidden sm:block h-[1px] w-12 bg-accent/30"></div>
                  </div>
                  
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-normal text-text-primary leading-[1.05] tracking-tight">
                    {language === "en" ? (
                      <>
                        Discover Authentic<br />
                        <span className="italic text-accent font-serif">Handcrafted Bangladesh</span>
                      </>
                    ) : (
                      <>
                        খুঁজে নিন খাঁটি ও<br />
                        <span className="italic text-accent font-serif">ঐতিহ্যবাহী বাংলাদেশ</span>
                      </>
                    )}
                  </h1>
                  
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl font-sans">
                    {t.heroSub}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <button
                      onClick={() => setView("shop")}
                      className="bg-[#2D2A26] text-[#F8F5EF] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-medium text-xs sm:text-sm uppercase tracking-widest hover:bg-[#C97B4A] transition-colors shadow-xl cursor-pointer"
                    >
                      {t.btnShop}
                    </button>
                    <button
                      onClick={() => setView("artisans")}
                      className="border border-[#2D2A26] text-[#2D2A26] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-medium text-xs sm:text-sm uppercase tracking-widest hover:bg-[#2D2A26] hover:text-[#F8F5EF] transition-all cursor-pointer"
                    >
                      {t.btnMeet}
                    </button>
                  </div>

                  {/* Village Statistics Panel */}
                  <div className="pt-8 border-t border-border-brand/60 flex flex-wrap gap-12">
                    <div>
                      <div className="font-serif text-3xl font-bold text-[#2D2A26]">
                        {language === "en" ? "500+" : "৫০০+"}
                      </div>
                      <div className="text-xs uppercase tracking-tighter text-[#6B635B] font-medium">
                        {language === "en" ? "Master Artisans" : "মাস্টার কারিগরবৃন্দ"}
                      </div>
                    </div>
                    <div>
                      <div className="font-serif text-3xl font-bold text-[#2D2A26]">
                        {language === "en" ? "50+" : "৫০+"}
                      </div>
                      <div className="text-xs uppercase tracking-tighter text-[#6B635B] font-medium">
                        {language === "en" ? "Rural Villages" : "গ্রামীণ গ্রাম"}
                      </div>
                    </div>
                    <div>
                      <div className="font-serif text-3xl font-bold text-[#2D2A26]">
                        {language === "en" ? "2,000+" : "২,০০০+"}
                      </div>
                      <div className="text-xs uppercase tracking-tighter text-[#6B635B] font-medium">
                        {language === "en" ? "Handmade Items" : "হস্তশিল্প সামগ্রী"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Rotating Showcase craft */}
                <div className="lg:col-span-5 flex items-center justify-center relative">
                  {/* Decorative circular katha line borders */}
                  <div className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full animate-spin [animation-duration:40s] pointer-events-none scale-95" />
                  <div className="absolute -top-10 -right-10 w-64 h-64 border-2 border-dashed border-accent/10 rounded-full pointer-events-none" />
                  
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="relative z-10 w-full max-w-sm aspect-[4/5] bg-white rounded-3xl shadow-2xl overflow-hidden group border border-border-brand"
                  >
                    {/* Artistic color tint overlay */}
                    <div className="absolute inset-0 bg-clay-accent/10 opacity-40 mix-blend-multiply pointer-events-none z-10" />
                    
                    {/* Elegant inner embroidery border border frame */}
                    <div className="absolute inset-0 border-[16px] border-[#F8F5EF]/50 m-4 z-20 pointer-events-none rounded-xl" />
                    
                    <div className="w-full h-full relative">
                      <img
                        src="https://i.pinimg.com/736x/cb/1e/11/cb1e117f76b2d98514bc81a54c9ab60d.jpg"
                        alt="Nakshi Katha Hero Showcase"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-border-brand shadow-lg flex items-center justify-between z-30">
                        <div>
                          <span className="block text-[10px] uppercase tracking-widest font-mono font-bold text-clay-accent">
                            {language === "en" ? "Signature Craft" : "বিশেষ সিগনেচার শিল্প"}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#2D2A26] mt-0.5">
                            {language === "en" ? "Jamalpur Nakshi Katha" : "জামালপুর নকশী কাঁথা"}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold bg-[#2D2A26] text-[#F8F5EF] px-3 py-1.5 rounded-full font-mono shadow-xs">
                          {formatPrice(4500)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 2. Featured Categories Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-bold">
                    {t.catTitle}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t.catSub}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CATEGORIES.map(cat => (
                    <motion.div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setView("shop");
                      }}
                      whileHover={{ scale: 1.02 }}
                      className="group relative bg-white border border-border-brand rounded-2xl overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="aspect-16/10 overflow-hidden relative">
                        <img
                          src={cat.image}
                          alt={cat.nameEn}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-text-primary/10 to-transparent" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <h3 className="font-serif font-bold text-lg md:text-xl">
                          {language === "en" ? cat.nameEn : cat.nameBn}
                        </h3>
                        <p className="text-xs text-white/85 mt-1 line-clamp-2 leading-relaxed">
                          {language === "en" ? cat.descEn : cat.descBn}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* 3. Trending Products Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-serif text-3xl text-text-primary font-bold">
                      {t.trendingTitle}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t.trendingSub}
                    </p>
                  </div>
                  <button
                    onClick={() => { setView("shop"); setSelectedCategory(""); }}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-mono font-bold text-clay-accent hover:text-accent cursor-pointer group"
                  >
                    <span>{language === "en" ? "View Full Shop" : "সব পণ্য দেখুন"}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.filter(p => p.trending || p.featured).slice(0, 4).map(prod => {
                    const artisan = allArtisans.find(art => art.id === prod.artisanId) || allArtisans[0];
                    return (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        language={language}
                        isWishlisted={wishlist.includes(prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        onHearStory={(p) => setStoryProduct(p)}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                      />
                    );
                  })}
                </div>
              </motion.div>

              {/* 4. Meet Our Artisans Section Slider */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="bg-[#F8F5EF] border border-border-brand rounded-3xl p-8 md:p-12 relative overflow-hidden"
              >
                <div className="absolute -top-32 -left-32 w-64 h-64 border border-dashed border-accent/20 rounded-full" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 border border-dashed border-clay-accent/20 rounded-full" />

                <div className="relative z-10 max-w-5xl mx-auto space-y-10">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="font-serif text-3xl md:text-4xl text-text-primary font-bold">
                      {t.artisanTitle}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t.artisanSub}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {allArtisans.slice(0, 3).map(art => (
                      <div
                        key={art.id}
                        onClick={() => {
                          // View products by this artisan in shop
                          // Setup category to empty but can trigger a filter later
                          setView("artisans");
                        }}
                        className="bg-white border border-border-brand rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <img
                          src={art.avatar}
                          alt={art.nameEn}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-full object-cover border-2 border-accent/30 mb-4"
                        />
                        <h3 className="font-serif font-bold text-text-primary text-base md:text-lg">
                          {language === "en" ? art.nameEn : art.nameBn}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                          <MapPin size={12} className="text-clay-accent" />
                          <span>{language === "en" ? art.districtEn : art.districtBn}</span>
                        </div>
                        <p className="text-[11px] bg-bg-brand px-3 py-1 rounded-full text-accent border border-border-brand mt-3 font-mono">
                          {art.experienceYears}+ {t.years} {t.experience}
                        </p>
                        <p className="text-xs text-text-secondary mt-3.5 leading-relaxed line-clamp-3">
                          {language === "en" ? art.bioEn : art.bioBn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 5. Customer Stories & Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="font-serif text-3xl text-text-primary font-bold">
                    {t.navStories}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {language === "en" ? "Real global testimonies connecting hearts with handlooms" : "বিশ্বজুড়ে আমাদের হস্তশিল্পের সমাদরকারীদের মন ছুঁয়ে যাওয়া অভিজ্ঞতা সমূহ।"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {REVIEWS.map(rev => (
                    <div
                      key={rev.id}
                      className="bg-white border border-border-brand rounded-2xl p-6 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Stars */}
                        <div className="flex text-amber-500 gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={14} fill={idx < Math.floor(rev.rating) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <p className="font-serif italic text-text-primary text-sm leading-relaxed">
                          "{language === "en" ? rev.commentEn : rev.commentBn}"
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border-brand/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">
                          {rev.userName}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary">
                          {rev.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 6. Why Choose GrameenCraft Bento Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="font-serif text-3xl text-text-primary font-bold">
                    {t.whyTitle}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-border-brand rounded-2xl p-6 md:p-8 flex flex-col items-start gap-4 shadow-2xs">
                    <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-text-primary text-base md:text-lg">
                        {t.why1Title}
                      </h3>
                      <p className="text-xs md:text-sm text-text-secondary mt-2 leading-relaxed font-sans">
                        {t.why1Desc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-border-brand rounded-2xl p-6 md:p-8 flex flex-col items-start gap-4 shadow-2xs">
                    <div className="p-3 bg-clay-accent/10 text-clay-accent rounded-xl shrink-0">
                      <History size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-text-primary text-base md:text-lg">
                        {t.why2Title}
                      </h3>
                      <p className="text-xs md:text-sm text-text-secondary mt-2 leading-relaxed font-sans">
                        {t.why2Desc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-border-brand rounded-2xl p-6 md:p-8 flex flex-col items-start gap-4 shadow-2xs">
                    <div className="p-3 bg-[#2D2A26]/10 text-text-primary rounded-xl shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-text-primary text-base md:text-lg">
                        {t.why3Title}
                      </h3>
                      <p className="text-xs md:text-sm text-text-secondary mt-2 leading-relaxed font-sans">
                        {t.why3Desc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* B. SHOP / PRODUCT BROWSE VIEW */}
          {view === "shop" && (
            <motion.div
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-brand pb-6">
                <div>
                  <h1 className="font-serif text-3xl font-extrabold text-[#2D2A26]">
                    {t.navShop}
                  </h1>
                  <p className="text-xs md:text-sm text-[#6B635B] mt-1">
                    {language === "en" ? `Showing ${filteredProducts.length} unique village creations` : `গ্রামীণ কারিগরদের তৈরি ${filteredProducts.length}টি চমৎকার হস্তশিল্প`}
                  </p>
                </div>

                {/* Filters header bar */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category Filter Pills */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white border border-border-brand px-3 py-2 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden cursor-pointer"
                  >
                    <option value="">{language === "en" ? "All Categories" : "সব ক্যাটাগরি"}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {language === "en" ? cat.nameEn : cat.nameBn}
                      </option>
                    ))}
                  </select>

                  {/* Price filter input slider */}
                  <div className="flex items-center gap-2 bg-white border border-border-brand px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] md:text-xs font-mono text-[#6B635B]">
                      {language === "en" ? "Max Price:" : "সর্বোচ্চ মূল্য:"}
                    </span>
                    <input
                      type="range"
                      min="500"
                      max="8000"
                      step="500"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-20 md:w-28 accent-[#C97B4A] cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-[#C97B4A]">
                      {formatPrice(priceRange)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Products catalog Grid */}
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="p-4 bg-accent/10 rounded-full text-accent">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#2D2A26]">
                    {language === "en" ? "No crafts found in this village" : "এই গ্রামীণ ক্যাটাগরিতে পণ্য পাওয়া যায়নি"}
                  </h3>
                  <button
                    onClick={() => { setSelectedCategory(""); setPriceRange(8000); setSearchQuery(""); }}
                    className="text-xs bg-clay-accent text-white px-4 py-2 rounded-lg font-mono"
                  >
                    {language === "en" ? "Reset filters" : "রিসেট ফিল্টার"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      language={language}
                      isWishlisted={wishlist.includes(prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onQuickView={(p) => setQuickViewProduct(p)}
                      onHearStory={(p) => setStoryProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* C. ARTISANS DATABASE VIEW */}
          {view === "artisans" && (
            <motion.div
              key="artisans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              <div className="text-center max-w-2xl mx-auto space-y-2 border-b border-border-brand pb-8">
                <h1 className="font-serif text-3xl md:text-4xl text-text-primary font-black">
                  {t.artisanTitle}
                </h1>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                  {t.artisanSub}
                </p>
              </div>

              <div className="space-y-8">
                {allArtisans.map((art, idx) => {
                  const artisanProducts = allProducts.filter(p => p.artisanId === art.id);
                  return (
                    <div
                      key={art.id}
                      className="bg-white border border-border-brand rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                    >
                      {/* Left: Artisan Portrait */}
                      <div className="lg:col-span-4 flex flex-col items-center text-center lg:border-r lg:border-border-brand lg:pr-8">
                        <img
                          src={art.avatar}
                          alt={art.nameEn}
                          referrerPolicy="no-referrer"
                          className="w-28 h-28 rounded-full object-cover border-4 border-accent/20 mb-4"
                        />
                        <h2 className="font-serif font-bold text-text-primary text-xl md:text-2xl">
                          {language === "en" ? art.nameEn : art.nameBn}
                        </h2>
                        
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1.5">
                          <MapPin size={12} className="text-clay-accent" />
                          <span>{language === "en" ? art.districtEn : art.districtBn}</span>
                          <span>•</span>
                          <span className="font-mono bg-bg-brand px-2.5 py-0.5 rounded-full border border-border-brand">
                            {art.experienceYears}+ {t.years}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border-brand/40 w-full flex items-center justify-center gap-2">
                          <Award size={14} className="text-accent" />
                          <span className="text-xs font-mono font-bold text-accent">
                            {t.specialty}: {language === "en" ? art.specialtyEn : art.specialtyBn}
                          </span>
                        </div>
                      </div>

                      {/* Right: Bio & Crafted works */}
                      <div className="lg:col-span-8 space-y-6">
                        <div className="space-y-2">
                          <h4 className="font-serif font-bold text-sm text-text-secondary uppercase tracking-widest">
                            {language === "en" ? "My Heritage Story" : "আমার ঐতিহ্যের কথা"}
                          </h4>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {language === "en" ? art.bioEn : art.bioBn}
                          </p>
                        </div>

                        {/* Showcase artisan products */}
                        <div className="space-y-3">
                          <h5 className="font-serif font-bold text-xs text-text-primary uppercase tracking-wide">
                            {language === "en" ? `Woven by ${art.nameEn.split(" ")[0]}` : `${art.nameBn.split(" ")[0]}-এর তৈরি হস্তশিল্প`}
                          </h5>
                          
                          <div className="flex flex-wrap gap-4">
                            {artisanProducts.map(prod => (
                              <div
                                key={prod.id}
                                onClick={() => setQuickViewProduct(prod)}
                                className="flex items-center gap-3 bg-bg-brand border border-border-brand rounded-2xl p-2.5 cursor-pointer hover:border-accent transition-all shrink-0 max-w-xs"
                              >
                                <img
                                  src={prod.image}
                                  alt={prod.nameEn}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 object-cover rounded-xl"
                                />
                                <div>
                                  <h6 className="font-serif font-bold text-xs text-text-primary truncate max-w-[140px]">
                                    {language === "en" ? prod.nameEn : prod.nameBn}
                                  </h6>
                                  <span className="text-[10px] font-mono font-semibold text-clay-accent">
                                    {formatPrice(prod.price)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* D. CUSTOMER STORIES EDITORIAL */}
          {view === "stories" && (
            <motion.div
              key="stories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-2 border-b border-border-brand pb-8">
                <h1 className="font-serif text-3xl md:text-4xl text-text-primary font-black">
                  {t.navStories}
                </h1>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                  {language === "en" ? "Connecting global homes to rural Bangladeshi artisans. Read the journey of warmth, culture and sustainable fashion." : "বিশ্বজুড়ে আমাদের হস্তশিল্পের গ্রাহকদের মমতাময়ী বার্তা ও ঘর সাজানোর নান্দনিক অভিজ্ঞতা সমূহ।"}
                </p>
              </div>

              {/* Guestbook layout */}
              <div className="space-y-6">
                {REVIEWS.map((rev, idx) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-border-brand rounded-3xl p-6 md:p-8 shadow-xs relative"
                  >
                    <Quote className="absolute top-6 right-6 text-accent/10 w-16 h-16 pointer-events-none" />
                    
                    <div className="flex items-center gap-1.5 text-amber-500 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill={i < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>

                    <p className="font-serif text-base md:text-lg text-[#2D2A26] italic leading-relaxed mb-6">
                      "{language === "en" ? rev.commentEn : rev.commentBn}"
                    </p>

                    <div className="flex items-center justify-between border-t border-border-brand/40 pt-4 text-xs md:text-sm text-[#6B635B] font-mono">
                      <div>
                        <span className="block font-bold text-[#2D2A26]">
                          {rev.userName}
                        </span>
                        <span className="text-[10px] text-[#6B635B]">
                          Dhaka Customer
                        </span>
                      </div>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* E. SHOPPING CART VIEW */}
          {view === "cart" && (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <h1 className="font-serif text-3xl font-extrabold text-[#2D2A26] border-b border-border-brand pb-4">
                {t.cartTitle}
              </h1>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="p-4 bg-accent/5 border border-dashed border-accent/20 rounded-full text-accent">
                    <ShoppingBag size={42} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#2D2A26]">
                    {t.cartEmpty}
                  </h3>
                  <button
                    onClick={() => setView("shop")}
                    className="bg-clay-accent text-white px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {t.btnShop}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Cart Item lists */}
                  <div className="lg:col-span-8 space-y-4">
                    {cart.map(item => (
                      <div
                        key={item.product.id}
                        className="bg-white border border-border-brand p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img
                            src={item.product.image}
                            alt={item.product.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <h3 className="font-serif font-bold text-text-primary text-sm md:text-base leading-tight">
                              {language === "en" ? item.product.nameEn : item.product.nameBn}
                            </h3>
                            <span className="text-xs text-clay-accent font-mono block mt-1">
                              {formatPrice(item.product.price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border-brand/40">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-border-brand rounded-full overflow-hidden bg-bg-brand">
                            <button
                              onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-border-brand/30 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 font-mono text-xs font-bold text-text-primary">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-border-brand/30 font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Subtotal */}
                          <span className="font-mono text-sm font-bold text-[#2D2A26] min-w-[80px] text-right">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>

                          {/* Delete from cart */}
                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="p-2 text-text-secondary hover:text-clay-accent rounded-full hover:bg-[#C97B4A]/5 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary card */}
                  <div className="lg:col-span-4 bg-white border border-border-brand rounded-2xl p-6 space-y-6">
                    <h3 className="font-serif font-bold text-[#2D2A26] text-lg border-b border-border-brand pb-3">
                      {t.cartSummary}
                    </h3>

                    <div className="space-y-3 font-mono text-xs md:text-sm">
                      <div className="flex justify-between text-text-secondary">
                        <span>{t.subtotal}</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>{t.shipping}</span>
                        <span>{formatPrice(120)}</span> {/* 120 Delivery fee */}
                      </div>
                      <div className="border-t border-border-brand/50 pt-3 flex justify-between font-bold text-[#2D2A26] text-sm md:text-base">
                        <span>{t.total}</span>
                        <span>{formatPrice(cartTotal + 120)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setView("checkout")}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#C97B4A] hover:bg-[#C97B4A]/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>{t.checkout}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* F. SECURE CHECKOUT FORM VIEW */}
          {view === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <h1 className="font-serif text-3xl font-extrabold text-[#2D2A26] border-b border-border-brand pb-4 text-center">
                {t.checkoutTitle}
              </h1>

              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Billing details inputs */}
                <div className="lg:col-span-7 bg-white border border-border-brand rounded-3xl p-6 md:p-8 space-y-6">
                  <h3 className="font-serif font-bold text-text-primary text-base md:text-lg border-b border-border-brand/40 pb-3">
                    {t.shippingAddress}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder="e.g. Sajid Ahmed"
                        className="w-full bg-bg-brand border border-border-brand px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.address}
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        placeholder="House / Village details, Sub-district"
                        className="w-full bg-bg-brand border border-border-brand px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                          {t.phone}
                        </label>
                        <input
                          type="tel"
                          required
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder="e.g. +88017XXXXXXXX"
                          className="w-full bg-bg-brand border border-border-brand px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                          {t.districtLabel}
                        </label>
                        <select
                          value={checkoutDistrict}
                          onChange={(e) => setCheckoutDistrict(e.target.value)}
                          className="w-full bg-bg-brand border border-border-brand px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                        >
                          <option value="Dhaka">Dhaka</option>
                          <option value="Chittagong">Chittagong</option>
                          <option value="Sylhet">Sylhet</option>
                          <option value="Jamalpur">Jamalpur</option>
                          <option value="Mymensingh">Mymensingh</option>
                          <option value="Rajshahi">Rajshahi</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-text-primary text-base md:text-lg border-b border-border-brand/40 pt-4 pb-3">
                    {t.paymentMethod}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                    <label className={`flex items-center gap-2 p-3.5 border rounded-2xl cursor-pointer ${
                      paymentMethod === "cod" ? "border-clay-accent bg-[#C97B4A]/5 text-clay-accent" : "border-border-brand bg-white hover:border-accent"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#C97B4A]"
                      />
                      <span className="text-xs font-semibold">{t.cod}</span>
                    </label>

                    <label className={`flex items-center gap-2 p-3.5 border rounded-2xl cursor-pointer ${
                      paymentMethod === "bkash" ? "border-clay-accent bg-[#C97B4A]/5 text-clay-accent" : "border-border-brand bg-white hover:border-accent"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="bkash"
                        checked={paymentMethod === "bkash"}
                        onChange={() => setPaymentMethod("bkash")}
                        className="accent-[#C97B4A]"
                      />
                      <span className="text-xs font-semibold">{t.bKash}</span>
                    </label>

                    <label className={`flex items-center gap-2 p-3.5 border rounded-2xl cursor-pointer ${
                      paymentMethod === "card" ? "border-clay-accent bg-[#C97B4A]/5 text-clay-accent" : "border-border-brand bg-white hover:border-accent"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-[#C97B4A]"
                      />
                      <span className="text-xs font-semibold">{t.card}</span>
                    </label>
                  </div>
                </div>

                {/* Summaries sidebar column */}
                <div className="lg:col-span-5 bg-white border border-border-brand rounded-3xl p-6 md:p-8 space-y-6">
                  <h3 className="font-serif font-bold text-[#2D2A26] text-lg border-b border-border-brand pb-3">
                    {t.cartSummary}
                  </h3>

                  <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-text-secondary truncate max-w-[180px]">
                          {language === "en" ? item.product.nameEn : item.product.nameBn} <b className="text-[#2D2A26]">x{item.quantity}</b>
                        </span>
                        <span className="font-bold text-text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border-brand/40 pt-4 space-y-2.5 font-mono text-xs md:text-sm">
                    <div className="flex justify-between text-[#6B635B]">
                      <span>{t.subtotal}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#6B635B]">
                      <span>{t.shipping}</span>
                      <span>{formatPrice(120)}</span>
                    </div>
                    <div className="border-t border-border-brand pt-3 flex justify-between font-bold text-clay-accent text-sm md:text-base">
                      <span>{t.total}</span>
                      <span>{formatPrice(cartTotal + 120)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-[#F8F5EF] py-3.5 rounded-xl text-xs md:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>{t.confirmOrder.replace("{total}", (cartTotal + 120).toLocaleString())}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* G. ORDER SUCCESS COMPLETED VIEW */}
          {view === "order-success" && (
            <motion.div
              key="order-success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl mx-auto bg-white border border-border-brand p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-xl"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C97B4A]/10 text-[#C97B4A] rounded-full border border-[#C97B4A]/30">
                <CheckCircle2 size={32} className="animate-bounce" />
              </div>

              <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2D2A26]">
                {t.orderSuccess}
              </h1>

              <p className="text-xs md:text-sm text-[#6B635B] leading-relaxed font-sans">
                {t.orderSuccessSub}
              </p>

              <div className="pt-6 border-t border-border-brand/60">
                <button
                  onClick={() => setView("home")}
                  className="bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-[#F8F5EF] px-6 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  {t.backToHome}
                </button>
              </div>
            </motion.div>
          )}

          {/* H. PROFILE DASHBOARD VIEW */}
          {view === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <h1 className="font-serif text-3xl font-extrabold text-text-primary border-b border-border-brand pb-4">
                {t.profileTitle}
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Profile card update */}
                <div className="lg:col-span-4 bg-white border border-border-brand rounded-2xl p-6 space-y-5">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#A67C52]/15 border border-[#A67C52]/30 rounded-full flex items-center justify-center text-text-primary font-bold font-serif text-xl mb-3">
                      {currentUser?.name ? currentUser.name.charAt(0) : "S"}
                    </div>
                    <h3 className="font-serif font-bold text-text-primary text-base">
                      {currentUser?.name || "Village Friend"}
                    </h3>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {currentUser?.email || "guest@grameencraft.org"}
                    </span>
                    <span className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-clay-accent">
                      {currentUser?.role === "seller"
                        ? (language === "en" ? "Seller / Artisan" : "বিক্রেতা / কারিগর")
                        : (language === "en" ? "Appreciative Buyer" : "সম্মানিত ক্রেতা")
                      }
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <span className="block text-text-secondary uppercase text-[9px] font-semibold">{t.phone}</span>
                      <span className="block text-text-primary mt-0.5">{currentUser?.phone || "No phone added"}</span>
                    </div>
                    <div>
                      <span className="block text-text-secondary uppercase text-[9px] font-semibold">{t.address}</span>
                      <span className="block text-text-primary mt-0.5">{currentUser?.address || "No address added"}</span>
                    </div>
                    <div>
                      <span className="block text-text-secondary uppercase text-[9px] font-semibold">{t.districtLabel}</span>
                      <span className="block text-text-primary mt-0.5">{currentUser?.district || "Dhaka"}</span>
                    </div>
                  </div>

                  {currentUser ? (
                    <button
                      onClick={() => {
                        setCurrentUser(null);
                        triggerToast(language === "en" ? "Logged out!" : "লগআউট হয়েছে!");
                        setView("home");
                      }}
                      className="w-full py-2 bg-bg-brand border border-border-brand hover:bg-[#C97B4A]/5 hover:text-clay-accent rounded-xl text-xs font-mono font-bold text-[#6B635B]"
                    >
                      {language === "en" ? "Log Out" : "লগ আউট"}
                    </button>
                  ) : null}
                </div>

                {/* Curated list / Order history lists */}
                <div className="lg:col-span-8 space-y-6">
                  {currentUser?.role === "admin" ? (
                    // === ADMIN DASHBOARD VIEW ===
                    <AdminDashboardView
                      registeredUsers={registeredUsers}
                      setRegisteredUsers={setRegisteredUsers}
                      allProducts={allProducts}
                      setAllProducts={setAllProducts}
                      orders={orders}
                      setOrders={setOrders}
                      dbStatus={dbStatus}
                      language={language}
                      triggerToast={triggerToast}
                      formatPrice={formatPrice}
                    />
                  ) : currentUser?.role === "seller" ? (
                    // === SELLER DASHBOARD VIEW ===
                    <div className="space-y-6">
                      {/* Stats cards grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4">
                          <div className="p-3 bg-accent/10 text-clay-accent rounded-xl">
                            <Package size={20} />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-mono text-text-secondary">
                              {language === "en" ? "Active Inventory" : "সক্রিয় পণ্য"}
                            </span>
                            <span className="text-lg font-serif font-black text-text-primary">
                              {allProducts.length} {language === "en" ? "Crafts" : "টি সামগ্রী"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4">
                          <div className="p-3 bg-accent/10 text-clay-accent rounded-xl">
                            <ShoppingCart size={20} />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-mono text-text-secondary">
                              {language === "en" ? "Incoming Orders" : "অর্ডার প্রাপ্তি"}
                            </span>
                            <span className="text-lg font-serif font-black text-text-primary">
                              {orders.length} {language === "en" ? "Requests" : "টি অনুরোধ"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4">
                          <div className="p-3 bg-accent/10 text-clay-accent rounded-xl">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-mono text-text-secondary">
                              {language === "en" ? "Artisan Revenue" : "উপার্জিত আয়"}
                            </span>
                            <span className="text-lg font-serif font-black text-[#2D2A26]">
                              {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Main Seller Actions Layout: List Craft & Manage Shop */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* List a New Craft Form */}
                        <div className="xl:col-span-5 bg-white border border-border-brand rounded-2xl p-6 space-y-4">
                          <h3 className="font-serif font-bold text-text-primary text-base pb-2 border-b border-border-brand/40 flex items-center gap-2">
                            <Plus size={16} className="text-clay-accent" />
                            <span>{language === "en" ? "List New Village Craft" : "নতুন হস্তশিল্প যুক্ত করুন"}</span>
                          </h3>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!newProdNameEn || !newProdNameBn || !newProdPrice) {
                              triggerToast(language === "en" ? "Please fill name and price" : "অনুগ্রহ করে নাম ও মূল্য লিখুন");
                              return;
                            }
                            const presetImgs: Record<string, string> = {
                              "nakshi-katha": "https://i.pinimg.com/736x/cb/1e/11/cb1e117f76b2d98514bc81a54c9ab60d.jpg",
                              "jute-creations": "https://i.pinimg.com/736x/b9/88/97/b98897d192bc18d62bb20a4b4c25188a.jpg",
                              "clay-crafts": "https://i.pinimg.com/1200x/58/b1/4e/58b14ef19aed6d2c91a61e8862a53004.jpg",
                              "bamboo-crafts": "https://i.pinimg.com/1200x/1a/bf/87/1abf87fefb0eac936fb497200048df21.jpg",
                              "handloom-clothing": "https://i.pinimg.com/1200x/3c/44/fb/3c44fb2e019d415cb2c1238ce807c86d.jpg",
                              "homemade-food": "https://i.pinimg.com/1200x/f9/7f/b8/f97fb84232eb42f58bfeff332eef560f.jpg"
                            };
                            const imgUrl = newProdImage || presetImgs[newProdCategory] || presetImgs["nakshi-katha"];
                            const currentArtisanId = currentUser && currentUser.role === "seller"
                              ? `artisan-${currentUser.email.replace(/[^a-zA-Z0-9]/g, "-")}`
                              : "artisan-rahima";
                            const newProd: Product = {
                              id: "prod-" + Date.now(),
                              nameEn: newProdNameEn,
                              nameBn: newProdNameBn,
                              price: Number(newProdPrice),
                              rating: 5.0,
                              reviewsCount: 1,
                              category: newProdCategory,
                              image: imgUrl,
                              gallery: [imgUrl],
                              artisanId: currentArtisanId,
                              materialsEn: ["Traditional Bangladeshi Handcrafted materials"],
                              materialsBn: ["ঐতিহ্যবাহী গ্রামীণ হস্তশিল্প উপকরণ"],
                              descEn: newProdDescEn || "Handmade with authentic Bangladeshi heritage.",
                              descBn: newProdDescBn || "বাংলাদেশের খাঁটি ঐতিহ্যবাহী উপাদান দিয়ে ভালোবাসা ও যত্নে তৈরি হস্তশিল্প।",
                              deliveryDays: 5,
                              inStock: true
                            };
                            setAllProducts([newProd, ...allProducts]);
                            fetch("/api/products", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(newProd)
                            }).catch(err => console.error("Error saving product to Postgres:", err));
                            triggerToast(language === "en" ? "New Craft Listed successfully!" : "নতুন হস্তশিল্প সফলভাবে যুক্ত হয়েছে!");
                            // Reset fields
                            setNewProdNameEn("");
                            setNewProdNameBn("");
                            setNewProdPrice("");
                            setNewProdImage("");
                            setNewProdDescEn("");
                            setNewProdDescBn("");
                          }} className="space-y-3 font-mono text-xs text-text-primary">
                            <div>
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                {language === "en" ? "Product Name (English)" : "পণ্যের নাম (ইংরেজি)"}
                              </label>
                              <input
                                type="text"
                                required
                                value={newProdNameEn}
                                onChange={(e) => setNewProdNameEn(e.target.value)}
                                placeholder="e.g. Handmade Bamboo Basket"
                                className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                {language === "en" ? "Product Name (Bengali)" : "পণ্যের নাম (বাংলা)"}
                              </label>
                              <input
                                type="text"
                                required
                                value={newProdNameBn}
                                onChange={(e) => setNewProdNameBn(e.target.value)}
                                placeholder="উদা: হাতে তৈরি বাঁশের ঝুড়ি"
                                className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                  {language === "en" ? "Category" : "ক্যাটাগরি"}
                                </label>
                                <select
                                  value={newProdCategory}
                                  onChange={(e) => setNewProdCategory(e.target.value)}
                                  className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent"
                                >
                                  <option value="nakshi-katha">{language === "en" ? "Nakshi Katha" : "নকশী কাঁথা"}</option>
                                  <option value="jute-creations">{language === "en" ? "Jute Creations" : "পাটজাত শিল্প"}</option>
                                  <option value="clay-crafts">{language === "en" ? "Clay Crafts" : "মৃৎশিল্প"}</option>
                                  <option value="bamboo-crafts">{language === "en" ? "Bamboo Crafts" : "বাঁশ ও বেত শিল্প"}</option>
                                  <option value="handloom-clothing">{language === "en" ? "Handloom Clothing" : "তাঁত ও বুনন শিল্প"}</option>
                                  <option value="homemade-food">{language === "en" ? "Homemade Food" : "ঘরে তৈরি খাবার"}</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                  {language === "en" ? "Price (BDT ৳)" : "মূল্য (টাকা ৳)"}
                                </label>
                                <input
                                  type="number"
                                  required
                                  value={newProdPrice}
                                  onChange={(e) => setNewProdPrice(e.target.value)}
                                  placeholder="1200"
                                  className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                {language === "en" ? "Preset Image" : "প্রিসেট ছবি"}
                              </label>
                              <select
                                value={newProdImage}
                                onChange={(e) => setNewProdImage(e.target.value)}
                                className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent"
                              >
                                <option value="">{language === "en" ? "-- Choose Craft Preset Image --" : "-- ক্রাফট প্রিসেট ছবি নির্বাচন করুন --"}</option>
                                <option value="https://i.pinimg.com/736x/cb/1e/11/cb1e117f76b2d98514bc81a54c9ab60d.jpg">{language === "en" ? "Traditional Nakshi Katha Pattern" : "ঐতিহ্যবাহী নকশী কাঁথা প্যাটার্ন"}</option>
                                <option value="https://i.pinimg.com/736x/b9/88/97/b98897d192bc18d62bb20a4b4c25188a.jpg">{language === "en" ? "Hand-braided Jute Craft Bag" : "হাতে বোনা পাট ক্রাফট ব্যাগ"}</option>
                                <option value="https://i.pinimg.com/1200x/1a/bf/87/1abf87fefb0eac936fb497200048df21.jpg">{language === "en" ? "Traditional Bamboo Basket" : "ঐতিহ্যবাহী বাঁশ ও বেত শিল্প"}</option>
                                <option value="https://i.pinimg.com/1200x/58/b1/4e/58b14ef19aed6d2c91a61e8862a53004.jpg">{language === "en" ? "Clay Pottery Pitcher" : "মাটির পাত্র ও মৃৎশিল্প"}</option>
                                <option value="https://i.pinimg.com/1200x/3c/44/fb/3c44fb2e019d415cb2c1238ce807c86d.jpg">{language === "en" ? "Traditional Bengali Jamdani" : "বাঙালি ঐতিহ্যবাহী তাঁত শাড়ি"}</option>
                                <option value="https://i.pinimg.com/1200x/f9/7f/b8/f97fb84232eb42f58bfeff332eef560f.jpg">{language === "en" ? "Village Pure Honey Bottle" : "খাঁটি সুন্দরবনের মধু"}</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                {language === "en" ? "Or Enter Custom Image URL (Optional)" : "অথবা কাস্টম ছবির লিংক দিন (ঐচ্ছিক)"}
                              </label>
                              <input
                                type="text"
                                value={newProdImage}
                                onChange={(e) => setNewProdImage(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
                                {language === "en" ? "Craft Story (English)" : "পণ্যের পেছনের গল্প (ইংরেজি)"}
                              </label>
                              <textarea
                                value={newProdDescEn}
                                onChange={(e) => setNewProdDescEn(e.target.value)}
                                placeholder="Who crafted this? What is the historic village story?"
                                rows={2}
                                className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-accent resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} />
                              <span>{language === "en" ? "List Craft Product" : "পণ্যের লিস্টিং সম্পন্ন করুন"}</span>
                            </button>
                          </form>
                        </div>

                        {/* Inventory & Incoming Orders List */}
                        <div className="xl:col-span-7 space-y-4">
                          {/* Manage Inventory */}
                          <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-4">
                            <h3 className="font-serif font-bold text-text-primary text-base pb-2 border-b border-border-brand/40 flex items-center gap-2">
                              <Package size={16} className="text-clay-accent" />
                              <span>{language === "en" ? "Village Craft Inventory" : "গ্রামের ক্রাফট ইনভেন্টরি"}</span>
                            </h3>

                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                              {allProducts.map((prod) => (
                                <div
                                  key={prod.id}
                                  className="bg-bg-brand border border-border-brand/60 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                                >
                                  <div className="flex items-center gap-3">
                                    <img src={prod.image} alt={prod.nameEn} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                      <h4 className="font-serif font-bold text-text-primary text-xs truncate max-w-[150px] sm:max-w-[200px]">
                                        {language === "en" ? prod.nameEn : prod.nameBn}
                                      </h4>
                                      <span className="block text-[10px] text-text-secondary mt-0.5">
                                        {prod.category} • {formatPrice(prod.price)}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setAllProducts(allProducts.filter(p => p.id !== prod.id));
                                      triggerToast(language === "en" ? "Product de-listed successfully!" : "পণ্যটি সফলভাবে ডিলিট করা হয়েছে!");
                                    }}
                                    className="p-1.5 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50"
                                    title={language === "en" ? "De-list product" : "পণ্যটি সরান"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Buyer Orders Received */}
                          <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-4">
                            <h3 className="font-serif font-bold text-text-primary text-base pb-2 border-b border-border-brand/40 flex items-center gap-2">
                              <History size={16} className="text-clay-accent" />
                              <span>{language === "en" ? "Buyer Orders Received" : "ক্রেতাদের থেকে প্রাপ্ত অর্ডারের বিবরণ"}</span>
                            </h3>

                            {orders.length === 0 ? (
                              <p className="text-xs text-text-secondary font-mono">{language === "en" ? "No orders received yet." : "এখনো কোনো অর্ডার পাওয়া যায়নি।"}</p>
                            ) : (
                              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                {orders.map((ord, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-bg-brand border border-border-brand/60 p-4 rounded-xl space-y-3 text-xs font-mono"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <span className="block font-bold text-text-primary">{ord.productName}</span>
                                        <span className="block text-[10px] text-text-secondary mt-0.5">ID: {ord.id} • {ord.date}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="block font-bold text-clay-accent">{formatPrice(ord.total)}</span>
                                        <span className="inline-block text-[9px] px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full font-semibold mt-1">
                                          {ord.status}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons to update order status */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE2D6]/45">
                                      <span className="text-[10px] text-text-secondary self-center mr-1">
                                        {language === "en" ? "Update Status:" : "স্ট্যাটাস পরিবর্তন করুন:"}
                                      </span>
                                      <button
                                        onClick={() => {
                                          const updated = [...orders];
                                          updated[idx].status = "Shipped";
                                          setOrders(updated);
                                          triggerToast(language === "en" ? "Order marked as Shipped!" : "অর্ডারটি পাঠানো হয়েছে!");
                                        }}
                                        disabled={ord.status === "Shipped" || ord.status === "Delivered"}
                                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          ord.status === "Shipped" || ord.status === "Delivered"
                                            ? "bg-[#EAE2D6]/40 text-[#6B635B]/50 cursor-not-allowed"
                                            : "bg-accent/10 text-accent border border-accent/25 hover:bg-accent/15 cursor-pointer"
                                        }`}
                                      >
                                        {language === "en" ? "Shipped" : "পাঠানো হয়েছে"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updated = [...orders];
                                          updated[idx].status = "Delivered";
                                          setOrders(updated);
                                          triggerToast(language === "en" ? "Order marked as Delivered!" : "অর্ডারটি ডেলিভার করা হয়েছে!");
                                        }}
                                        disabled={ord.status === "Delivered"}
                                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          ord.status === "Delivered"
                                            ? "bg-[#EAE2D6]/40 text-[#6B635B]/50 cursor-not-allowed"
                                            : "bg-[#2D2A26] text-white hover:bg-[#2D2A26]/90 cursor-pointer"
                                        }`}
                                      >
                                        {language === "en" ? "Delivered" : "ডেলিভার করা হয়েছে"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // === BUYER DASHBOARD VIEW ===
                    <div className="space-y-6">
                      {/* Order history */}
                      <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-4">
                        <h3 className="font-serif font-bold text-text-primary text-base md:text-lg border-b border-border-brand/40 pb-3 flex items-center gap-2">
                          <History size={16} />
                          <span>{t.ordersTitle}</span>
                        </h3>

                        {orders.length === 0 ? (
                          <p className="text-xs text-text-secondary font-mono">{t.noOrders}</p>
                        ) : (
                          <div className="space-y-3">
                            {orders.map((ord, idx) => (
                              <div
                                key={idx}
                                className="bg-bg-brand border border-border-brand/60 p-4 rounded-xl space-y-3 text-xs font-mono"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="block font-bold text-text-primary">{ord.productName}</span>
                                    <span className="block text-[10px] text-text-secondary mt-0.5">ID: {ord.id} • {ord.date}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block font-bold text-clay-accent">{formatPrice(ord.total)}</span>
                                    <span className="inline-block text-[9px] px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full font-semibold mt-1">
                                      {ord.status}
                                    </span>
                                  </div>
                                </div>

                                {ord.paymentMethod === "bkash" && (
                                  <div className="bg-[#FFE6EE] border border-[#FFCCD9] text-[#E2125E] rounded-xl p-2.5 text-[10px] flex items-center justify-between font-sans">
                                    <span className="font-bold flex items-center gap-1">
                                      <span className="w-2 h-2 bg-[#E2125E] rounded-full inline-block"></span>
                                      {language === "en" ? `Paid via bKash (${ord.bkashNumber})` : `বিকাশ-এ পরিশোধিত (${ord.bkashNumber})`}
                                    </span>
                                    <span className="font-mono font-bold text-[9px] bg-white border border-[#FFCCD9] px-2 py-0.5 rounded">
                                      TXN: {ord.bkashTxnId}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Curated Wishlist */}
                      <div className="bg-white border border-border-brand rounded-2xl p-6 space-y-4">
                        <h3 className="font-serif font-bold text-text-primary text-base md:text-lg border-b border-border-brand/40 pb-3 flex items-center gap-2">
                          <Bookmark size={16} />
                          <span>{t.wishlistTitle}</span>
                        </h3>

                        {wishlist.length === 0 ? (
                          <p className="text-xs text-text-secondary font-mono">
                            {language === "en" ? "Your wishlist is empty. Add crafts you appreciate!" : "উইশলিস্ট খালি। আপনার পছন্দের পণ্য যোগ করুন!"}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allProducts.filter(p => wishlist.includes(p.id)).map(prod => (
                              <div
                                key={prod.id}
                                onClick={() => setQuickViewProduct(prod)}
                                className="bg-bg-brand border border-border-brand/60 p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-accent transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <img src={prod.image} alt={prod.nameEn} className="w-12 h-12 rounded-lg object-cover" />
                                  <div>
                                    <h4 className="font-serif text-xs font-bold text-text-primary truncate max-w-[120px]">
                                      {language === "en" ? prod.nameEn : prod.nameBn}
                                    </h4>
                                    <span className="text-[10px] text-clay-accent font-mono">
                                      {formatPrice(prod.price)}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWishlist(prod.id);
                                  }}
                                  className="text-text-secondary hover:text-clay-accent p-1.5"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* I. LOGIN VIEW */}
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto bg-white border border-border-brand rounded-3xl overflow-hidden shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left product wallpaper */}
                <div className="hidden md:block md:col-span-6 relative bg-bg-brand">
                  <img
                    src="https://i.pinimg.com/1200x/f9/97/34/f9973451d1256a7449fcb00fc850737e.jpg"
                    alt="Login Banner Craft"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover aspect-square"
                  />
                  <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-xs flex flex-col justify-end p-8 text-white">
                    <h3 className="font-serif text-2xl font-bold">GrameenCraft Heritage</h3>
                    <p className="text-xs font-mono tracking-widest uppercase text-white/85 mt-1">{t.tagline}</p>
                  </div>
                </div>

                {/* Right Form column */}
                <div className="md:col-span-6 p-8 md:p-12 space-y-6">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h2 className="font-serif text-2xl font-black text-[#2D2A26]">
                      {t.loginTitle}
                    </h2>
                    <p className="text-xs text-[#6B635B]">
                      {t.loginSub}
                    </p>

                    {/* Admin Access Info Tip */}
                    <div className="bg-[#FFF0E0] border border-[#FFE0C0] p-3 rounded-xl text-[11px] text-[#B06000] font-mono space-y-1 mt-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Shield size={13} className="text-amber-600" />
                        <span>ADMIN ACCESS DEMO TIP:</span>
                      </div>
                      <p className="leading-relaxed">
                        Select <strong className="font-sans font-bold">Admin</strong> role and sign in using <strong className="bg-[#FFF8F0] px-1 py-0.5 rounded border border-[#FFE0C0]/60">admin@grameencraft.org</strong> / <strong className="bg-[#FFF8F0] px-1 py-0.5 rounded border border-[#FFE0C0]/60">adminpassword</strong> to view database schemas, promote roles, toggle stock and ship orders!
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Role Selector */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {language === "en" ? "Sign In As" : "হিসেবে সাইন ইন করুন"}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-[#F8F5EF] p-1 rounded-xl border border-[#EAE2D6]">
                        <button
                          type="button"
                          onClick={() => setLoginRole("buyer")}
                          className={`py-2 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            loginRole === "buyer"
                              ? "bg-[#2D2A26] text-white shadow-xs"
                              : "text-[#6B635B] hover:text-[#2D2A26]"
                          }`}
                        >
                          <ShoppingBag size={13} />
                          <span>{language === "en" ? "Buyer" : "ক্রেতা"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoginRole("seller")}
                          className={`py-2 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            loginRole === "seller"
                              ? "bg-[#2D2A26] text-white shadow-xs"
                              : "text-[#6B635B] hover:text-[#2D2A26]"
                          }`}
                        >
                          <User size={13} />
                          <span>{language === "en" ? "Seller" : "বিক্রেতা"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoginRole("admin")}
                          className={`py-2 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            loginRole === "admin"
                              ? "bg-[#2D2A26] text-white shadow-xs"
                              : "text-[#6B635B] hover:text-[#2D2A26]"
                          }`}
                        >
                          <ShieldAlert size={13} />
                          <span>{language === "en" ? "Admin" : "অ্যাডমিন"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="sajid@dhaka.com"
                        className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.password}
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <label className="flex items-center gap-1.5 text-[#6B635B] cursor-pointer">
                        <input type="checkbox" className="accent-[#C97B4A]" />
                        <span>{t.rememberMe}</span>
                      </label>
                      <span className="text-clay-accent hover:underline cursor-pointer">{t.forgotPass}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-white font-semibold py-3 rounded-xl text-xs md:text-sm cursor-pointer transition-colors"
                    >
                      <LogIn size={16} />
                      <span>{language === "en" ? "Sign In" : "সাইন ইন করুন"}</span>
                    </button>
                  </form>

                  <div className="text-center text-xs text-[#6B635B] pt-4 border-t border-[#EAE2D6]/40">
                    <span>{t.noAccount} </span>
                    <button
                      onClick={() => setView("register")}
                      className="text-clay-accent font-mono font-bold hover:underline"
                    >
                      {t.registerNow}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* J. REGISTER VIEW */}
          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto bg-white border border-border-brand rounded-3xl overflow-hidden shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left form details */}
                <div className="md:col-span-6 p-8 md:p-12 space-y-6">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h2 className="font-serif text-2xl font-black text-[#2D2A26]">
                      {t.registerTitle}
                    </h2>
                    <p className="text-xs text-[#6B635B]">
                      {t.registerSub}
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role Selector */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {language === "en" ? "Register As" : "হিসেবে রেজিস্ট্রেশন করুন"}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-[#F8F5EF] p-1 rounded-xl border border-[#EAE2D6]">
                        <button
                          type="button"
                          onClick={() => setRegisterRole("buyer")}
                          className={`py-2 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            registerRole === "buyer"
                              ? "bg-[#2D2A26] text-white shadow-xs"
                              : "text-[#6B635B] hover:text-[#2D2A26]"
                          }`}
                        >
                          <ShoppingBag size={13} />
                          <span>{language === "en" ? "Buyer" : "ক্রেতা"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterRole("seller")}
                          className={`py-2 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            registerRole === "seller"
                              ? "bg-[#2D2A26] text-white shadow-xs"
                              : "text-[#6B635B] hover:text-[#2D2A26]"
                          }`}
                        >
                          <User size={13} />
                          <span>{language === "en" ? "Seller" : "বিক্রেতা"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterRole("admin")}
                          className={`py-2 px-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            registerRole === "admin"
                              ? "bg-[#2D2A26] text-white shadow-xs"
                              : "text-[#6B635B] hover:text-[#2D2A26]"
                          }`}
                        >
                          <ShieldAlert size={13} />
                          <span>{language === "en" ? "Admin" : "অ্যাডমিন"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="e.g. Sajid Ahmed"
                        className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="sajid@dhaka.com"
                        className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                          {t.phone}
                        </label>
                        <input
                          type="tel"
                          required
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          placeholder="+88017XXXXXXXX"
                          className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                          {t.districtLabel}
                        </label>
                        <select
                          value={registerDistrict}
                          onChange={(e) => setRegisterDistrict(e.target.value)}
                          className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                        >
                          <option value="Dhaka">Dhaka</option>
                          <option value="Chittagong">Chittagong</option>
                          <option value="Sylhet">Sylhet</option>
                          <option value="Jamalpur">Jamalpur</option>
                          <option value="Mymensingh">Mymensingh</option>
                          <option value="Rajshahi">Rajshahi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.address}
                      </label>
                      <input
                        type="text"
                        required
                        value={registerAddress}
                        onChange={(e) => setRegisterAddress(e.target.value)}
                        placeholder="Village, Sub-district details"
                        className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                        {t.password}
                      </label>
                      <input
                        type="password"
                        required
                        value={registerPass}
                        onChange={(e) => setRegisterPass(e.target.value)}
                        placeholder="•••••••• (Choose secure password)"
                        className="w-full bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-2.5 rounded-xl text-xs md:text-sm text-text-primary focus:border-accent outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#2D2A26] hover:bg-[#2D2A26]/90 text-white font-semibold py-3 rounded-xl text-xs md:text-sm cursor-pointer transition-colors"
                    >
                      <CheckCircle2 size={16} />
                      <span>{language === "en" ? "Register Account" : "অ্যাকাউন্ট তৈরি করুন"}</span>
                    </button>
                  </form>

                  <div className="text-center text-xs text-[#6B635B] pt-4 border-t border-[#EAE2D6]/40">
                    <span>{t.alreadyHaveAccount} </span>
                    <button
                      onClick={() => setView("login")}
                      className="text-clay-accent font-mono font-bold hover:underline"
                    >
                      {language === "en" ? "Sign In" : "সাইন ইন"}
                    </button>
                  </div>
                </div>

                {/* Right wallpaper */}
                <div className="hidden md:block md:col-span-6 relative bg-bg-brand">
                  <img
                    src="https://i.pinimg.com/1200x/3c/44/fb/3c44fb2e019d415cb2c1238ce807c86d.jpg"
                    alt="Register Banner Handloom"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover aspect-square"
                  />
                  <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-xs flex flex-col justify-end p-8 text-white">
                    <h3 className="font-serif text-2xl font-bold">GrameenCraft Community</h3>
                    <p className="text-xs font-mono tracking-widest uppercase text-white/85 mt-1">{t.tagline}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 5. Premium Artistic Narrative Footer */}
      <footer className="bg-white border-t border-border-brand mt-20 relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            
            {/* Column 1: The Maker */}
            <div className="col-span-1">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-4">
                {language === "en" ? "The Maker Heritage" : "কারিগর ঐতিহ্য"}
              </h4>
              <div className="flex gap-3">
                <img 
                  src="https://i.pinimg.com/736x/fb/52/fa/fb52fa410d9d37e31ea136faae8ec358.jpg"
                  alt="Rahima Begum - Crafts Artisan" 
                  className="w-12 h-12 rounded-full object-cover border border-border-brand flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {language === "en" ? "Rahima Begum" : "রাহিমা বেগম"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {language === "en" ? "Jamalpur, Bangladesh" : "জামালপুর, বাংলাদেশ"}
                  </p>
                  <p className="text-[10px] italic text-clay-accent mt-1">
                    {language === "en" ? "Master Nakshi Katha (24 yrs)" : "মাস্টার নকশী কাঁথা (২৪ বছর)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Process */}
            <div className="col-span-1 md:border-l border-border-brand md:pl-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-4">
                {language === "en" ? "Process & Lineage" : "বুনন প্রক্রিয়া ও ধারা"}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {language === "en" 
                  ? "Each thread is hand-spun and stitched using traditional patterns passed down through generations." 
                  : "প্রতিটি সুতা এবং নকশী ফোঁড় প্রজন্ম থেকে প্রজন্মে হস্তান্তরিত চিরায়ত পদ্ধতিতে তৈরি করা হয়েছে।"}
              </p>
              <button 
                onClick={() => setView("artisans")}
                className="text-[10px] uppercase tracking-widest font-bold mt-2 text-text-primary hover:text-accent underline cursor-pointer block"
              >
                {language === "en" ? "View Journeys" : "কারিগরদের যাত্রা"}
              </button>
            </div>

            {/* Column 3: Materials */}
            <div className="col-span-1 md:border-l border-border-brand md:pl-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-4">
                {language === "en" ? "Pure Materials" : "খাঁটি উপাদান"}
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#F8F5EF] text-[10px] px-2 py-1 border border-border-brand rounded-sm font-mono text-text-primary">
                  {language === "en" ? "Organic Cotton" : "অর্গানিক সুতা"}
                </span>
                <span className="bg-[#F8F5EF] text-[10px] px-2 py-1 border border-border-brand rounded-sm font-mono text-text-primary">
                  {language === "en" ? "Golden Jute" : "সোনালী পাট"}
                </span>
                <span className="bg-[#F8F5EF] text-[10px] px-2 py-1 border border-border-brand rounded-sm font-mono text-text-primary">
                  {language === "en" ? "Natural Clay" : "নদীর কাদামাটি"}
                </span>
              </div>
              <p className="text-[10px] text-text-secondary mt-3">
                {language === "en" ? "100% Sustainable & Plastic-free" : "১০০% পরিবেশবান্ধব ও প্লাস্টিক-মুক্ত"}
              </p>
            </div>

            {/* Column 4: Impact */}
            <div className="col-span-1 md:border-l border-border-brand md:pl-8">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-4">
                {language === "en" ? "Ethical Impact" : "নৈতিক প্রভাব"}
              </h4>
              <div className="bg-[#F8F5EF] p-3.5 rounded-xl border border-border-brand">
                <div className="text-xs font-bold text-text-primary">
                  {language === "en" ? "Ethically Sourced" : "ন্যায্যমূল্য নিশ্চিতকরণ"}
                </div>
                <div className="text-[10px] text-text-secondary mt-1">
                  {language === "en" 
                    ? "Your purchase directly supports rural family health clinics and education initiatives." 
                    : "আপনার প্রতিটি ক্রয় গ্রামীণ পরিবারগুলোর স্বাস্থ্য এবং শিক্ষার উন্নয়নে সহায়তা করে।"}
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-border-brand pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="font-mono text-[10px] md:text-xs text-text-secondary">
              {t.madeWith}
            </div>
            <div className="flex gap-4 text-xs font-mono text-text-secondary">
              <span onClick={() => setView("home")} className="hover:text-accent cursor-pointer">{t.navHome}</span>
              <span onClick={() => setView("shop")} className="hover:text-accent cursor-pointer">{t.navShop}</span>
              <span onClick={() => setView("stories")} className="hover:text-accent cursor-pointer">{t.navStories}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 6. Detail View Popups mapping */}
      {quickViewProduct && (
        <QuickViewModal
          isOpen={!!quickViewProduct}
          product={quickViewProduct}
          artisan={allArtisans.find(art => art.id === quickViewProduct.artisanId) || allArtisans[0]}
          language={language}
          isWishlisted={wishlist.includes(quickViewProduct.id)}
          onClose={() => setQuickViewProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onHearStory={(p) => {
            setQuickViewProduct(null);
            setStoryProduct(p);
          }}
        />
      )}

      {storyProduct && (
        <StoryModal
          isOpen={!!storyProduct}
          product={storyProduct}
          artisan={allArtisans.find(art => art.id === storyProduct.artisanId) || allArtisans[0]}
          language={language}
          onClose={() => setStoryProduct(null)}
        />
      )}

      {/* 7. Email Verification Modal Overlay */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white border-2 border-accent rounded-3xl shadow-2xl overflow-hidden relative"
          >
            {/* Traditional ornamental background corner stitch */}
            <div className="absolute top-0 left-0 w-24 h-24 border-r border-b border-dashed border-accent/20 pointer-events-none rounded-br-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-l border-t border-dashed border-accent/20 pointer-events-none rounded-tl-3xl" />

            <div className="p-8 text-center space-y-6 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F8F5EF] text-accent border border-accent/20 rounded-full shadow-inner">
                <Mail size={32} className="animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-black text-[#2D2A26]">
                  {language === "en" ? "Verify Your Email" : "ইমেইল ভেরিফাই করুন"}
                </h3>
                <p className="text-xs text-[#6B635B] leading-relaxed">
                  {language === "en" 
                    ? `We sent a 4-digit verification code to the email address: ` 
                    : `আমরা একটি ৪-সংখ্যার ভেরিফিকেশন কোড পাঠিয়েছি আপনার ইমেইলে: `}
                  <span className="block font-bold text-text-primary font-mono mt-1 underline">{pendingUser?.email}</span>
                </p>
              </div>

              {/* Simulation Notice Bar */}
              <div className="bg-[#F8F5EF] border border-border-brand rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-clay-accent font-bold">
                  {language === "en" ? "Simulated Inbox" : "সিমুলেটেড ইনবক্স"}
                </span>
                <p className="text-xs text-text-primary leading-relaxed font-sans">
                  {language === "en" 
                    ? `GrameenCraft has sent OTP: ` 
                    : `গ্রামীণক্রাফট প্রেরিত ওটিপি কোড: `}
                  <span className="font-mono text-base font-black text-accent bg-accent/10 px-3.5 py-1.5 rounded-lg border border-accent/20 ml-1.5">
                    {verificationCode}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-[#2D2A26] uppercase tracking-wider text-left mb-1">
                    {language === "en" ? "Enter 4-Digit Code" : "৪-সংখ্যার ওটিপি লিখুন"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full text-center bg-[#F8F5EF] border border-[#EAE2D6] px-4 py-3.5 rounded-xl text-lg font-mono font-black text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-hidden tracking-[0.5em] pl-[0.7em]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationModal(false);
                      setPendingUser(null);
                      triggerToast(language === "en" ? "Registration cancelled" : "নিবন্ধন বাতিল করা হয়েছে");
                    }}
                    className="flex-1 bg-white border border-border-brand text-text-primary hover:bg-[#F8F5EF] font-semibold py-3 rounded-xl text-xs md:text-sm cursor-pointer transition-colors"
                  >
                    {language === "en" ? "Cancel" : "বাতিল করুন"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2D2A26] hover:bg-[#2D2A26]/95 text-white font-semibold py-3 rounded-xl text-xs md:text-sm cursor-pointer transition-colors shadow-lg"
                  >
                    {language === "en" ? "Verify & Register" : "যাচাই করুন"}
                  </button>
                </div>
              </form>

              <div className="text-[10px] text-[#6B635B] font-mono">
                {language === "en" ? "Didn't receive it?" : "কোড পাননি?"} <button 
                  type="button" 
                  onClick={() => {
                    const code = Math.floor(1000 + Math.random() * 9000).toString();
                    setVerificationCode(code);
                    triggerToast(language === "en" ? "New verification code generated!" : "নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে!");
                  }}
                  className="text-clay-accent font-bold hover:underline"
                >
                  {language === "en" ? "Resend simulated code" : "আবার কোড পাঠান"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* bKash Payment Modal Overlay */}
      {showBkashModal && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-full max-w-sm bg-[#F1F2F4] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#E2125E]"
          >
            {/* Top Pink Banner */}
            <div className="bg-[#E2125E] p-4 text-white space-y-2 relative">
              <div className="flex items-center justify-between">
                {/* Stylized white bKash logo */}
                <div className="flex items-center gap-1.5 select-none">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#E2125E] font-extrabold text-sm font-sans italic">
                    b
                  </div>
                  <span className="font-sans font-extrabold tracking-tight text-lg">bKash</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                    PGW
                  </span>
                </div>
                
                {/* Merchant Name */}
                <span className="text-xs font-bold font-mono tracking-wide max-w-[150px] truncate text-right">
                  GrameenCraft Co
                </span>
              </div>

              <div className="flex items-end justify-between border-t border-white/20 pt-2.5">
                <div className="space-y-0.5 text-left">
                  <span className="block text-[9px] uppercase tracking-wider opacity-85 font-mono">Invoice Ref</span>
                  <span className="block text-xs font-black font-mono">{pendingOrderDetails?.id || "ORD-0000"}</span>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="block text-[9px] uppercase tracking-wider opacity-85 font-mono">Amount to Pay</span>
                  <span className="block text-base font-black font-mono">৳ {(pendingOrderDetails?.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* bKash Main Content Screen */}
            <div className="bg-white p-5 min-h-[260px] flex flex-col justify-between relative">
              {bkashStep === "number" && (
                <div className="space-y-4 my-auto">
                  {/* Center branding icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#E2125E]/5 flex items-center justify-center text-[#E2125E] border border-[#E2125E]/15">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h3 className="text-xs font-bold font-sans text-slate-700">
                      {language === "en" ? "Enter your bKash Account number" : "আপনার বিকাশ অ্যাকাউন্ট নম্বর দিন"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {language === "en" ? "11-digit personal or agent wallet number" : "১১-সংখ্যার ব্যক্তিগত বা এজেন্ট ওয়ালেট নম্বর"}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 font-mono tracking-wider">
                      +880
                    </span>
                    <input
                      type="text"
                      maxLength={11}
                      required
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value.replace(/\D/g, "").slice(-11))}
                      placeholder="e.g. 01712345678"
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#E2125E] rounded-xl pl-16 pr-4 py-3 text-sm font-mono font-black text-slate-800 outline-none tracking-widest"
                    />
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="bkash-agree"
                      checked={bkashAgreement}
                      onChange={(e) => setBkashAgreement(e.target.checked)}
                      className="mt-0.5 accent-[#E2125E] h-4 w-4 rounded cursor-pointer"
                    />
                    <label htmlFor="bkash-agree" className="text-[9px] text-slate-400 leading-tight select-none cursor-pointer">
                      {language === "en" 
                        ? "I agree to the terms and conditions. GrameenCraft will request OTP verification before charging your wallet."
                        : "আমি বিকাশ-এর নিয়ম ও শর্তাবলীর সাথে একমত। পেমেন্ট চার্জ করার আগে আপনার ওয়ালেটে ওটিপি পাঠানো হবে।"}
                    </label>
                  </div>
                </div>
              )}

              {bkashStep === "otp" && (
                <div className="space-y-4 my-auto">
                  <div className="text-center space-y-1">
                    <h3 className="text-xs font-bold font-sans text-slate-700">
                      {language === "en" ? "Enter 6-digit Verification Code" : "৬-সংখ্যার ভেরিফিকেশন কোড দিন"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {language === "en" ? `Sent to number: +880 ${bkashNumber}` : `পাঠানো হয়েছে নম্বরটিতে: +880 ${bkashNumber}`}
                    </p>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={bkashInputOtp}
                    onChange={(e) => setBkashInputOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#E2125E] rounded-xl py-3.5 text-center text-xl font-mono font-black text-slate-800 outline-none tracking-[0.5em] pl-[0.7em]"
                  />

                  {/* High Fidelity Simulated SMS Box */}
                  <div className="bg-[#FFE6EE] border border-[#FFCCD9] rounded-xl p-3 space-y-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#E2125E] font-extrabold block text-center">
                      Simulated SMS Inbox
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                        bKash verification OTP is: <span className="font-mono font-black bg-white px-2 py-0.5 rounded text-[#E2125E] border border-[#FFCCD9] text-xs">{bkashOtp}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setBkashInputOtp(bkashOtp)}
                        className="bg-[#E2125E] hover:bg-[#C20E4A] text-white text-[9px] font-bold font-mono px-2 py-1 rounded transition-colors uppercase shrink-0"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {bkashStep === "pin" && (
                <div className="space-y-4 my-auto">
                  <div className="text-center space-y-1">
                    <h3 className="text-xs font-bold font-sans text-slate-700">
                      {language === "en" ? "Enter 5-digit bKash PIN" : "৫-সংখ্যার বিকাশ পিন নম্বর দিন"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {language === "en" ? "Security check: Enter wallet secret PIN" : "নিরাপত্তা নিশ্চিতকরণ: আপনার গোপন পিন দিন"}
                    </p>
                  </div>

                  <input
                    type="password"
                    maxLength={5}
                    required
                    value={bkashPin}
                    onChange={(e) => setBkashPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="•••••"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#E2125E] rounded-xl py-3.5 text-center text-xl font-mono font-black text-slate-800 outline-none tracking-[0.6em] pl-[0.8em]"
                  />

                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 font-sans">
                      {language === "en"
                        ? "💡 Note: You can type any 5-digit PIN (e.g. 12345) to complete the checkout sandbox simulation."
                        : "💡 সাহায্য: চেকআউট স্যান্ডবক্স ডেমো শেষ করতে যেকোনো ৫-সংখ্যার পিন (যেমন ১২৩৪৫) লিখতে পারেন।"}
                    </p>
                  </div>
                </div>
              )}

              {bkashStep === "processing" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  {/* bKash Circular Bouncing Loading Dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 bg-[#E2125E] rounded-full animate-bounce delay-75"></span>
                    <span className="w-3.5 h-3.5 bg-[#E2125E] rounded-full animate-bounce delay-150"></span>
                    <span className="w-3.5 h-3.5 bg-[#E2125E] rounded-full animate-bounce delay-300"></span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 font-sans text-center mt-2 animate-pulse">
                    {bkashProcessingText}
                  </p>
                </div>
              )}
            </div>

            {/* bKash Bottom Actions Column */}
            {bkashStep !== "processing" && (
              <div className="flex border-t border-slate-200 text-xs font-bold uppercase tracking-wider font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowBkashModal(false);
                    triggerToast(language === "en" ? "bKash checkout cancelled" : "বিকাশ পেমেন্ট বাতিল করা হয়েছে");
                  }}
                  className="w-1/2 bg-[#D1D2D4] hover:bg-slate-300 text-slate-700 py-3.5 text-center transition-colors cursor-pointer"
                >
                  {language === "en" ? "Close" : "বাতিল"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (bkashStep === "number") {
                      handleBkashProceedNumber();
                    } else if (bkashStep === "otp") {
                      handleBkashProceedOtp();
                    } else if (bkashStep === "pin") {
                      handleBkashProceedPin();
                    }
                  }}
                  disabled={bkashStep === "number" && (!bkashAgreement || bkashNumber.length < 11)}
                  className={`w-1/2 text-white py-3.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
                    bkashStep === "number" && (!bkashAgreement || bkashNumber.length < 11)
                      ? "bg-[#E2125E]/40 cursor-not-allowed text-white/70"
                      : "bg-[#E2125E] hover:bg-[#C20E4A] cursor-pointer"
                  }`}
                >
                  {language === "en" ? "Proceed" : "সম্মত"}
                </button>
              </div>
            )}

            {/* bKash Official Helpline Sub-footer */}
            <div className="bg-[#D12053] text-white py-2 flex items-center justify-center gap-1 text-[9px] font-mono opacity-90 select-none">
              <span>📞 Dial 16247</span>
              <span>•</span>
              <span>www.bkash.com</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
