"use client";

import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Trophy, Plus, PenSquare, RefreshCw, User, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "list" | "stats";
  setActiveTab: (tab: "list" | "stats") => void;
  onOpenAddRestaurant: () => void;
  onOpenAddReview: (restaurantId?: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  currentUser: string;
  setCurrentUser: (name: string) => void;
}

const DEFAULT_INTERNS = ["지훈", "준협", "윤섭", "동찬"];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddRestaurant,
  onOpenAddReview,
  onRefresh,
  isRefreshing,
  currentUser,
  setCurrentUser,
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("list")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                TTA 인턴 맛집 평론
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                Notion 연동
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "list"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>음식점 목록</span>
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "stats"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>랭킹 & 통계</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="노션 데이터 새로고침"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
            </button>

            {/* Current User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>{currentUser || "작성자 선택"}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    내 프로필 선택
                  </div>
                  {DEFAULT_INTERNS.map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelectUser(name)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-orange-50 transition flex items-center justify-between ${
                        currentUser === name ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-700"
                      }`}
                    >
                      <span>{name}</span>
                      {currentUser === name && <span className="text-xs text-orange-600">선택됨</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  <form onSubmit={handleAddCustomUser} className="px-3 py-1">
                    <input
                      type="text"
                      placeholder="새 이름 입력..."
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-orange-500"
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Add Restaurant Button */}
            <button
              onClick={onOpenAddRestaurant}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>식당 등록</span>
            </button>

            {/* Add Review Button (Primary CTA) */}
            <button
              onClick={() => onOpenAddReview()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm shadow-orange-500/30 transition transform active:scale-95"
            >
              <PenSquare className="w-4 h-4" />
              <span>평론 작성</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === "list" ? "text-orange-600 bg-orange-50 font-bold" : "text-slate-600"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>음식점 목록</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === "stats" ? "text-orange-600 bg-orange-50 font-bold" : "text-slate-600"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>랭킹 & 통계</span>
          </button>
          <button
            onClick={onOpenAddRestaurant}
            className="flex items-center space-x-1.5 text-xs font-medium py-1 px-3 rounded-lg text-slate-600"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>식당 등록</span>
          </button>
        </div>
      </div>
    </header>
  );
}