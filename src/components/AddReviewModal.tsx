"use client";

import React, { useState, useEffect } from "react";
import { X, Star, Calendar, Utensils, ThumbsUp, Sparkles, Loader2, User } from "lucide-react";
import confetti from "canvas-confetti";
import { Restaurant, Review } from "@/types";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  initialRestaurantId?: string;
  defaultAuthor?: string;
  onSuccess: (newReview: Review) => void;
}

const DEFAULT_AUTHORS = ["지훈", "준협", "윤섭", "동찬"];
const RATING_PRESETS = [1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0];

export default function AddReviewModal({
  isOpen,
  onClose,
  restaurants,
  initialRestaurantId,
  defaultAuthor = "지훈",
  onSuccess,
}: AddReviewModalProps) {
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId || "");
  const [author, setAuthor] = useState(defaultAuthor || "지훈");
  const [customAuthor, setCustomAuthor] = useState("");
  const [isCustomAuthor, setIsCustomAuthor] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [rating, setRating] = useState<number>(4.0);
  const [shortComment, setShortComment] = useState("");
  const [recommendedMenu, setRecommendedMenu] = useState("");
  const [detailComment, setDetailComment] = useState("");
  const [revisit, setRevisit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialRestaurantId) {
      setRestaurantId(initialRestaurantId);
    } else if (restaurants.length > 0 && !restaurantId) {
      setRestaurantId(restaurants[0].id);
    }
  }, [initialRestaurantId, restaurants]);

  useEffect(() => {
    if (defaultAuthor) {
      if (DEFAULT_AUTHORS.includes(defaultAuthor)) {
        setAuthor(defaultAuthor);
        setIsCustomAuthor(false);
      } else {
        setCustomAuthor(defaultAuthor);
        setIsCustomAuthor(true);
      }
    }
  }, [defaultAuthor]);

  if (!isOpen) return null;

  const handleRatingInput = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(5.0, Number(val.toFixed(1))));
    setRating(clamped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      setError("음식점을 선택해주세요.");
      return;
    }

    const finalAuthor = isCustomAuthor ? customAuthor.trim() : author;
    if (!finalAuthor) {
      setError("작성자 이름을 입력해주세요.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          author: finalAuthor,
          visitDate,
          rating,
          shortComment: shortComment.trim(),
          detailComment: detailComment.trim(),
          recommendedMenu: recommendedMenu.trim(),
          revisit,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "평론 등록에 실패했습니다.");
      }

      // Celebrate with confetti 🎉
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (_) {}

      // Reset fields
      setShortComment("");
      setDetailComment("");
      setRecommendedMenu("");
      onSuccess(data.data);
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black">맛집 평론 작성</h2>
          <p className="text-xs text-orange-100 mt-1">
            노션 평론 DB에 저장되고 해당 음식점과 실시간 연결됩니다.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Restaurant Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              대상 음식점 <span className="text-red-500">*</span>
            </label>
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium text-slate-900"
            >
              <option value="" disabled>
                음식점을 선택해주세요
              </option>
              {restaurants.map((rest) => (
                <option key={rest.id} value={rest.id}>
                  {rest.name} ({rest.building || "기타"})
                </option>
              ))}
            </select>
          </div>

          {/* Author Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              작성자 (인턴) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_AUTHORS.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    setAuthor(name);
                    setIsCustomAuthor(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                    !isCustomAuthor && author === name
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomAuthor(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                  isCustomAuthor
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                + 직접 입력
              </button>
            </div>
            {isCustomAuthor && (
              <input
                type="text"
                placeholder="인턴 이름 입력"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              방문일
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Upgraded Interactive Rating Section (Slider Bar + Number Input + Preset Buttons) */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>평점 (최대 5.0점)</span>
              </label>

              {/* Number Input Box next to bar */}
              <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-amber-300 shadow-sm">
                <input
                  type="number"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={rating}
                  onChange={(e) => handleRatingInput(parseFloat(e.target.value))}
                  className="w-12 text-base font-black text-amber-900 text-center focus:outline-none bg-transparent"
                />
                <span className="text-xs font-bold text-amber-500">/ 5.0</span>
              </div>
            </div>

            {/* Slider Range Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={rating}
                onChange={(e) => handleRatingInput(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-amber-700/70 font-semibold px-0.5">
                <span>0.0</span>
                <span>1.0</span>
                <span>2.0</span>
                <span>3.0</span>
                <span>4.0</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-amber-800 mr-1">빠른 선택:</span>
              {RATING_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setRating(p)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                    rating === p
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white text-amber-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  {p.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Short Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              한줄평 <span className="text-slate-400 font-normal">(핵심 요약)</span>
            </label>
            <input
              type="text"
              placeholder="예: 국물이 깊고 진함, 점심 회식으로 최고"
              value={shortComment}
              onChange={(e) => setShortComment(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Recommended Menu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              추천 메뉴 <span className="text-slate-400 font-normal">(대표 추천 요리)</span>
            </label>
            <input
              type="text"
              placeholder="예: 얼큰 순대국, 안심 돈가스"
              value={recommendedMenu}
              onChange={(e) => setRecommendedMenu(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              상세 평론 <span className="text-slate-400 font-normal">(선택 사항)</span>
            </label>
            <textarea
              rows={2}
              placeholder="맛, 분위기, 웨이팅 시간, 양 등 상세한 후기를 자유롭게 적어주세요."
              value={detailComment}
              onChange={(e) => setDetailComment(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Revisit Toggle */}
          <div className="pt-2">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl cursor-pointer border border-slate-200 transition">
              <div className="flex items-center space-x-2.5">
                <ThumbsUp className={`w-4 h-4 ${revisit ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-800">
                  다시 방문할 의사가 있나요?
                </span>
              </div>
              <input
                type="checkbox"
                checked={revisit}
                onChange={(e) => setRevisit(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>노션에 평론 저장 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>평론 등록 완료</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}