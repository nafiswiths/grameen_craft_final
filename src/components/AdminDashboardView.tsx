import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Package, ShoppingCart, Database, Shield, ShieldAlert,
  Trash2, User, Check, Plus, AlertCircle, RefreshCw, Eye, Edit3, Settings
} from "lucide-react";
import { Product, Language } from "../types";

interface AdminDashboardViewProps {
  registeredUsers: any[];
  setRegisteredUsers: React.Dispatch<React.SetStateAction<any[]>>;
  allProducts: Product[];
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  dbStatus: { connected: boolean; urlConfigured: boolean; error: string | null };
  language: Language;
  triggerToast: (msg: string) => void;
  formatPrice: (price: number) => string;
}

export default function AdminDashboardView({
  registeredUsers,
  setRegisteredUsers,
  allProducts,
  setAllProducts,
  orders,
  setOrders,
  dbStatus,
  language,
  triggerToast,
  formatPrice
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"users" | "products" | "orders" | "database">("users");

  // State for adding a new user from admin panel
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserDistrict, setNewUserDistrict] = useState("Dhaka");
  const [newUserRole, setNewUserRole] = useState<"buyer" | "seller" | "admin">("buyer");
  const [newUserPassword, setNewUserPassword] = useState("");

  // Handler: Change user role
  const handleRoleChange = (email: string, newRole: "buyer" | "seller" | "admin") => {
    // 1. Update client-side local state
    const updated = registeredUsers.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setRegisteredUsers(updated);
    
    // 2. Persist to localStorage
    localStorage.setItem("grameen_registered_users", JSON.stringify(updated));

    // 3. Update PostgreSQL
    fetch("/api/admin/users/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: newRole })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          triggerToast(
            language === "en" 
              ? `User role updated to ${newRole} successfully!` 
              : `ইউজার রোল সফলভাবে ${newRole}-এ পরিবর্তিত হয়েছে!`
          );
        } else {
          console.error("Backend error changing role:", data.error);
        }
      })
      .catch(err => {
        console.error("Failed to change role on database:", err);
      });
  };

  // Handler: Delete user
  const handleDeleteUser = (email: string) => {
    if (email === "admin@grameencraft.org") {
      triggerToast(language === "en" ? "Cannot delete the master admin user!" : "প্রধান এডমিন ইউজারকে ডিলিট করা সম্ভব নয়!");
      return;
    }

    if (!window.confirm(language === "en" ? `Are you sure you want to delete ${email}?` : `আপনি কি নিশ্চিত যে ${email} ডিলিট করতে চান?`)) {
      return;
    }

    // 1. Client-side local update
    const updated = registeredUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setRegisteredUsers(updated);
    localStorage.setItem("grameen_registered_users", JSON.stringify(updated));

    // 2. PostgreSQL update
    fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          triggerToast(language === "en" ? "User removed successfully!" : "ইউজার সফলভাবে মুছে ফেলা হয়েছে!");
        }
      })
      .catch(err => console.error("Failed to delete user:", err));
  };

  // Handler: Add User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserPhone || !newUserAddress) {
      triggerToast(language === "en" ? "Please fill all fields!" : "অনুগ্রহ করে সব তথ্য দিন!");
      return;
    }

    if (registeredUsers.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      triggerToast(language === "en" ? "This email is already registered!" : "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত!");
      return;
    }

    const newUser = {
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      address: newUserAddress,
      district: newUserDistrict,
      role: newUserRole,
      password: newUserPassword
    };

    // 1. Client-side
    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem("grameen_registered_users", JSON.stringify(updated));

    // 2. PostgreSQL
    fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    })
      .then(res => res.json())
      .then(() => {
        triggerToast(language === "en" ? "User added successfully!" : "নতুন ইউজার সফলভাবে যোগ করা হয়েছে!");
        // Reset and close
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPhone("");
        setNewUserAddress("");
        setNewUserPassword("");
        setShowAddUser(false);
      })
      .catch(err => console.error("Error creating user:", err));
  };

  // Handler: Delete Product
  const handleDeleteProduct = (prodId: string) => {
    if (!window.confirm(language === "en" ? "Are you sure you want to delete this craft product?" : "আপনি কি নিশ্চিত যে এই হস্তশিল্প পণ্যটি ডিলিট করতে চান?")) {
      return;
    }

    // 1. Client-side
    const updated = allProducts.filter(p => p.id !== prodId);
    setAllProducts(updated);
    localStorage.setItem("grameen_products", JSON.stringify(updated));

    // 2. PostgreSQL
    fetch(`/api/admin/products/${prodId}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          triggerToast(language === "en" ? "Product deleted successfully!" : "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে!");
        }
      })
      .catch(err => console.error("Error deleting product:", err));
  };

  // Handler: Toggle Product Stock
  const handleToggleStock = (prodId: string, currentStock: boolean) => {
    const nextStockState = !currentStock;

    // 1. Client-side
    const updated = allProducts.map(p => {
      if (p.id === prodId) {
        return { ...p, inStock: nextStockState };
      }
      return p;
    });
    setAllProducts(updated);
    localStorage.setItem("grameen_products", JSON.stringify(updated));

    // 2. PostgreSQL
    fetch("/api/admin/products/toggle-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prodId, inStock: nextStockState })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          triggerToast(
            language === "en" 
              ? `Product stock status set to ${nextStockState ? "In Stock" : "Out of Stock"}` 
              : `পণ্যটির স্টক স্ট্যাটাস পরিবর্তিত হয়েছে`
          );
        }
      })
      .catch(err => console.error("Error toggling stock status:", err));
  };

  // Handler: Change Order Status
  const handleOrderStatusChange = (orderId: string, nextStatus: string) => {
    // 1. Client-side
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem("grameen_orders", JSON.stringify(updated));

    // 2. PostgreSQL
    fetch("/api/admin/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: nextStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          triggerToast(
            language === "en" 
              ? `Order ${orderId} marked as ${nextStatus}!` 
              : `অর্ডার ${orderId}-এর স্ট্যাটাস ${nextStatus} করা হয়েছে!`
          );
        }
      })
      .catch(err => console.error("Error changing order status:", err));
  };

  return (
    <div className="space-y-6">
      {/* 1. Admin Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-text-secondary tracking-wider">
              {language === "en" ? "Total Users" : "মোট ব্যবহারকারী"}
            </span>
            <span className="text-xl font-serif font-black text-text-primary">
              {registeredUsers.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-all">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Package size={20} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-text-secondary tracking-wider">
              {language === "en" ? "Total Products" : "মোট হস্তশিল্প"}
            </span>
            <span className="text-xl font-serif font-black text-text-primary">
              {allProducts.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingCart size={20} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-text-secondary tracking-wider">
              {language === "en" ? "Total Orders" : "মোট অর্ডার"}
            </span>
            <span className="text-xl font-serif font-black text-text-primary">
              {orders.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-border-brand rounded-2xl p-4 flex items-center gap-4 hover:shadow-xs transition-all">
          <div className={`p-3 rounded-xl ${dbStatus.connected ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600 animate-pulse"}`}>
            <Database size={20} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-text-secondary tracking-wider">
              {language === "en" ? "Supabase Status" : "সুপাবেজ স্ট্যাটাস"}
            </span>
            <span className="text-xs font-mono font-bold">
              {dbStatus.connected ? (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  CONNECTED
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  LOCAL/OFFLINE
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-border-brand/40 gap-2 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 py-3 px-4 font-mono text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "users"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Users size={14} />
          <span>{language === "en" ? "Manage Users" : "ব্যবহারকারী তালিকা"}</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 py-3 px-4 font-mono text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "products"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Package size={14} />
          <span>{language === "en" ? "Village Inventory" : "পণ্যের ইনভেন্টরি"}</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 py-3 px-4 font-mono text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <ShoppingCart size={14} />
          <span>{language === "en" ? "Village Orders" : "অর্ডার ব্যবস্থাপনা"}</span>
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 py-3 px-4 font-mono text-xs font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "database"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Database size={14} />
          <span>{language === "en" ? "Supabase Logs" : "সুপাবেজ লোগস"}</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white border border-border-brand rounded-2xl p-6 shadow-2xs">
        {/* A. TAB: USERS */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-brand/45">
              <div>
                <h3 className="font-serif font-black text-lg text-text-primary">
                  {language === "en" ? "User Management Directory" : "ব্যবহারকারী ডিরেক্টরি"}
                </h3>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  {language === "en" ? "Promote roles, delete accounts, or add new test identities." : "রোল পরিবর্তন করুন, অ্যাকাউন্ট ডিলিট করুন অথবা নতুন অ্যাকাউন্ট যোগ করুন।"}
                </p>
              </div>

              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="self-start sm:self-center bg-[#2D2A26] text-white hover:bg-[#2D2A26]/90 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>{language === "en" ? "Add New User" : "নতুন ইউজার যোগ করুন"}</span>
              </button>
            </div>

            {/* Expandable Add User Form */}
            <AnimatePresence>
              {showAddUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-bg-brand/40 border border-border-brand rounded-xl p-5 overflow-hidden"
                >
                  <form onSubmit={handleAddUserSubmit} className="space-y-4">
                    <h4 className="font-serif font-bold text-sm text-text-primary border-b border-border-brand/35 pb-2">
                      {language === "en" ? "Create New User Account" : "নতুন ইউজার অ্যাকাউন্ট তৈরি করুন"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Kamal Uddin"
                          className="w-full bg-white border border-[#EAE2D6] px-3 py-2 rounded-lg text-xs font-mono focus:border-accent outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="kamal@village.org"
                          className="w-full bg-white border border-[#EAE2D6] px-3 py-2 rounded-lg text-xs font-mono focus:border-accent outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={newUserPhone}
                          onChange={(e) => setNewUserPhone(e.target.value)}
                          placeholder="+8801700112233"
                          className="w-full bg-white border border-[#EAE2D6] px-3 py-2 rounded-lg text-xs font-mono focus:border-accent outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">District</label>
                        <input
                          type="text"
                          required
                          value={newUserDistrict}
                          onChange={(e) => setNewUserDistrict(e.target.value)}
                          className="w-full bg-white border border-[#EAE2D6] px-3 py-2 rounded-lg text-xs font-mono focus:border-accent outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">Role</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as any)}
                          className="w-full bg-white border border-[#EAE2D6] px-3 py-2 rounded-lg text-xs font-mono focus:border-accent outline-hidden cursor-pointer"
                        >
                          <option value="buyer">Buyer (সম্মানিত ক্রেতা)</option>
                          <option value="seller">Seller / Artisan (বিক্রেতা / কারিগর)</option>
                          <option value="admin">Admin (অ্যাডমিনিস্ট্রেটর)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">Password</label>
                        <input
                          type="password"
                          required
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          placeholder="password123"
                          className="w-full bg-white border border-[#EAE2D6] px-3 py-2 rounded-lg text-xs font-mono focus:border-accent outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-text-secondary uppercase mb-1">Address</label>
                      <input
                        type="text"
                        required
                        value={newUserAddress}
                        onChange={(e) => setNewUserAddress(e.target.value)}
                        placeholder="Melandaha Upazila, Jamalpur"
                        className="w-full bg-white border border-[#EAE2D6] px-3 py-2.5 rounded-lg text-xs font-mono focus:border-accent outline-hidden"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddUser(false)}
                        className="px-4 py-2 border border-[#EAE2D6] text-text-secondary rounded-lg text-xs font-mono font-bold hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        {language === "en" ? "Cancel" : "বাতিল"}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-mono font-bold hover:bg-[#C97B4A] transition-all cursor-pointer"
                      >
                        {language === "en" ? "Save User" : "সংরক্ষণ করুন"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Table View / Mobile Responsive Cards */}
            <div className="overflow-x-auto border border-border-brand/50 rounded-xl">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[#F8F5EF] border-b border-[#EAE2D6]">
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">User Info</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Contact</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">District</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Role Access</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D6]/40">
                  {registeredUsers.map((u, idx) => (
                    <tr key={idx} className="hover:bg-bg-brand/20 transition-all">
                      <td className="p-3">
                        <div className="font-serif font-bold text-text-primary text-sm">{u.name}</div>
                        <div className="text-[10px] text-text-secondary font-mono mt-0.5">{u.email}</div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div className="text-text-primary font-mono">{u.phone}</div>
                        <div className="text-[9px] text-text-secondary font-mono truncate max-w-xs">{u.address}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#A67C52]/5 text-[#A67C52] border border-[#A67C52]/10">
                          {u.district || "Dhaka"}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role || "buyer"}
                          onChange={(e) => handleRoleChange(u.email, e.target.value as any)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border outline-hidden cursor-pointer ${
                            u.role === "admin" 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : u.role === "seller" 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          disabled={u.email === "admin@grameencraft.org"}
                          className={`p-1.5 rounded-lg border transition-all ${
                            u.email === "admin@grameencraft.org"
                              ? "text-gray-300 border-gray-100 cursor-not-allowed"
                              : "text-red-500 border-red-100 hover:bg-red-50 cursor-pointer"
                          }`}
                          title={language === "en" ? "Delete User" : "ব্যবহারকারী ডিলিট করুন"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* B. TAB: PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-black text-lg text-text-primary">
                {language === "en" ? "Village Craft Stock Control" : "হস্তশিল্প পণ্য ইনভেন্টরি"}
              </h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                {language === "en" ? "Control product availability, edit listings, and clean stale database items." : "পণ্য স্টক নিয়ন্ত্রণ করুন ও অকার্যকর হস্তশিল্প পণ্য মুছে ফেলুন।"}
              </p>
            </div>

            <div className="overflow-x-auto border border-border-brand/50 rounded-xl">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[#F8F5EF] border-b border-[#EAE2D6]">
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Product Info</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Category</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Price (৳)</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Stock Status</th>
                    <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D6]/40">
                  {allProducts.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-bg-brand/20 transition-all">
                      <td className="p-3 flex items-center gap-3">
                        <img 
                          src={p.image} 
                          alt={p.nameEn} 
                          className="w-10 h-10 object-cover rounded-lg border border-[#EAE2D6]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-serif font-bold text-text-primary text-sm">
                            {language === "en" ? p.nameEn : p.nameBn}
                          </div>
                          <div className="text-[10px] text-text-secondary font-mono mt-0.5">ID: {p.id}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-[#A67C52]/10 text-[#A67C52] text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border border-[#A67C52]/15">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-text-primary">
                        {formatPrice(p.price)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStock(p.id, p.inStock)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            p.inStock 
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {p.inStock 
                            ? (language === "en" ? "● IN STOCK" : "● মজুত আছে") 
                            : (language === "en" ? "○ OUT OF STOCK" : "○ মজুত নেই")}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg border text-red-500 border-red-100 hover:bg-red-50 transition-all cursor-pointer"
                          title={language === "en" ? "Delete Product" : "মুছে ফেলুন"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* C. TAB: ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-black text-lg text-text-primary">
                {language === "en" ? "Rural Order Logbook" : "অর্ডার লগবুক"}
              </h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                {language === "en" ? "Dispatch requests, verify custom digital bKash tokens, and track shipments." : "অর্ডার স্ট্যাটাস পরিবর্তন করুন, শিপমেন্ট ট্র্যাকিং ও কাস্টমার ডেলিভারি নিশ্চিত করুন।"}
              </p>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-text-secondary font-mono">No village orders registered yet.</p>
            ) : (
              <div className="overflow-x-auto border border-border-brand/50 rounded-xl">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#F8F5EF] border-b border-[#EAE2D6]">
                      <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Order ID</th>
                      <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Craft Name</th>
                      <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Customer Email</th>
                      <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Total (৳)</th>
                      <th className="p-3 font-bold text-[10px] uppercase text-text-secondary tracking-wider">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE2D6]/40">
                    {orders.map((o, idx) => (
                      <tr key={o.id || idx} className="hover:bg-bg-brand/20 transition-all">
                        <td className="p-3 font-bold text-text-primary">{o.id}</td>
                        <td className="p-3 font-serif font-black text-xs text-[#2D2A26]">{o.productName}</td>
                        <td className="p-3 text-text-secondary">{o.userEmail || "guest@dhaka.com"}</td>
                        <td className="p-3 font-bold text-text-primary">{formatPrice(o.total)}</td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className={`px-2 py-1 rounded text-[10px] font-bold border outline-hidden cursor-pointer ${
                              o.status === "Delivered" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : o.status === "Shipped" 
                                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                                  : o.status === "Processed"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processed">Processed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* D. TAB: DATABASE LOGS */}
        {activeTab === "database" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border-brand/45">
              <div>
                <h3 className="font-serif font-black text-lg text-text-primary">
                  {language === "en" ? "Supabase PostgreSQL Inspection" : "সুপাবেজ ডাটাবেজ ইন্টিগ্রেশন লগ"}
                </h3>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  {language === "en" ? "Deep inspect live connections, raw credentials status, and table schemas." : "সুপাবেজ পোস্টগ্রেস কানেকশন, স্কিমা ও ডাইরেক্ট সিনক্রোনাইজেশন স্ট্যাটাস পরীক্ষা করুন।"}
                </p>
              </div>

              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="bg-accent/10 border border-accent/20 hover:bg-accent/15 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-clay-accent flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>{language === "en" ? "Re-sync Database" : "ডাটা রি-সিঙ্ক করুন"}</span>
              </button>
            </div>

            <div className="bg-[#1C1A17] text-[#D4C3B3] p-5 rounded-xl font-mono text-xs space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#2D2A26] pb-2">
                <span className="text-[#A67C52] font-bold">METRIC / SYSTEM PROPERTY</span>
                <span className="text-[#A67C52] font-bold">LIVE METRIC VALUE</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#2D2A26]/40">
                <span>Supabase PostgreSQL Integration Status:</span>
                {dbStatus.connected ? (
                  <span className="text-green-400 font-bold">● ACTIVE CONNECTED (Supabase PostgreSQL)</span>
                ) : (
                  <span className="text-amber-500 font-bold">▲ OFFLINE FALLBACK MODE</span>
                )}
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#2D2A26]/40">
                <span>Database URL Environment Configured:</span>
                <span>{dbStatus.urlConfigured ? "YES (DATABASE_URL configured successfully)" : "NO (Using offline fallback state)"}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#2D2A26]/40">
                <span>App Engine Active Mode:</span>
                <span>{dbStatus.connected ? "Hybrid Sync Production Mode" : "Transient Client-side Local Storage Fallback"}</span>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-amber-500 font-bold block">★ Supabase Quick Connection Instructions:</span>
                <p className="text-[11px] text-[#A67C52] leading-relaxed">
                  To bind this applet directly to your Supabase PostgreSQL database, open the **Settings** menu at the top right of your workspace and specify a `DATABASE_URL` matching your database transaction/session connection string (e.g. `postgresql://postgres:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`). Once set, the app will automatically sync schemas and store live village crafts, user profiles, and orders directly in your Supabase database!
                </p>
              </div>

              {dbStatus.error && (
                <div className="mt-4 p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-red-400 flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Last Connection Error Logged:</span>
                    <p className="text-[11px] mt-0.5">{dbStatus.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
