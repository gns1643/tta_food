"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Flame,
  User,
  Building2,
  Utensils,
  Loader2,
  Sparkles,
  Swords,
  Heart,
  Clock,
  Zap,
  Scale,
  Crown,
  ChevronRight,
} from "lucide-react";
import { Stats, Restaurant, Review } from "@/types";

interface StatsViewProps {
  onOpenDetail: (restaurant: Restaurant) => void;
  onOpenAddReview: (restaurantId: string) => void;
}

const AUTHOR_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  지훈: { bg: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-400" },
  준협: { bg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-400" },
  윤섭: { bg: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-400" },
  동찬: { bg: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300", text: "text-purple-700 dark:text-purple-300", ring: "ring-purple-400" },
};

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

  const topReviewer = Object.entries(stats.authorReviewCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
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

      {/* ========================================================================= */}
      {/* 3. NEW: 인턴 미식 캐릭터 & 성향 랭킹 (산타 vs 램지 & 인턴별 1픽) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">인턴 미식 캐릭터 & 성향 분석</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">인턴별 평가 스타일과 가장 사랑한 원픽 맛집</p>
            </div>
          </div>
        </div>

        {/* Santa vs Ramsay Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Most Generous */}
          {stats.mostGenerousAuthor && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-sm">
                  🎅
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400">자비의 미식 산타</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {stats.mostGenerousAuthor.name} 인턴
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    평균 별점: <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.mostGenerousAuthor.avgRating}점</span> (가장 후한 평가!)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strictest */}
          {stats.strictestAuthor && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent dark:from-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-sm">
                  🔪
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400">냉혹한 고든 램지</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {stats.strictestAuthor.name} 인턴
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    평균 별점: <span className="font-bold text-rose-600 dark:text-rose-400">{stats.strictestAuthor.avgRating}점</span> (가장 깐깐한 입맛!)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Intern Scorecards Grid */}
        {stats.authorDetails && stats.authorDetails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.authorDetails.map((author) => (
              <div
                key={author.name}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                      AUTHOR_COLORS[author.name]?.bg || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {author.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    리뷰 {author.reviewCount}개
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">평균 평점</span>
                  <span className="font-black text-amber-500 flex items-center">
                    ⭐ {author.avgRating}점
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">재방문 희망률</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {author.revisitRate}%
                  </span>
                </div>

                {author.favoriteRestaurant && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 mb-0.5">❤️ 영혼의 원픽 맛집</div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">
                      {author.favoriteRestaurant.name}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. NEW: 인턴 취향 대격돌 (호불호 존) & 전원 만장일치 맛집 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controversial Restaurants */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400">
              <Swords className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">취향 대격돌! 호불호 맛집</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">인턴 간 별점 편차가 가장 큰 격돌 식당</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.controversialRestaurants && stats.controversialRestaurants.length > 0 ? (
              stats.controversialRestaurants.map((item) => (
                <div
                  key={item.restaurant.id}
                  onClick={() => onOpenDetail(item.restaurant)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50/40 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{item.restaurant.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                      점수차 {item.maxDiff}점!
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-medium">최고평:</span>
                      <span className="font-bold text-emerald-600">{item.highest.author} ({item.highest.rating}점)</span>
                    </div>
                    <span className="text-slate-300">vs</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-medium">최저평:</span>
                      <span className="font-bold text-rose-600">{item.lowest.author} ({item.lowest.rating}점)</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">아직 평가 편차가 큰 식당이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Unanimous Praise Restaurants */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <Crown className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">만장일치 극찬 갓-맛집</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">다녀간 인턴 전원이 4.2점 이상 & 재방문 100%</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.unanimousRestaurants && stats.unanimousRestaurants.length > 0 ? (
              stats.unanimousRestaurants.map((rest) => (
                <div
                  key={rest.id}
                  onClick={() => onOpenDetail(rest)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/40 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-black text-sm flex items-center justify-center">
                      ⭐
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{rest.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {rest.building} • 평점 ⭐ {rest.avgRating.toFixed(1)} ({rest.reviewCount}명 전원 찬사)
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    재방문 100%
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">아직 복수 리뷰 기준 만장일치 맛집이 집계 중입니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. NEW: 상암 빌딩 미식 대전 (누리꿈 vs 사보이 vs KGIT vs 기타) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">상암 빌딩 미식 대전</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">어느 건물이 가장 평균 평점이 높고 맛집이 많을까?</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.buildingStats?.map((b, idx) => (
            <div
              key={b.building}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400">{idx + 1}위</span>
                  <span>{b.building}</span>
                </span>
                <span className="text-xs font-extrabold text-amber-500 flex items-center">
                  ⭐ {b.avgRating}점
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>등록 식당: {b.restaurantCount}곳</span>
                <span>총 평론: {b.reviewCount}개</span>
              </div>

              {b.topRestaurant && (
                <div
                  onClick={() => onOpenDetail(b.topRestaurant!)}
                  className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs cursor-pointer group"
                >
                  <span className="text-[10px] text-slate-400 block mb-0.5">건물 대표 1등 맛집:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline line-clamp-1">
                    🏆 {b.topRestaurant.name} ({b.topRestaurant.avgRating.toFixed(1)}점)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 6. 카테고리별 제왕 & 발길이 뜸해진 맛집 (구제 프로젝트) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Champions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">카테고리별 제왕 (장르 1등)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">음식 종류별 최고 평점 챔피언 식당</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {stats.categoryChampions?.map((champ) => (
              <div
                key={champ.category}
                onClick={() => onOpenDetail(champ.restaurant)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/40 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {champ.category}
                  </span>
                  <span className="text-xs font-bold text-amber-500">⭐ {champ.restaurant.avgRating.toFixed(1)}</span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {champ.restaurant.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dormant / Long time no visit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">인턴 발길이 뜸해진 맛집 🆘</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">마지막 방문일이 가장 오래되어 재방문이 시급한 곳!</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {stats.dormantRestaurants && stats.dormantRestaurants.length > 0 ? (
              stats.dormantRestaurants.map((rest) => {
                const latestDate = rest.reviews
                  .map((r) => r.visitDate)
                  .filter(Boolean)
                  .sort()
                  .reverse()[0] || "기록 없음";

                return (
                  <div
                    key={rest.id}
                    onClick={() => onOpenDetail(rest)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition cursor-pointer text-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{rest.name}</div>
                      <div className="text-slate-400">{rest.building} • 마지막 방문: {latestDate}</div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer">
                      재방문하기
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">최근 방문 데이터가 정상입니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. Revisit 100% Restaurants & Recent Reviews Grid */}
      {/* ========================================================================= */}
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
                <button className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 bg-white dark:bg-slate-700 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer">
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