"use client";

import React, { useState } from "react";
import { X, Plus, Utensils, Building2, Tag, DollarSign, Loader2 } from "lucide-react";
import { Restaurant } from "@/types";

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRestaurant: Restaurant, openReview: boolean) => void;
}

const BUILDING_OPTIONS = ["누리꿈", "사보이", "kgit", "기타"];
const CATEGORY_OPTIONS = ["한식", "일식", "중식", "양식", "분식", "카페", "아시안", "기타"];
const PRICE_OPTIONS = ["1만원 이하", "1~2만원", "2~3만원", "3만원 이상"];

export default function AddRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRestaurantModalProps) {
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("누리꿈");
  const [customBuilding, setCustomBuilding] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["한식"]);
  const [priceRange, setPriceRange] = useState("1만원 이하");
  const [openReviewAfter, setOpenReviewAfter] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("음식점 이름을 입력해주세요.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const finalBuilding =
        building === "기타" && customBuilding.trim()
          ? customBuilding.trim()
          : building;

      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          building: finalBuilding,
          categories: selectedCategories,
          priceRange,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "음식점 등록에 실패했습니다.");
      }

      setName("");
      setBuilding("누리꿈");
      setCustomBuilding("");
      setSelectedCategories(["한식"]);
      onSuccess(data.data, openReviewAfter);
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[92vh] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black">새 음식점 등록</h2>
          <p className="text-xs text-orange-100 mt-1">
            노션 음식점 DB에 건물, 카테고리, 가격대와 함께 등록합니다.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Restaurant Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              음식점 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 옥토끼, 누리꿈 순대국"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          {/* Building / Location Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>건물 / 위치</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BUILDING_OPTIONS.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setBuilding(loc)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    building === loc
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
            {building === "기타" && (
              <input
                type="text"
                placeholder="직접 위치 입력 (예: 월드컵파크, MBC몰)"
                value={customBuilding}
                onChange={(e) => setCustomBuilding(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            )}
          </div>

          {/* Food Category Multi-select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>음식 카테고리 (중복 선택 가능)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                      isSelected
                        ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>가격대</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriceRange(p)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition ${
                    priceRange === p
                      ? "bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Option: Open Review Immediately */}
          <label className="flex items-center space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={openReviewAfter}
              onChange={(e) => setOpenReviewAfter(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              식당 등록 후 바로 평론 작성창 열기
            </span>
          </label>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>노션에 등록 중...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>음식점 등록</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}