import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../lib/api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  X,
  Eye,
  EyeOff,
  Layers,
  Grid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  Upload
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const normalizeLongevity = (val) => {
  const v = (val || "").toLowerCase();
  if (v.includes("4")) return "4hrs";
  if (v.includes("5")) return "5hrs";
  if (v.includes("6")) return "6hrs";
  if (v.includes("7")) return "7hrs";
  if (v.includes("8") || v.includes("9") || v.includes("long") || v.includes("very")) return "8hrs";
  return "6hrs";
};

const normalizeSillage = (val) => {
  const v = (val || "").toLowerCase();
  if (v.includes("moderate")) return "Moderate";
  if (v.includes("strong")) return "Strong";
  if (v.includes("enormous")) return "Enormous";
  return "Moderate";
};

const ALL_ACCORDS = [
  "Aldehydic", "Amber", "Animalic", "Aquatic", "Aromatic", "Balsamic", "Cinnamon",
  "Citrus", "Coconut", "Coffee", "Earthy", "Floral", "Fresh", "Fresh Spicy",
  "Fruity", "Gourmand", "Green", "Iris", "Lactonic", "Lavender", "Leather",
  "Marine", "Metallic", "Mossy", "Musky", "Oud", "Ozonic", "Patchouli",
  "Powdery", "Rose", "Savory", "Smoky", "Soft Spicy", "Spicy", "Sweet",
  "Tobacco", "Tropical", "Vanilla", "Violet", "Warm Spicy", "White Floral",
  "Woody", "Yellow Floral"
];

// Memoized Table Row Component
const CatalogRow = React.memo(({ product, onToggleActive, onOpenPricing, onOpenEdit, onDeleteProduct }) => {
  return (
    <tr className="hover:bg-white/[0.01] transition duration-150">
      <td className="py-4 px-6">
        <div className="w-12 h-12 rounded-sm bg-black/40 border border-white/[0.06] overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=150&auto=format&fit=crop";
              }}
            />
          ) : (
            <Layers className="w-5 h-5 text-brand-gold/40" />
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="font-semibold text-brand-cream text-base">{product.name}</div>
        <div className="text-xs text-brand-cream/50 mt-0.5">{product.brand}</div>
      </td>
      <td className="py-4 px-6">
        <div className="text-brand-cream/80 font-medium">{product.scent_profile}</div>
        <div className="text-[10px] text-brand-cream/40 uppercase tracking-wider mt-0.5">{product.demographic}</div>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
          {product.volumes.length === 0 ? (
            <span className="text-xs text-brand-cream/35 italic">No price tags set</span>
          ) : (
            product.volumes.map((vol) => (
              <span
                key={vol.id}
                className={`inline-flex px-1.5 py-0.5 rounded-sm text-[10px] font-semibold border ${
                  vol.is_available
                    ? "text-brand-gold border-brand-gold/20 bg-brand-gold/5"
                    : "text-brand-cream/40 border-white/[0.04] bg-white/[0.01] line-through"
                }`}
              >
                {vol.size}: ₱{vol.price}
              </span>
            ))
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => onToggleActive(product.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer transition ${
            product.is_active
              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
              : "text-brand-cream/40 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06]"
          }`}
        >
          {product.is_active ? (
            <>
              <Eye className="w-3.5 h-3.5" /> Published
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Hidden
            </>
          )}
        </button>
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onOpenPricing(product)}
            className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm transition cursor-pointer flex items-center gap-1 text-xs uppercase tracking-wider font-semibold"
            title="Manage Size & Pricing List"
          >
            <DollarSign className="w-3.5 h-3.5" /> Pricing
          </button>
          <button
            onClick={() => onOpenEdit(product)}
            className="p-2 bg-white/[0.02] border border-white/[0.08] hover:border-brand-gold/40 text-brand-cream/70 hover:text-brand-gold rounded-sm transition cursor-pointer"
            title="Edit decant metadata"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteProduct(product)}
            className="p-2 bg-white/[0.02] border border-white/[0.08] hover:border-red-500/40 text-brand-cream/70 hover:text-red-500 rounded-sm transition cursor-pointer"
            title="Delete decant product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
});
CatalogRow.displayName = "CatalogRow";

// Standalone self-contained Create/Edit Product Modal to isolate form states
const ProductModal = React.memo(({ isOpen, onClose, editingProduct, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    scent_profile: "Woody",
    demographic: "Unisex",
    image_url: "",
    performance_longevity: "6hrs",
    performance_sillage: "Moderate",
    usage_day: true,
    usage_night: true,
    season_spring: true,
    season_summer: true,
    season_autumn: true,
    season_winter: true,
    rating: 4.5,
    rating_count: 10,
    is_active: true,
    accords: []
  });

  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        const loadedAccords = editingProduct.accords ? editingProduct.accords.map((a) => ({ name: a.name, percentage: a.percentage })) : [];
        const scentProfile = loadedAccords.length > 0 ? loadedAccords[0].name : editingProduct.scent_profile;
        setFormData({
          name: editingProduct.name,
          brand: editingProduct.brand,
          scent_profile: scentProfile,
          demographic: editingProduct.demographic,
          image_url: editingProduct.image_url || "",
          performance_longevity: normalizeLongevity(editingProduct.performance.longevity),
          performance_sillage: normalizeSillage(editingProduct.performance.sillage),
          usage_day: editingProduct.usage.day,
          usage_night: editingProduct.usage.night,
          season_spring: editingProduct.usage.seasons.spring,
          season_summer: editingProduct.usage.seasons.summer,
          season_autumn: editingProduct.usage.seasons.autumn,
          season_winter: editingProduct.usage.seasons.winter,
          rating: editingProduct.rating,
          rating_count: editingProduct.rating_count,
          is_active: editingProduct.is_active,
          accords: loadedAccords
        });
      } else {
        setFormData({
          name: "",
          brand: "",
          scent_profile: "Woody",
          demographic: "Unisex",
          image_url: "",
          performance_longevity: "6hrs",
          performance_sillage: "Moderate",
          usage_day: true,
          usage_night: true,
          season_spring: true,
          season_summer: true,
          season_autumn: true,
          season_winter: true,
          rating: 4.5,
          rating_count: 10,
          is_active: true,
          accords: []
        });
      }
    }
  }, [isOpen, editingProduct]);

  const handleAccordChange = (index, field, value) => {
    setFormData((prev) => {
      const newAccords = [...prev.accords];
      newAccords[index] = { ...newAccords[index], [field]: value };
      let scent_profile = prev.scent_profile;
      if (index === 0 && field === "name") {
        scent_profile = value;
      }
      return {
        ...prev,
        accords: newAccords,
        scent_profile
      };
    });
  };

  const addAccordRow = () => {
    if (formData.accords.length >= 5) return;
    setFormData((prev) => {
      const newAccords = [...prev.accords, { name: "Woody", percentage: 50 }];
      let scent_profile = prev.scent_profile;
      if (newAccords.length === 1) {
        scent_profile = "Woody";
      }
      return {
        ...prev,
        accords: newAccords,
        scent_profile
      };
    });
  };

  const removeAccordRow = (index) => {
    setFormData((prev) => {
      const newAccords = prev.accords.filter((_, i) => i !== index);
      let scent_profile = prev.scent_profile;
      if (newAccords.length > 0) {
        scent_profile = newAccords[0].name;
      }
      return {
        ...prev,
        accords: newAccords,
        scent_profile
      };
    });
  };

  const uploadFileDirectly = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formPayload = new FormData();
      formPayload.append("file", file);
      
      const response = await api.post("/admin/products/upload", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      const publicUrl = response.data.url;
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded natively over HTTP!");
    } catch (err) {
      console.warn("Standard upload hit a snag, falling back to base64 channel...", err);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64String = reader.result;
            const response = await api.post("/admin/products/upload", {
              image_base64: base64String,
              filename: file.name
            });
            const publicUrl = response.data.url;
            setFormData((prev) => ({ ...prev, image_url: publicUrl }));
            toast.success("Image uploaded successfully (fallback channel)!");
          } catch (fallbackErr) {
            console.error("Image upload failed completely:", fallbackErr);
            const errors = fallbackErr.response?.data?.errors;
            if (errors) {
              Object.keys(errors).forEach((key) => {
                toast.error(`${key}: ${errors[key].join(", ")}`);
              });
            } else {
              toast.error(fallbackErr.response?.data?.message || "Failed to upload image locally.");
            }
          }
        };
        reader.readAsDataURL(file);
      } catch (readErr) {
        console.error("Error reading image:", readErr);
        toast.error("Failed to read image file.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFileDirectly(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFileDirectly(file);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      brand: formData.brand,
      scent_profile: formData.scent_profile,
      demographic: formData.demographic,
      image_url: formData.image_url || null,
      performance: {
        longevity: formData.performance_longevity,
        sillage: formData.performance_sillage
      },
      usage: {
        day: formData.usage_day,
        night: formData.usage_night,
        seasons: {
          spring: formData.season_spring,
          summer: formData.season_summer,
          autumn: formData.season_autumn,
          winter: formData.season_winter
        }
      },
      rating: Number(formData.rating),
      rating_count: Number(formData.rating_count),
      is_active: formData.is_active,
      accords: formData.accords
    };
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success("Product updated successfully.");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Product cataloged successfully.");
      }
      onSuccess();
    } catch (err) {
      console.error("Error submitting product form:", err);
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key].join(", ")}`);
        });
      } else {
        toast.error(err.response?.data?.message || "Error occurred while saving product.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-brand-emerald-dark border border-brand-gold/30 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-8 text-brand-cream font-sans"
          >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-brand-cream/60 hover:text-brand-gold transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-brand-cream flex items-center gap-2 mb-6 border-b border-white/[0.08] pb-4">
              <Sparkles className="w-5 h-5 text-brand-gold" /> 
              {editingProduct ? `Edit ${editingProduct.name}` : "Introduce New Decant Product"}
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aventus"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream placeholder-brand-cream/20 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-2">Brand / House</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creed"
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream placeholder-brand-cream/20 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-2">Scent Profile</label>
                  <select
                    value={formData.scent_profile}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scent_profile: e.target.value }))}
                    disabled={formData.accords.length > 0}
                    className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {ALL_ACCORDS.map((profile) => <option key={profile} value={profile}>{profile}</option>)}
                  </select>
                  {formData.accords.length > 0 && (
                    <p className="text-[10px] text-brand-gold/60 mt-1 italic">
                      * Synced to Accord #1 (Primary) below.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-2">Demographic Accent</label>
                  <select
                    value={formData.demographic}
                    onChange={(e) => setFormData((prev) => ({ ...prev, demographic: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none text-sm"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Masculine">Masculine (Men)</option>
                    <option value="Feminine">Feminine (Women)</option>
                  </select>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <h4 className="text-xs font-semibold text-brand-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Main Accords & Progression Tiers
                    </h4>
                    <span className="text-[10px] text-brand-cream/40 uppercase tracking-widest font-mono">
                      {formData.accords.length} / 5 Accords
                    </span>
                  </div>

                  {formData.accords.length === 0 ? (
                    <div className="py-6 text-center text-brand-cream/35 italic text-xs bg-black/20 border border-dashed border-brand-gold/15 rounded-sm">
                      No main accords configured. The storefront will only display the primary Scent Profile.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.accords.map((accord, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-black/40 border border-brand-gold/10 rounded-sm">
                          <div className="flex items-center gap-2 sm:w-1/3">
                            <span className="font-mono text-xs font-semibold text-brand-gold w-6">#{idx + 1}</span>
                            <span className="text-[10px] text-brand-cream/50 uppercase tracking-wider">
                              {idx === 0 ? "Primary Accord" : `Accord #${idx + 1}`}
                            </span>
                          </div>

                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <select
                                value={accord.name}
                                onChange={(e) => handleAccordChange(idx, "name", e.target.value)}
                                className="w-full px-2 py-1.5 bg-black/50 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none text-xs"
                              >
                                {ALL_ACCORDS.map((profile) => <option key={profile} value={profile}>{profile}</option>)}
                              </select>
                            </div>

                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="99"
                                required
                                value={accord.percentage}
                                onChange={(e) => handleAccordChange(idx, "percentage", Number(e.target.value))}
                                className="w-full pl-3 pr-6 py-1.5 bg-black/50 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none text-xs text-right"
                                placeholder="%"
                              />
                              <span className="absolute inset-y-0 right-2.5 flex items-center text-brand-cream/40 text-xs font-semibold select-none">%</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeAccordRow(idx)}
                            className="p-1.5 self-end sm:self-auto bg-white/[0.02] border border-white/[0.08] hover:border-red-500/30 text-brand-cream/55 hover:text-red-500 rounded-sm transition cursor-pointer flex items-center justify-center"
                            title="Remove Accord"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.accords.length < 5 && (
                    <button
                      type="button"
                      onClick={addAccordRow}
                      className="w-full py-2 bg-white/[0.02] border border-dashed border-brand-gold/25 hover:border-brand-gold/50 text-brand-gold font-semibold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold/5 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Accord Row
                    </button>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider">Bottle Image</label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                    <div className="sm:col-span-1 h-28 rounded-lg border border-brand-gold/20 bg-black/40 flex items-center justify-center overflow-hidden relative shadow-inner">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="Uploaded preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] text-brand-cream/30 text-center p-2 uppercase tracking-wider">No Image</div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 space-y-4">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-upload-input")?.click()}
                        className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-2 group ${
                          isDragging
                            ? "border-brand-gold bg-brand-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "border-brand-gold/20 hover:border-brand-gold/45 bg-black/30 hover:bg-black/50"
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload-input"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload
                          className={`w-7 h-7 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                            isDragging ? "text-brand-gold animate-bounce" : "text-brand-gold/60 group-hover:text-brand-gold"
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-brand-cream tracking-wide">
                            Drag & drop perfume image here
                          </p>
                          <p className="text-[10px] text-brand-cream/40">
                            or <span className="text-brand-gold underline font-medium">click to browse</span> from computer
                          </p>
                        </div>
                        <p className="text-[8px] text-brand-cream/30 uppercase tracking-wider mt-1">
                          Supports PNG, JPG, WEBP (Max 8MB)
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-2">
                          Or Paste Direct Image URL
                        </label>
                        <input
                          type="text"
                          placeholder="Paste a direct image URL (e.g. Unsplash) or type filename..."
                          value={formData.image_url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                          className="w-full px-3 py-2 bg-black/30 border border-brand-gold/10 hover:border-brand-gold/25 focus:border-brand-gold rounded-sm text-brand-cream/80 placeholder-brand-cream/15 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-4 md:col-span-2">
                  <h4 className="text-xs font-semibold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                    <Info className="w-3.5 h-3.5" /> Performance Parameters
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-brand-cream/60 mb-2">Longevity rating</label>
                      <select
                        required
                        value={formData.performance_longevity}
                        onChange={(e) => setFormData((prev) => ({ ...prev, performance_longevity: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream text-xs focus:outline-none"
                      >
                        <option value="4hrs">4hrs</option>
                        <option value="5hrs">5hrs</option>
                        <option value="6hrs">6hrs</option>
                        <option value="7hrs">7hrs</option>
                        <option value="8hrs">8hrs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-brand-cream/60 mb-2">Sillage rating</label>
                      <select
                        required
                        value={formData.performance_sillage}
                        onChange={(e) => setFormData((prev) => ({ ...prev, performance_sillage: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream text-xs focus:outline-none"
                      >
                        <option value="Moderate">Moderate</option>
                        <option value="Strong">Strong</option>
                        <option value="Enormous">Enormous</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-4">
                  <h4 className="text-xs font-semibold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                    <Calendar className="w-3.5 h-3.5" /> Time of Day
                  </h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.usage_day}
                        onChange={(e) => setFormData((prev) => ({ ...prev, usage_day: e.target.checked }))}
                        className="rounded-sm border-brand-gold/20 bg-black/40 text-brand-gold focus:ring-brand-gold w-4.5 h-4.5 accent-brand-gold"
                      />
                      Daytime Suitable
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.usage_night}
                        onChange={(e) => setFormData((prev) => ({ ...prev, usage_night: e.target.checked }))}
                        className="rounded-sm border-brand-gold/20 bg-black/40 text-brand-gold focus:ring-brand-gold w-4.5 h-4.5 accent-brand-gold"
                      />
                      Nighttime Suitable
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-4">
                  <h4 className="text-xs font-semibold text-brand-gold uppercase tracking-wider border-b border-white/[0.04] pb-2">
                    Seasonal Suitability
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.season_spring}
                        onChange={(e) => setFormData((prev) => ({ ...prev, season_spring: e.target.checked }))}
                        className="rounded-sm w-4 h-4 accent-brand-gold"
                      />
                      Spring
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.season_summer}
                        onChange={(e) => setFormData((prev) => ({ ...prev, season_summer: e.target.checked }))}
                        className="rounded-sm w-4 h-4 accent-brand-gold"
                      />
                      Summer
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.season_autumn}
                        onChange={(e) => setFormData((prev) => ({ ...prev, season_autumn: e.target.checked }))}
                        className="rounded-sm w-4 h-4 accent-brand-gold"
                      />
                      Autumn
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.season_winter}
                        onChange={(e) => setFormData((prev) => ({ ...prev, season_winter: e.target.checked }))}
                        className="rounded-sm w-4 h-4 accent-brand-gold"
                      />
                      Winter
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-gold uppercase tracking-wider mb-2">Initial Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                      value={formData.rating}
                      onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-gold uppercase tracking-wider mb-2">Rating Count</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.rating_count}
                      onChange={(e) => setFormData((prev) => ({ ...prev, rating_count: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-brand-gold uppercase tracking-wider cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded-sm w-4.5 h-4.5 accent-brand-gold"
                      />
                      Published
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/[0.08] pt-6 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-brand-gold text-brand-emerald-dark font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold-light active:scale-[0.99] transition cursor-pointer"
                >
                  {editingProduct ? "Save Scent Metadata" : "Publish to Catalog"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
ProductModal.displayName = "ProductModal";

// Standalone self-contained Pricing Modal to isolate volume add/update states
const PricingModal = React.memo(({ isOpen, onClose, product, onUpdateProduct }) => {
  const [newVolume, setNewVolume] = useState({
    size: "5ml",
    price: "",
    is_available: true
  });

  const handleAddVolume = async (e) => {
    e.preventDefault();
    if (!product) return;
    if (!newVolume.price) {
      toast.error("Please specify a PHP price value.");
      return;
    }
    try {
      const response = await api.post(`/admin/products/${product.id}/volumes`, {
        size: newVolume.size,
        price: Number(newVolume.price),
        is_available: newVolume.is_available
      });
      const addedVolume = response.data.volume;
      toast.success("Volume pricing tier appended.");
      const updatedProduct = {
        ...product,
        volumes: [...product.volumes, addedVolume]
      };
      onUpdateProduct(updatedProduct);
      setNewVolume({
        size: "5ml",
        price: "",
        is_available: true
      });
    } catch (err) {
      console.error("Error adding volume price:", err);
      toast.error(err.response?.data?.message || "Failed to append volume tier.");
    }
  };

  const handleUpdateVolume = async (volumeId, updatedPrice, isAvailable) => {
    if (updatedPrice < 0) {
      toast.error("Price cannot be negative.");
      return;
    }
    try {
      const response = await api.put(`/admin/volumes/${volumeId}`, {
        price: updatedPrice,
        is_available: isAvailable
      });
      const updatedVolume = response.data.volume;
      toast.success("Price tier updated.");
      if (product) {
        const updatedProduct = {
          ...product,
          volumes: product.volumes.map((v) => v.id === volumeId ? updatedVolume : v)
        };
        onUpdateProduct(updatedProduct);
      }
    } catch (err) {
      console.error("Error updating volume tier:", err);
      toast.error("Failed to update size price.");
    }
  };

  const handleDeleteVolume = async (volumeId) => {
    if (!confirm("Are you sure you want to delete this volume price tier?")) return;
    try {
      await api.delete(`/admin/volumes/${volumeId}`);
      toast.success("Pricing tier removed.");
      if (product) {
        const updatedProduct = {
          ...product,
          volumes: product.volumes.filter((v) => v.id !== volumeId)
        };
        onUpdateProduct(updatedProduct);
      }
    } catch (err) {
      console.error("Error deleting volume tier:", err);
      toast.error("Failed to remove pricing tier.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-brand-emerald-dark border border-brand-gold/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 text-brand-cream font-sans"
          >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-brand-cream/60 hover:text-brand-gold transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-white/[0.08] pb-4 mb-6">
              <span className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em]">{product.brand}</span>
              <h2 className="font-serif text-2xl font-bold text-brand-cream mt-0.5">
                Size & Volume Pricing Manager
              </h2>
              <p className="text-xs text-brand-cream/60 mt-1">
                Adjust tags for product: <strong className="text-brand-cream font-semibold">{product.name}</strong>.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
                <Grid className="w-3.5 h-3.5" /> Published Size Variations
              </h3>

              {product.volumes.length === 0 ? (
                <div className="py-8 text-center text-brand-cream/30 italic text-sm bg-white/[0.01] border border-white/[0.04] rounded-sm">
                  No size/pricing variations set for this product. Use the form below to append sizes.
                </div>
              ) : (
                <div className="space-y-3">
                  {product.volumes.map((vol) => (
                    <div
                      key={vol.id}
                      className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-sm text-sm"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-base font-bold text-brand-gold w-12">{vol.size}</span>
                        
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-brand-cream/40 text-xs font-semibold">₱</span>
                          <input
                            type="number"
                            defaultValue={vol.price}
                            onBlur={(e) => handleUpdateVolume(vol.id, Number(e.target.value), vol.is_available)}
                            className="w-24 pl-6 pr-2 py-1.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold text-xs rounded-sm text-brand-cream text-right focus:outline-none"
                            placeholder="Price"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 text-xs text-brand-cream/70 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            defaultChecked={vol.is_available}
                            onChange={(e) => handleUpdateVolume(vol.id, vol.price, e.target.checked)}
                            className="rounded-sm w-4 h-4 accent-brand-gold"
                          />
                          Available
                        </label>
                      </div>

                      <button
                        onClick={() => handleDeleteVolume(vol.id)}
                        className="p-1.5 bg-white/[0.02] border border-white/[0.08] hover:border-red-500/30 text-brand-cream/55 hover:text-red-500 rounded-sm transition cursor-pointer"
                        title="Remove tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/[0.02] border border-brand-gold/15 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" />

              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wider mb-4 border-b border-white/[0.04] pb-2 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Append Size Variation
              </h3>

              <form onSubmit={handleAddVolume} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-semibold text-brand-cream/60 uppercase mb-2">Decant Size</label>
                  <select
                    value={newVolume.size}
                    onChange={(e) => setNewVolume((prev) => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none text-xs"
                  >
                    <option value="2ml">2ml</option>
                    <option value="3ml">3ml</option>
                    <option value="5ml">5ml</option>
                    <option value="10ml">10ml</option>
                    <option value="15ml">15ml</option>
                    <option value="30ml">30ml</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-brand-cream/60 uppercase mb-2">PHP Price</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-brand-cream/40 text-xs font-semibold">₱</span>
                    <input
                      type="number"
                      placeholder="e.g. 550"
                      required
                      value={newVolume.price}
                      onChange={(e) => setNewVolume((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full pl-6 pr-2 py-2 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="pb-2.5">
                  <label className="flex items-center gap-1.5 text-xs text-brand-cream/80 cursor-pointer select-none font-semibold uppercase tracking-wider text-brand-gold">
                    <input
                      type="checkbox"
                      checked={newVolume.is_available}
                      onChange={(e) => setNewVolume((prev) => ({ ...prev, is_available: e.target.checked }))}
                      className="rounded-sm w-4 h-4 accent-brand-gold"
                    />
                    Available
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-gold text-brand-emerald-dark font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold-light active:scale-[0.98] transition cursor-pointer"
                  >
                    Append Tier
                  </button>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/[0.08] pt-6 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-5 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
PricingModal.displayName = "PricingModal";

export const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Decoupled search text fields
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  
  const [brandFilter, setBrandFilter] = useState("");
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingProduct, setPricingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (brandFilter) params.brand = brandFilter;
      const response = await api.get("/admin/products", { params });
      setProducts(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, brandFilter, search]);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await api.get("/brands");
      setBrands(response.data);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setPage(1);
    setSearch(localSearch);
  }, [localSearch]);

  const handleToggleActive = useCallback(async (productId) => {
    try {
      const response = await api.patch(`/admin/products/${productId}/toggle`);
      const { is_active } = response.data;
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, is_active } : p));
      toast.success(is_active ? "Product is now active." : "Product is now hidden.");
    } catch (err) {
      console.error("Error toggling product status:", err);
      toast.error("Failed to toggle status.");
    }
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  }, []);

  const openEditModal = useCallback((product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const handleCloseProductModal = useCallback(() => {
    setIsProductModalOpen(false);
  }, []);

  const handleProductSuccess = useCallback(() => {
    setIsProductModalOpen(false);
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  const openPricingModal = useCallback((product) => {
    setPricingProduct(product);
    setIsPricingModalOpen(true);
  }, []);

  const handleClosePricingModal = useCallback(() => {
    setIsPricingModalOpen(false);
  }, []);

  const handleUpdateProductInList = useCallback((updatedProduct) => {
    setProducts((prev) => prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p));
    setPricingProduct(updatedProduct);
  }, []);

  const requestDeleteProduct = useCallback((product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/admin/products/${productToDelete.id}`);
      toast.success("Product deleted successfully.");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete, fetchProducts]);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-brand-cream">
            Decant Catalog
          </h1>
          <p className="text-sm text-brand-cream/60 mt-1">
            Publish products, modify pricing tiers, and configure scent specifications.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="py-3 px-5 bg-gradient-to-r from-brand-gold-dark to-brand-gold text-brand-emerald-dark font-bold text-xs tracking-wider uppercase rounded-sm hover:brightness-115 cursor-pointer shadow-lg shadow-brand-gold/10 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add New Decant
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-gold/60">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by Scent Name, Brand, or Scent Profile..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-gold text-brand-emerald-dark font-semibold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold-light active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              Search
            </button>
            {(localSearch || brandFilter) && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  setSearch("");
                  setBrandFilter("");
                  setPage(1);
                }}
                className="py-2.5 px-4 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Catalog Table Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-gold font-medium uppercase tracking-widest text-xs">Querying Scent Vault...</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-brand-gold font-semibold">
                  <th className="py-4 px-6 w-16">Image</th>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Scent Profile</th>
                  <th className="py-4 px-6">Pricing Tiers</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm text-brand-cream/80">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-brand-cream/40 italic">
                      No decant products found. Let's list a new one!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <CatalogRow
                      key={product.id}
                      product={product}
                      onToggleActive={handleToggleActive}
                      onOpenPricing={openPricingModal}
                      onOpenEdit={openEditModal}
                      onDeleteProduct={requestDeleteProduct}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-white/[0.02] border-t border-white/[0.06] px-6 py-4 flex items-center justify-between text-xs text-brand-cream/60">
              <div>
                Showing <strong className="font-semibold text-brand-cream">{pagination.from}</strong> to{" "}
                <strong className="font-semibold text-brand-cream">{pagination.to}</strong> of{" "}
                <strong className="font-semibold text-brand-cream">{pagination.total}</strong> results
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === pagination.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        editingProduct={editingProduct}
        onSuccess={handleProductSuccess}
      />

      {/* Pricing / Volume Management Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={handleClosePricingModal}
        product={pricingProduct}
        onUpdateProduct={handleUpdateProductInList}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-brand-emerald-dark border border-red-500/30 rounded-xl shadow-2xl max-w-md w-full relative p-6 text-brand-cream font-sans overflow-hidden"
            >
              {/* Left red warning accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 via-red-500 to-red-600" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold tracking-wide text-brand-cream">
                    Delete Decant Product?
                  </h3>
                  <p className="text-sm text-brand-cream/70 leading-relaxed">
                    Are you sure you want to delete <strong className="text-brand-gold">{productToDelete.name}</strong>? This action is permanent and will completely remove all associated pricing tiers, notes, and accords from the vault.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="py-2.5 px-4 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="py-2.5 px-5 bg-gradient-to-r from-red-700 to-red-600 hover:brightness-110 text-white font-semibold text-xs tracking-wider uppercase rounded-sm transition cursor-pointer shadow-lg shadow-red-950/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
