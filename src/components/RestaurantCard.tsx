"use client";

import React from "react";
import { Star, Building2, ThumbsUp, PlusCircle, ExternalLink } from "lucide-react";
import { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onOpenDetail: (restaurant: Restaurant) => void;
  onOpenAddReview: (restaurantId: string) => void;
}

const AUTHOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  지훈: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  준협: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  윤섭: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  동찬: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const DEFAULT_AUTHORS = ["지훈", "준협", "윤섭", "동찬"];

export default function RestaurantCard({
  restaurant,
  onOpenDetail,
  onOpenAddReview,
}: RestaurantCardProps) {
  const getBuildingBadgeStyle = (bldg: string) => {
    switch (bldg) {
      case "누리꿈":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "사보이":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "kgit":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
      {/* Card Header & Main Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Building Badge & Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBuildingBadgeStyle(
                restaurant.building
              )}`}
            >
              <Building2 className="w-3 h-3" />
              <span>{restaurant.building || "기타"}</span>
            </span>

            {restaurant.categories && restaurant.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Revisit Rate Badge */}
          {restaurant.reviewCount > 0 && (
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                restaurant.revisitRate >= 70
                  ? "bg-green-50 text-green-700 font-bold"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>재방문 {restaurant.revisitRate}%</span>
            </span>
          )}
        </div>

        {/* Restaurant Name */}
        <div className="flex items-center justify-between mt-1">
          <h3
            onClick={() => onOpenDetail(restaurant)}
            className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-1"
          >
            {restaurant.name}
          </h3>
          {restaurant.url && (
            <a
              href={restaurant.url}
              target="_blank"
              rel="noopener noreferrer"
              title="노션에서 열기"
              className="text-slate-400 hover:text-orange-500 transition-colors p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Overall Star Rating & Review Count */}
        <div className="flex items-center space-x-2 mt-2">
          {restaurant.reviewCount > 0 ? (
            <>
              <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400 mr-1" />
                <span className="text-sm font-black text-amber-700">
                  {restaurant.avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-amber-500 ml-0.5">/ 5.0</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                평론 {restaurant.reviewCount}개
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
              아직 평론 없음
            </span>
          )}
        </div>

        {/* Recommended Menu Tags */}
        {restaurant.recommendedMenus.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {restaurant.recommendedMenus.slice(0, 3).map((menu, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs bg-orange-50/80 text-orange-700 px-2 py-0.5 rounded-md font-medium border border-orange-100"
              >
                🍽️ {menu}
              </span>
            ))}
          </div>
        )}

        {/* Intern Individual Rating Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
            <span>인턴별 평점</span>
            <span className="text-[11px] text-slate-400">클릭 시 상세</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DEFAULT_AUTHORS.map((author) => {
              const score = restaurant.authorScores[author];
              const comment = restaurant.authorComments[author];
              const authorStyle =
                AUTHOR_COLORS[author] || {
                  bg: "bg-slate-50",
                  text: "text-slate-700",
                  border: "border-slate-200",
                };

              return (
                <div
                  key={author}
                  title={comment ? `${author}: "${comment}"` : `${author}: 평점 없음`}
                  className={`px-2 py-1 rounded-lg border text-xs flex items-center justify-between ${
                    score !== undefined && score !== null
                      ? `${authorStyle.bg} ${authorStyle.text} ${authorStyle.border} font-medium`
                      : "bg-slate-50/60 text-slate-400 border-slate-100"
                  }`}
                >
                  <span className="font-semibold truncate">{author}</span>
                  {score !== undefined && score !== null ? (
                    <span className="font-bold flex items-center ml-1">
                      <Star className="w-3 h-3 fill-current inline mr-0.5" />
                      {score}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Any other interns review if available */}
          {Object.keys(restaurant.authorScores).filter(
            (a) => !DEFAULT_AUTHORS.includes(a)
          ).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.keys(restaurant.authorScores)
                .filter((a) => !DEFAULT_AUTHORS.includes(a))
                .map((a) => (
                  <span
                    key={a}
                    className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                  >
                    {a}: ⭐ {restaurant.authorScores[a]}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetail(restaurant)}
          className="flex-1 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition text-center"
        >
          평론 보기 ({restaurant.reviewCount})
        </button>
        <button
          onClick={() => onOpenAddReview(restaurant.id)}
          className="flex-1 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition shadow-sm shadow-orange-500/20 text-center flex items-center justify-center space-x-1"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>평론 작성</span>
        </button>
      </div>
    </div>
  );
}