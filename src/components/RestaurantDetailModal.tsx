"use client";

import React from "react";
import { X, Star, Building2, Calendar, ThumbsUp, ThumbsDown, PenSquare, ExternalLink, Utensils, Edit3 } from "lucide-react";
import { Restaurant, Review } from "@/types";

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onOpenAddReview: (restaurantId: string) => void;
  onOpenEditReview: (review: Review, restaurantName: string) => void;
}

const AUTHOR_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  지훈: { bg: "bg-blue-500", text: "text-blue-700", ring: "ring-blue-200 dark:ring-blue-900" },
  준협: { bg: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200 dark:ring-emerald-900" },
  윤섭: { bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200 dark:ring-amber-900" },
  동찬: { bg: "bg-purple-500", text: "text-purple-700", ring: "ring-purple-200 dark:ring-purple-900" },
};

export default function RestaurantDetailModal({
  restaurant,
  onClose,
  onOpenAddReview,
  onOpenEditReview,
}: RestaurantDetailModalProps) {
  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border-b border-slate-100 dark:border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Building2 className="w-3 h-3" />
              <span>{restaurant.building || "기타"}</span>
            </span>

            {restaurant.categories && restaurant.categories.map((c) => (
              <span key={c} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {c}
              </span>
            ))}

            {restaurant.priceRange && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                💰 {restaurant.priceRange}
              </span>
            )}

            {restaurant.url && (
              <a
                href={restaurant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700"
              >
                <span>노션 페이지 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{restaurant.name}</h2>

          {/* Quick Summary Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-lg font-black text-amber-800 dark:text-amber-300">
                {restaurant.avgRating > 0 ? restaurant.avgRating.toFixed(1) : "-"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">/ 5.0</span>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="text-slate-600 dark:text-slate-300">
              총 평론 <strong className="text-slate-900 dark:text-white">{restaurant.reviewCount}</strong>개
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
              <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                재방문 희망{" "}
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{restaurant.revisitRate}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body - Reviews List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <span>인턴들의 생생한 평론</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 rounded-full">
                {restaurant.reviews.length}개
              </span>
            </h3>

            <button
              onClick={() => {
                onClose();
                onOpenAddReview(restaurant.id);
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60 px-3 py-1.5 rounded-xl transition"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>평론 작성하기</span>
            </button>
          </div>

          {restaurant.reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Utensils className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">아직 등록된 평론이 없습니다.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">첫 번째 평론을 작성해 보세요!</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddReview(restaurant.id);
                }}
                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                첫 평론 작성하기
              </button>
            </div>
          ) : (
            restaurant.reviews.map((review) => {
              const authorColor = AUTHOR_COLORS[review.author] || {
                bg: "bg-slate-600",
                text: "text-slate-800",
                ring: "ring-slate-200 dark:ring-slate-700",
              };

              return (
                <div
                  key={review.id}
                  className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-orange-200 dark:hover:border-orange-900 transition relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Author Avatar & Name */}
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-full ${authorColor.bg} text-white font-bold flex items-center justify-center text-sm shadow-sm ring-4 ${authorColor.ring}`}
                      >
                        {review.author.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                          <span>{review.author}</span>
                          {review.visitDate && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{review.visitDate}</span>
                            </span>
                          )}
                        </div>
                        {review.rating !== null && (
                          <div className="flex items-center space-x-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  (review.rating || 0) >= star
                                    ? "text-amber-400 fill-amber-400"
                                    : (review.rating || 0) >= star - 0.5
                                    ? "text-amber-400 fill-amber-400 opacity-60"
                                    : "text-slate-200 dark:text-slate-700"
                                }`}
                              />
                            ))}
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 ml-1">
                              {review.rating}점
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Revisit Tag & Edit Button */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          review.revisit
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {review.revisit ? (
                          <>
                            <ThumbsUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden sm:inline">재방문 의사 있음</span>
                            <span className="sm:hidden">재방문</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-3 h-3 text-slate-400" />
                            <span className="hidden sm:inline">재방문 미정</span>
                            <span className="sm:hidden">미정</span>
                          </>
                        )}
                      </span>

                      {/* Edit Review Button */}
                      <button
                        onClick={() => onOpenEditReview(review, restaurant.name)}
                        title="평론 수정하기"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-600 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>수정</span>
                      </button>
                    </div>
                  </div>

                  {/* One Line Comment */}
                  {review.shortComment && (
                    <div className="mt-3 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-l-4 border-amber-400 px-3.5 py-2 rounded-r-xl text-sm font-medium">
                      &ldquo;{review.shortComment}&rdquo;
                    </div>
                  )}

                  {/* Ordered Menu */}
                  {(review.menu || review.recommendedMenu) && (
                    <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                      <span className="font-bold text-orange-600 dark:text-orange-400">주문 메뉴:</span>
                      <span className="bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-medium">
                        {review.menu || review.recommendedMenu}
                      </span>
                    </div>
                  )}

                  {/* Detailed Comment */}
                  {review.detailComment && (
                    <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl">
                      {review.detailComment}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenAddReview(restaurant.id);
            }}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl transition shadow-md shadow-orange-500/20 flex items-center space-x-1.5"
          >
            <PenSquare className="w-4 h-4" />
            <span>이 식당 평론 작성</span>
          </button>
        </div>
      </div>
    </div>
  );
}