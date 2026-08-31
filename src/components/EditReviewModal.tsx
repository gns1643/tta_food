"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Star, Calendar, Utensils, ThumbsUp, Sparkles, Loader2, Edit3 } from "lucide-react";
import MenuCombobox from "./MenuCombobox";
import { Review, Restaurant } from "@/types";

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  restaurantName?: string;
  restaurants?: Restaurant[];
  onSuccess: (updatedReview: Review) => void;
}

const DEFAULT_AUTHORS = ["지훈", "준협", "윤섭", "동찬"];
const RATING_PRESETS = [1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0];

export default function EditReviewModal({
  isOpen,
  onClose,
  review,
  restaurantName,
  restaurants = [],
  onSuccess,
}: EditReviewModalProps) {
  const [author, setAuthor] = useState("지훈");
  const [visitDate, setVisitDate] = useState("");
  const [rating, setRating] = useState<number>(4.0);
  const [shortComment, setShortComment] = useState("");
  const [menu, setMenu] = useState("");
  const [detailComment, setDetailComment] = useState("");
  const [revisit, setRevisit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const targetRestaurant = useMemo(() => {
    if (!review) return null;
    return (
      restaurants.find((r) => r.id === review.restaurantId) ||
      restaurants.find((r) => r.name === restaurantName) ||
      null
    );
  }, [restaurants, review, restaurantName]);

  const availableMenus = useMemo(() => {
    if (!targetRestaurant) return [];
    const set = new Set<string>();
    if (Array.isArray(targetRestaurant.menus)) {
      targetRestaurant.menus.forEach((m) => {
        if (m && m.trim()) set.add(m.trim());
      });
    }
    if (Array.isArray(targetRestaurant.recommendedMenus)) {
      targetRestaurant.recommendedMenus.forEach((m) => {
        if (m && m.trim()) set.add(m.trim());
      });
    }
    if (Array.isArray(targetRestaurant.reviews)) {
      targetRestaurant.reviews.forEach((r) => {
        const m = r.menu || r.recommendedMenu;
        if (m && m.trim()) set.add(m.trim());
      });
    }
    return Array.from(set);
  }, [targetRestaurant]);

  useEffect(() => {
    if (review) {
      setAuthor(review.author || "지훈");
      setVisitDate(review.visitDate || new Date().toISOString().split("T")[0]);
      setRating(review.rating ?? 4.0);
      setShortComment(review.shortComment || "");
      setMenu(review.menu || review.recommendedMenu || "");
      setDetailComment(review.detailComment || "");
      setRevisit(Boolean(review.revisit));
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const handleRatingInput = (val: number) => {
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(5.0, Number(val.toFixed(1))));
    setRating(clamped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          restaurantId: review.restaurantId,
          author,
          visitDate,
          rating,
          shortComment: shortComment.trim(),
          detailComment: detailComment.trim(),
          menu: menu.trim(),
          revisit,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "평론 수정에 실패했습니다.");
      }

      onSuccess({
        ...review,
        author,
        visitDate,
        rating,
        shortComment: shortComment.trim(),
        detailComment: detailComment.trim(),
        menu: menu.trim(),
        recommendedMenu: menu.trim(),
        revisit,
      });
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black">평론 수정하기</h2>
          <p className="text-xs text-blue-100 mt-1">
            {restaurantName || review.restaurantName || "음식점"} • {review.author}님의 평론 수정
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Author Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              작성자
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_AUTHORS.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setAuthor(name)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                    author === name
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              방문일
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Interactive Rating Section */}
          <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>별점 (최대 5.0점)</span>
              </label>

              <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-700 shadow-sm">
                <input
                  type="number"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={rating}
                  onChange={(e) => handleRatingInput(parseFloat(e.target.value))}
                  className="w-12 text-base font-black text-amber-900 dark:text-amber-300 text-center focus:outline-none bg-transparent"
                />
                <span className="text-xs font-bold text-amber-500 dark:text-amber-400">/ 5.0</span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={rating}
                onChange={(e) => handleRatingInput(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-amber-200 dark:bg-amber-900/60 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-amber-700/70 dark:text-amber-400/70 font-semibold px-0.5">
                <span>0.0</span>
                <span>1.0</span>
                <span>2.0</span>
                <span>3.0</span>
                <span>4.0</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mr-1">빠른 선택:</span>
              {RATING_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setRating(p)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                    rating === p
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {p.toFixed(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Short Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              한줄평 <span className="text-slate-400 dark:text-slate-500 font-normal">(핵심 요약)</span>
            </label>
            <input
              type="text"
              placeholder="예: 국물이 깊고 진함, 점심 회식으로 최고"
              value={shortComment}
              onChange={(e) => setShortComment(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ordered Menu (Combobox with previous menus) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              주문 메뉴 <span className="text-slate-400 dark:text-slate-500 font-normal">(이전 주문 메뉴 선택 또는 직접 입력)</span>
            </label>
            <MenuCombobox
              value={menu}
              onChange={setMenu}
              availableMenus={availableMenus}
              placeholder="예: 얼큰 순대국, 안심 돈가스, 삼겹살..."
              accentColor="blue"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              상세 평론
            </label>
            <textarea
              rows={2}
              placeholder="맛, 분위기, 웨이팅 시간, 양 등 상세한 후기를 자유롭게 적어주세요."
              value={detailComment}
              onChange={(e) => setDetailComment(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Revisit Toggle */}
          <div className="pt-2">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-700 transition">
              <div className="flex items-center space-x-2.5">
                <ThumbsUp className={`w-4 h-4 ${revisit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  다시 방문할 의사가 있나요?
                </span>
              </div>
              <input
                type="checkbox"
                checked={revisit}
                onChange={(e) => setRevisit(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-2">
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
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>수정 사항 저장 중...</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>평론 수정 완료</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}