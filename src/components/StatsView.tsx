"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Star, Award, TrendingUp, ThumbsUp, MessageSquare, Flame, User, MapPin, Loader2 } from "lucide-react";
import { Stats, Restaurant, Review } from "@/types";

interface StatsViewProps {
  onOpenDetail: (restaurant: Restaurant) => void;
  onOpenAddReview: (restaurantId: string) => void;
}

export default function StatsView({ onOpenDetail, onOpenAddReview }: StatsViewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "통계 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">인턴 맛집 통계를 집계하는 중...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-12 text-center text-red-500 dark:text-red-400">
        {error || "데이터가 없습니다."}
      </div>
    );
  }

  const top1 = stats.topRestaurants[0];
  const top2 = stats.topRestaurants[1];
  const top3 = stats.topRestaurants[2];

  // Find top reviewer
  const topReviewer = Object.entries(stats.authorReviewCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. Quick Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xl">
            🍽️
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">등록된 음식점</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalRestaurants}개</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
            ✍️
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">누적 작성 평론</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalReviews}개</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            👑
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">리뷰왕 인턴</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {topReviewer ? `${topReviewer[0]} (${topReviewer[1]}개)` : "-"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
            ⭐
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">최고 평균 평점</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {top1 ? `${top1.avgRating.toFixed(1)}점` : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Podium (Top 3 Best Restaurants) */}
      {top1 && (
        <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white dark:from-orange-950/30 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-orange-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-center mb-8">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>TTA 인턴 명예의 전당</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              가장 높은 평점을 받은 상암 맛집 TOP 3
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
            {/* 2nd Place */}
            {top2 && (
              <div
                onClick={() => onOpenDetail(top2)}
                className="order-2 md:order-1 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    🥈 2위
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{top2.building}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{top2.name}</h4>
                <div className="flex items-center space-x-1.5 mt-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="font-black text-base text-amber-700 dark:text-amber-300">{top2.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">({top2.reviewCount}개 평론)</span>
                </div>
              </div>
            )}

            {/* 1st Place (Winner) */}
            <div
              onClick={() => onOpenDetail(top1)}
              className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl border-2 border-amber-400 dark:border-amber-500 shadow-xl relative -mt-4 hover:shadow-2xl transition cursor-pointer"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-xs font-black shadow">
                👑 1위 BEST
              </div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-400 text-amber-950">
                  🥇 1위
                </span>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">{top1.building}</span>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl line-clamp-1">{top1.name}</h3>
              <div className="flex items-center space-x-1.5 mt-3 bg-amber-100/70 dark:bg-amber-950/60 p-2 rounded-xl">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span className="font-black text-xl text-amber-900 dark:text-amber-200">{top1.avgRating.toFixed(1)}</span>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">/ 5.0 (평론 {top1.reviewCount}개)</span>
              </div>
              {(top1.menus?.[0] || top1.recommendedMenus?.[0]) && (
                <div className="mt-3 text-xs text-amber-900 dark:text-amber-300 font-medium">
                  주요 주문 메뉴: <span className="font-bold">{top1.menus?.[0] || top1.recommendedMenus?.[0]}</span>
                </div>
              )}
            </div>

            {/* 3rd Place */}
            {top3 && (
              <div
                onClick={() => onOpenDetail(top3)}
                className="order-3 bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    🥉 3위
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{top3.building}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{top3.name}</h4>
                <div className="flex items-center space-x-1.5 mt-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="font-black text-base text-amber-700 dark:text-amber-300">{top3.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">({top3.reviewCount}개 평론)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Revisit 100% Restaurants & Recent Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revisit 100% */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <ThumbsUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>&ldquo;여긴 또 간다!&rdquo; 재방문 희망 맛집</span>
          </h3>

          <div className="space-y-3">
            {stats.revisitTopRestaurants.slice(0, 5).map((rest) => (
              <div
                key={rest.id}
                onClick={() => onOpenDetail(rest)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-black text-xs flex items-center justify-center">
                    {rest.revisitRate}%
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{rest.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {rest.building} • 평점 ⭐ {rest.avgRating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <button className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 bg-white dark:bg-slate-700 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  보기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Reviews Feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span>실시간 최근 한줄평 피드</span>
          </h3>

          <div className="space-y-3">
            {stats.recentReviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span className="text-orange-600 dark:text-orange-400 font-extrabold">{review.restaurantName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300">{review.author}</span>
                  </div>
                  {review.rating !== null && (
                    <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center">
                      ⭐ {review.rating}
                    </span>
                  )}
                </div>
                {review.shortComment && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    &ldquo;{review.shortComment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}