"use client";

import React, { useState } from "react";
import { UtensilsCrossed, Calendar, Trophy, ScrollText, Plus, PenSquare, RefreshCw, User, Sun, Moon, Lightbulb, Compass } from "lucide-react";

interface NavbarProps {
  activeTab: "list" | "calendar" | "stats" | "patchnotes";
  setActiveTab: (tab: "list" | "calendar" | "stats" | "patchnotes") => void;
  onOpenAddRestaurant: () => void;
  onOpenAddReview: (restaurantId?: string) => void;
  onOpenSuggestion: () => void;
  onOpenLunchRoulette: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  currentUser: string;
  setCurrentUser: (name: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const DEFAULT_INTERNS = ["지훈", "준협", "윤섭", "동찬"];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddRestaurant,
  onOpenAddReview,
  onOpenSuggestion,
  onOpenLunchRoulette,
  onRefresh,
  isRefreshing,
  currentUser,
  setCurrentUser,
  isDark,
  toggleDarkMode,
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [customNameInput, setCustomNameInput] = useState("");

  const handleSelectUser = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem("tta_intern_food_user", name);
    setIsUserMenuOpen(false);
  };

  const handleAddCustomUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNameInput.trim()) {
      handleSelectUser(customNameInput.trim());
      setCustomNameInput("");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab("list")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="whitespace-nowrap shrink-0">
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
                TTA 인턴 맛집 평론
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 whitespace-nowrap">
                Notion 연동
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop: visible on large screens) */}
          <div className="hidden xl:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === "list"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">음식점 목록</span>
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">달력 뷰</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === "stats"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">랭킹 & 통계</span>
            </button>
            <button
              onClick={() => setActiveTab("patchnotes")}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === "patchnotes"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ScrollText className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">패치노트</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="노션 데이터 새로고침"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
            </button>

            {/* Current User Profile Pill */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="whitespace-nowrap">{currentUser || "작성자 선택"}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    내 프로필 선택
                  </div>
                  {DEFAULT_INTERNS.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelectUser(name)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-orange-50 dark:hover:bg-slate-700/60 transition flex items-center justify-between whitespace-nowrap ${
                        currentUser === name
                          ? "text-orange-600 dark:text-orange-400 font-bold bg-orange-50/50 dark:bg-slate-700"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="whitespace-nowrap">{name}</span>
                      {currentUser === name && <span className="text-xs text-orange-600 dark:text-orange-400 whitespace-nowrap">선택됨</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  <form onSubmit={handleAddCustomUser} className="px-3 py-1">
                    <input
                      type="text"
                      placeholder="새 이름 입력..."
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded focus:outline-none focus:border-orange-500"
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Lunch Roulette (점메추) Button */}
            <button
              onClick={onOpenLunchRoulette}
              title="점심 메뉴 추천! 미식 룰렛 돌리기"
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm shadow-orange-500/25 transition transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-amber-200 animate-spin shrink-0" style={{ animationDuration: "10s" }} />
              <span className="whitespace-nowrap">점메추 룰렛</span>
            </button>

            {/* Suggestion / Idea Button */}
            <button
              onClick={onOpenSuggestion}
              title="인턴 아이디어 & 기능 제안하기"
              className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-2xs transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">제안하기</span>
              <span className="sm:hidden whitespace-nowrap">제안</span>
            </button>

            {/* Add Restaurant Button (Secondary CTA) */}
            <button
              onClick={onOpenAddRestaurant}
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">식당 등록</span>
            </button>

            {/* Add Review Button (Primary CTA) */}
            <button
              onClick={() => onOpenAddReview()}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm shadow-orange-500/30 transition transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">평론 작성</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Sub-bar */}
        <div className="flex xl:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === "list"
                ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">음식점 목록</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === "calendar"
                ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">달력 뷰</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === "stats"
                ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">랭킹 & 통계</span>
          </button>
          <button
            onClick={() => setActiveTab("patchnotes")}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === "patchnotes"
                ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">패치노트</span>
          </button>
        </div>
      </div>
    </header>
  );
}