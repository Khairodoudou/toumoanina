"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  User,
  AlertCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface PatientPhotoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  patientName?: string;
}

// Curated stylish preset avatars (optimized high-resolution SVGs encoded as data URLs)
export const PRESET_AVATARS = [
  {
    id: "grandpa_1",
    labelAr: "جدّ 1",
    labelFr: "Grand-père 1",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "grandma_1",
    labelAr: "جدّة 1",
    labelFr: "Grand-mère 1",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "grandpa_2",
    labelAr: "جدّ 2",
    labelFr: "Grand-père 2",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "grandma_2",
    labelAr: "جدّة 2",
    labelFr: "Grand-mère 2",
    url: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "man_mature",
    labelAr: "رجل",
    labelFr: "Homme",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: "woman_mature",
    labelAr: "سيدة",
    labelFr: "Femme",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80",
  },
];

export default function PatientPhotoUploader({
  value,
  onChange,
  patientName = "",
}: PatientPhotoUploaderProps) {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value && !value.startsWith("data:") ? value : "");
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialLetter = patientName.trim() ? patientName.trim().charAt(0).toUpperCase() : "?";

  // Compress & resize image to clean lightweight Base64
  const processFile = (file: File) => {
    setUploadError(null);

    // Validate type
    if (!file.type.startsWith("image/")) {
      setUploadError(
        language === "ar"
          ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)."
          : "Veuillez sélectionner un fichier image valide (PNG, JPG, WebP)."
      );
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        language === "ar"
          ? "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)."
          : "L'image est trop volumineuse (max 5 Mo)."
      );
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Offscreen canvas compression (max 500x500 for fast local storage & instant render)
        const canvas = document.createElement("canvas");
        const MAX_DIM = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onChange(compressedDataUrl);
          setIsProcessing(false);
        } else {
          // Fallback if canvas context fails
          onChange(e.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setUploadError(
          language === "ar"
            ? "تعذر قراءة الصورة، يرجى تجربة صورة أخرى."
            : "Impossible de lire l'image, veuillez en essayer une autre."
        );
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemovePhoto = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-text flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span>
            {language === "ar" ? "صورة الملف الشخصي (اختياري)" : "Photo de profil (optionnel)"}
          </span>
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>{language === "ar" ? "إزالة الصورة" : "Supprimer la photo"}</span>
          </button>
        )}
      </div>

      {/* Main Avatar Preview + Controls card */}
      <div className="bg-bg/70 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
        {/* Left: Avatar Circle Preview */}
        <div className="relative group flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-3 border-white shadow-md bg-gradient-brand flex items-center justify-center transition-all group-hover:scale-102">
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt={patientName || "Profile preview"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white text-center">
                {patientName.trim() ? (
                  <span className="text-3xl sm:text-4xl font-extrabold">{initialLetter}</span>
                ) : (
                  <User className="w-10 h-10 opacity-70" />
                )}
                <span className="text-[10px] font-medium opacity-80 mt-0.5">
                  {language === "ar" ? "بدون صورة" : "Sans photo"}
                </span>
              </div>
            )}
          </div>

          {/* Quick remove button badge on preview */}
          {value && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              title={language === "ar" ? "إزالة" : "Supprimer"}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow transition-transform hover:scale-110"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Picker Options */}
        <div className="flex-1 w-full space-y-3">
          {/* Sub-tabs for methods */}
          <div className="flex rounded-xl bg-white border border-border p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "تحميل صورة" : "Téléverser"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "presets"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "نماذج جاهزة" : "Avatars"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "url"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{language === "ar" ? "رابط Web" : "Lien Web"}</span>
            </button>
          </div>

          {/* TAB 1: File Upload / Drag & Drop */}
          {activeTab === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="patient-photo-input"
              />
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-3 sm:p-4 text-center transition-all flex flex-col items-center justify-center gap-1.5 bg-white ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-101"
                    : "border-border hover:border-primary/50 hover:bg-primary/[0.02]"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {isProcessing ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </div>
                <p className="text-xs font-bold text-text">
                  {language === "ar"
                    ? "اضغط لاختيار صورة من جهازك أو اسحبها هنا"
                    : "Cliquez pour choisir un fichier ou glissez-déposez ici"}
                </p>
                <p className="text-[10px] text-text-muted">
                  PNG, JPG, WebP — {language === "ar" ? "حتى 5 ميغابايت" : "jusqu'à 5 Mo"}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Curated Presets */}
          {activeTab === "presets" && (
            <div className="space-y-2">
              <p className="text-[11px] text-text-muted font-medium">
                {language === "ar"
                  ? "اختر صورة مناسبة لقريبك بنقرة واحدة:"
                  : "Sélectionnez un avatar prêt à l'emploi en un clic :"}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChange(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30 scale-105"
                          : "border-transparent hover:border-primary/40 hover:scale-102"
                      }`}
                      title={language === "ar" ? preset.labelAr : preset.labelFr}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.labelFr}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Direct Web URL */}
          {activeTab === "url" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="w-4 h-4 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUrlApply();
                      }
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                    dir="ltr"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  {language === "ar" ? "تطبيق" : "Appliquer"}
                </button>
              </div>
              <p className="text-[10px] text-text-muted">
                {language === "ar"
                  ? "الصق رابط صورة مباشر متاح على الإنترنت."
                  : "Collez l'adresse URL directe d'une image en ligne."}
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
