"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Building2,
  User,
  Star,
  Plus,
  Sparkles,
  Utensils,
  MapPin,
  Flame,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { Restaurant, Review } from "@/types";

interface CalendarViewProps {
  restaurants: Restaurant[];
  onOpenDetail: (restaurant: Restaurant) => void;
  onOpenAddReview: (restaurantId?: string, visitDate?: string) => void;
  currentUser: string;
}

const AUTHOR_STYLES: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
  지훈: {
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-700 dark:text-blue-300",
    ring: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500 text-white",
  },
  준협: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-500 text-white",
  },
  윤섭: {
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-300",
    ring: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-500 text-white",
  },
  동찬: {
    bg: "bg-purple-50 dark:bg-purple-950/60",
    text: "text-purple-700 dark:text-purple-300",
    ring: "border-purple-200 dark:border-purple-800",
    badge: "bg-purple-500 text-white",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-slate-50 dark:bg-slate-800/60",
  text: "text-slate-700 dark:text-slate-300",
  ring: "border-slate-200 dark:border-slate-700",
  badge: "bg-slate-500 text-white",
};

const INTERN_FILTER_LIST = ["전체", "지훈", "준협", "윤섭", "동찬"];
const BUILDING_TABS = ["전체", "누리꿈", "사보이", "kgit", "기타"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarView({
  restaurants,
  onOpenDetail,
  onOpenAddReview,
  currentUser,
}: CalendarViewProps) {
  // Calendar state (current year and month)
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (0 = Jan, 7 = Aug)

  // Filters
  const [selectedIntern, setSelectedIntern] = useState("전체");
  const [selectedBuilding, setSelectedBuilding] = useState("전체");

  // Selected date for day drawer/details view (e.g. "2026-08-27")
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Build a flat list of all valid reviews with their restaurant reference
  const allReviewsWithRestaurant = useMemo(() => {
    const list: { review: Review; restaurant: Restaurant }[] = [];
    restaurants.forEach((rest) => {
      rest.reviews.forEach((rev) => {
        if (rev.visitDate) {
          list.push({ review: rev, restaurant: rest });
        }
      });
    });
    return list;
  }, [restaurants]);

  // Filter reviews based on user selection
  const filteredReviewsWithRestaurant = useMemo(() => {
    return allReviewsWithRestaurant.filter(({ review, restaurant }) => {
      // Filter by intern
      if (selectedIntern !== "전체" && review.author !== selectedIntern) {
        return false;
      }
      // Filter by building
      if (selectedBuilding !== "전체") {
        if (selectedBuilding === "기타") {
          if (["누리꿈", "사보이", "kgit"].includes(restaurant.building)) return false;
        } else if (restaurant.building !== selectedBuilding) {
          return false;
        }
      }
      return true;
    });
  }, [allReviewsWithRestaurant, selectedIntern, selectedBuilding]);

  // Group filtered reviews by date string "YYYY-MM-DD"
  const reviewsByDate = useMemo(() => {
    const map = new Map<string, { restaurant: Restaurant; reviews: Review[] }[]>();

    filteredReviewsWithRestaurant.forEach(({ review, restaurant }) => {
      if (!review.visitDate) return;
      const dateKey = review.visitDate;

      const dayEntries = map.get(dateKey) || [];
      let restEntry = dayEntries.find((e) => e.restaurant.id === restaurant.id);
      if (!restEntry) {
        restEntry = { restaurant, reviews: [] };
        dayEntries.push(restEntry);
      }
      restEntry.reviews.push(review);
      map.set(dateKey, dayEntries);
    });

    return map;
  }, [filteredReviewsWithRestaurant]);

  // Monthly summary stats for current month view
  const currentMonthStats = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const thisMonthReviews = filteredReviewsWithRestaurant.filter(
      ({ review }) => review.visitDate && review.visitDate.startsWith(prefix)
    );

    const totalVisits = thisMonthReviews.length;
    const uniqueDays = new Set(thisMonthReviews.map((r) => r.review.visitDate)).size;

    const validRatings = thisMonthReviews
      .map((r) => r.review.rating)
      .filter((r): r is number => typeof r === "number" && r > 0);

    const avgRating =
      validRatings.length > 0
        ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
        : "-";

    // Most visited restaurant in this month
    const restCounts: Record<string, { name: string; count: number }> = {};
    thisMonthReviews.forEach(({ restaurant }) => {
      if (!restCounts[restaurant.id]) {
        restCounts[restaurant.id] = { name: restaurant.name, count: 0 };
      }
      restCounts[restaurant.id].count += 1;
    });

    const topRest = Object.values(restCounts).sort((a, b) => b.count - a.count)[0];

    return {
      totalVisits,
      uniqueDays,
      avgRating,
      topRestName: topRest ? topRest.name : "-",
      topRestCount: topRest ? topRest.count : 0,
    };
  }, [filteredReviewsWithRestaurant, currentYear, currentMonth]);

  // Generate calendar grid cells (42 cells: 6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      dayOfWeek: number;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dObj = new Date(prevY, prevM, dayNum);

      cells.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        dayOfWeek: dObj.getDay(),
      });
    }

    // Days of current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dObj = new Date(currentYear, currentMonth, day);

      cells.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        dayOfWeek: dObj.getDay(),
      });
    }

    // Trailing days from next month to fill grid to full weeks (up to 35 or 42 cells)
    const totalRemaining = (7 - (cells.length % 7)) % 7;
    const targetLength = cells.length + totalRemaining <= 35 ? 35 : 42;
    const nextDaysNeeded = targetLength - cells.length;

    for (let day = 1; day <= nextDaysNeeded; day++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dObj = new Date(nextY, nextM, day);

      cells.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDateStr,
        dayOfWeek: dObj.getDay(),
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr, selectedDateStr]);

  // Data for the currently selected day
  const selectedDayEntries = useMemo(() => {
    return reviewsByDate.get(selectedDateStr) || [];
  }, [reviewsByDate, selectedDateStr]);

  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const dayName = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
        return `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일 (${dayName}요일)`;
      }
    } catch {
      // fallback
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Banner & Month Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentYear}년 {currentMonth + 1}월
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300">
                  Notion 달력 뷰
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                인턴들의 점심 방문 및 평론 기록을 날짜별로 확인하세요
              </p>
            </div>
          </div>

          {/* Month Buttons & Today */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition shadow-xs"
            >
              오늘
            </button>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
              <button
                onClick={handlePrevMonth}
                title="이전 달"
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                title="다음 달"
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Building Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              건물:
            </span>
            {BUILDING_TABS.map((bldg) => (
              <button
                key={bldg}
                onClick={() => setSelectedBuilding(bldg)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedBuilding === bldg
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {bldg}
              </button>
            ))}
          </div>

          {/* Intern Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">인턴 필터:</span>
            <select
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {INTERN_FILTER_LIST.map((name) => (
                <option key={name} value={name} className="dark:bg-slate-800">
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Monthly Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-base">
            📅
          </div>
          <div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">이번 달 방문일수</div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {currentMonthStats.uniqueDays}일
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
            🍽️
          </div>
          <div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">총 작성 평론</div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {currentMonthStats.totalVisits}개
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
            ⭐
          </div>
          <div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">월간 평균 별점</div>
            <div className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-300">
              {currentMonthStats.avgRating}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
            🏆
          </div>
          <div className="truncate">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">이달의 최다 방문</div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {currentMonthStats.topRestName}
              {currentMonthStats.topRestCount > 0 && (
                <span className="text-xs font-normal text-slate-400 ml-1">
                  ({currentMonthStats.topRestCount}회)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Calendar Grid Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-center py-2.5">
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              className={`text-xs font-bold ${
                idx === 0
                  ? "text-red-500 dark:text-red-400"
                  : idx === 6
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
          {calendarCells.map((cell) => {
            const dayEntries = reviewsByDate.get(cell.dateStr) || [];
            const hasReviews = dayEntries.length > 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[100px] sm:min-h-[125px] p-1.5 sm:p-2.5 transition-all flex flex-col justify-between cursor-pointer group relative ${
                  !cell.isCurrentMonth
                    ? "bg-slate-50/40 dark:bg-slate-950/20 text-slate-300 dark:text-slate-600"
                    : cell.isSelected
                    ? "bg-orange-50/40 dark:bg-orange-950/20 ring-2 ring-orange-500 ring-inset z-10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* Cell Header: Date Number & Add Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span
                      className={`text-xs sm:text-sm font-black w-6 h-6 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? "bg-orange-500 text-white shadow-xs"
                          : cell.dayOfWeek === 0 && cell.isCurrentMonth
                          ? "text-red-500 dark:text-red-400"
                          : cell.dayOfWeek === 6 && cell.isCurrentMonth
                          ? "text-blue-500 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.isToday && (
                      <span className="hidden sm:inline-block text-[10px] font-bold text-orange-600 dark:text-orange-400">
                        오늘
                      </span>
                    )}
                  </div>

                  {/* Add Review on this date button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddReview(undefined, cell.dateStr);
                    }}
                    title={`${cell.dateStr} 평론 작성`}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Content: Restaurant & Review Chips */}
                <div className="space-y-1.5 mt-1 flex-1">
                  {dayEntries.slice(0, 3).map((entry) => {
                    const avgScore =
                      entry.reviews.length > 0
                        ? (
                            entry.reviews
                              .map((r) => r.rating || 0)
                              .reduce((a, b) => a + b, 0) / entry.reviews.length
                          ).toFixed(1)
                        : null;

                    return (
                      <div
                        key={entry.restaurant.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(cell.dateStr);
                          onOpenDetail(entry.restaurant);
                        }}
                        className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-sm hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left group/chip"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {entry.restaurant.name}
                          </span>
                          {avgScore && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center shrink-0">
                              ⭐ {avgScore}
                            </span>
                          )}
                        </div>

                        {/* Author Avatars / Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {entry.reviews.map((rev) => {
                            const style = AUTHOR_STYLES[rev.author] || DEFAULT_STYLE;
                            return (
                              <span
                                key={rev.id}
                                title={`${rev.author}: ⭐ ${rev.rating || "-"} ${
                                  rev.shortComment ? `("${rev.shortComment}")` : ""
                                }`}
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${style.bg} ${style.text} border ${style.ring}`}
                              >
                                {rev.author}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* If more than 3 restaurants on this day */}
                  {dayEntries.length > 3 && (
                    <div className="text-[10px] text-slate-400 font-bold text-center">
                      +{dayEntries.length - 3}개 더보기
                    </div>
                  )}
                </div>

                {/* Bottom indicator dot for mobile / small screen quick glance */}
                {hasReviews && (
                  <div className="flex sm:hidden justify-center items-center gap-1 mt-1">
                    {dayEntries.map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-orange-500"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Day Detailed Review Drawer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {formattedSelectedDate} 방문 기록
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {selectedDayEntries.length}개 식당 방문
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              선택한 날짜에 작성된 인턴 평론과 상세 후기를 확인합니다.
            </p>
          </div>

          <button
            onClick={() => onOpenAddReview(undefined, selectedDateStr)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>이 날짜에 평론 추가</span>
          </button>
        </div>

        {selectedDayEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Utensils className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium">이 날짜에 등록된 점심 평론이 없습니다.</p>
            <button
              onClick={() => onOpenAddReview(undefined, selectedDateStr)}
              className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline"
            >
              + 첫 번째 평론을 작성해보세요!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDayEntries.map(({ restaurant, reviews }) => (
              <div
                key={restaurant.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
              >
                {/* Restaurant Card Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-2">
                      📍 {restaurant.building}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {restaurant.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenDetail(restaurant)}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs transition flex items-center space-x-1"
                  >
                    <span>식당 정보</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Reviews on this date */}
                <div className="space-y-2.5 pt-1">
                  {reviews.map((rev) => {
                    const style = AUTHOR_STYLES[rev.author] || DEFAULT_STYLE;
                    return (
                      <div
                        key={rev.id}
                        className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${style.bg} ${style.text} border ${style.ring}`}
                            >
                              {rev.author}
                            </span>
                            {rev.rating !== null && (
                              <span className="font-black text-amber-700 dark:text-amber-300 flex items-center space-x-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>{rev.rating}</span>
                              </span>
                            )}
                          </div>

                          {rev.revisit && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-0.5">
                              <ThumbsUp className="w-3 h-3" />
                              <span>재방문 희망</span>
                            </span>
                          )}
                        </div>

                        {(rev.menu || rev.recommendedMenu) && (
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            🍲 주문 메뉴: <span className="font-bold text-slate-900 dark:text-white">{rev.menu || rev.recommendedMenu}</span>
                          </div>
                        )}

                        {rev.shortComment && (
                          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium italic bg-slate-100/80 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/70">
                            &ldquo;{rev.shortComment}&rdquo;
                          </p>
                        )}

                        {rev.detailComment && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
                            {rev.detailComment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
