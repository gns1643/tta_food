"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Building2, Star, Filter, ArrowUpDown, Plus, PenSquare, UtensilsCrossed, RefreshCw, Loader2, Sparkles, User, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import RestaurantCard from "@/components/RestaurantCard";
import RestaurantDetailModal from "@/components/RestaurantDetailModal";
import AddRestaurantModal from "@/components/AddRestaurantModal";
import AddReviewModal from "@/components/AddReviewModal";
import StatsView from "@/components/StatsView";
import { Restaurant, Review } from "@/types";

const BUILDING_TABS = ["전체", "누리꿈", "사보이", "kgit", "기타"];
const CATEGORY_FILTER_LIST = ["전체", "한식", "일식", "중식", "양식", "분식", "카페", "아시안"];
const INTERN_FILTER_LIST = ["전체", "지훈", "준협", "윤섭", "동찬"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedInternFilter, setSelectedInternFilter] = useState("전체");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "latest" | "name">("rating");

  // User Profile
  const [currentUser, setCurrentUser] = useState("지훈");

  // Modals
  const [selectedRestaurantForDetail, setSelectedRestaurantForDetail] =
    useState<Restaurant | null>(null);
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [reviewTargetRestaurantId, setReviewTargetRestaurantId] = useState<string | undefined>(
    undefined
  );
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("tta_intern_food_user");
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    fetchRestaurants();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchRestaurants = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setLoading(true);

      const res = await fetch(`/api/restaurants${refresh ? "?refresh=true" : ""}`);
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "음식점 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleOpenAddReview = (restaurantId?: string) => {
    setReviewTargetRestaurantId(restaurantId);
    setIsAddReviewOpen(true);
  };

  const handleRestaurantCreated = (newRest: Restaurant, openReview: boolean) => {
    setIsAddRestaurantOpen(false);
    showToast(`"${newRest.name}" 등록 완료! 🎉`);
    fetchRestaurants(true);

    if (openReview) {
      setTimeout(() => {
        handleOpenAddReview(newRest.id);
      }, 300);
    }
  };

  const handleReviewCreated = (newReview: Review) => {
    setIsAddReviewOpen(false);
    showToast(`${newReview.author}님의 평론이 등록되었습니다! 🌟`);
    fetchRestaurants(true);

    // If detail modal was open for this restaurant, update it
    if (selectedRestaurantForDetail && selectedRestaurantForDetail.id === newReview.restaurantId) {
      setSelectedRestaurantForDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reviews: [newReview, ...prev.reviews],
          reviewCount: prev.reviewCount + 1,
        };
      });
    }
  };

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((rest) => {
        // Building filter
        if (selectedBuilding !== "전체") {
          if (selectedBuilding === "기타") {
            if (["누리꿈", "사보이", "kgit"].includes(rest.building)) return false;
          } else if (rest.building !== selectedBuilding) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "전체") {
          if (!rest.categories || !rest.categories.includes(selectedCategory)) {
            return false;
          }
        }

        // Intern filter
        if (selectedInternFilter !== "전체") {
          const hasReview = rest.reviews.some((r) => r.author === selectedInternFilter);
          if (!hasReview) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = rest.name.toLowerCase().includes(q);
          const matchBuilding = (rest.building || "").toLowerCase().includes(q);
          const matchCat = rest.categories.some((c) => c.toLowerCase().includes(q));
          const matchMenu = rest.recommendedMenus.some((m) => m.toLowerCase().includes(q));
          const matchComment = Object.values(rest.authorComments).some((c) =>
            c.toLowerCase().includes(q)
          );
          return matchName || matchBuilding || matchCat || matchMenu || matchComment;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return b.avgRating - a.avgRating || b.reviewCount - a.reviewCount;
        }
        if (sortBy === "reviews") {
          return b.reviewCount - a.reviewCount || b.avgRating - a.avgRating;
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name, "ko");
        }
        if (sortBy === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [restaurants, searchQuery, selectedBuilding, selectedCategory, selectedInternFilter, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddRestaurant={() => setIsAddRestaurantOpen(true)}
        onOpenAddReview={handleOpenAddReview}
        onRefresh={() => fetchRestaurants(true)}
        isRefreshing={isRefreshing}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "stats" ? (
          <StatsView
            onOpenDetail={(r) => setSelectedRestaurantForDetail(r)}
            onOpenAddReview={handleOpenAddReview}
          />
        ) : (
          <div className="space-y-6">
            {/* Hero / Filter Bar */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="식당 이름, 카테고리, 메뉴, 건물, 인턴 한줄평 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>

              {/* Building Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  건물:
                </span>
                {BUILDING_TABS.map((bldg) => (
                  <button
                    key={bldg}
                    onClick={() => setSelectedBuilding(bldg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedBuilding === bldg
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {bldg}
                  </button>
                ))}
              </div>

              {/* Category Pills & Sort / Intern Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    종류:
                  </span>
                  {CATEGORY_FILTER_LIST.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        selectedCategory === cat
                          ? "bg-orange-500 text-white font-bold"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sort & Intern Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Intern Reviewer Filter */}
                  <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">작성자:</span>
                    <select
                      value={selectedInternFilter}
                      onChange={(e) => setSelectedInternFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {INTERN_FILTER_LIST.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Selector */}
                  <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">정렬:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="rating">평점 높은 순</option>
                      <option value="reviews">평론 많은 순</option>
                      <option value="latest">최신 등록순</option>
                      <option value="name">가나다 순</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count & Quick CTA */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500">
                총 <span className="text-orange-600 font-extrabold">{filteredRestaurants.length}</span>
                개의 음식점
              </span>

              <button
                onClick={() => setIsAddRestaurantOpen(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>식당 직접 추가하기</span>
              </button>
            </div>

            {/* Loading / Error / Content */}
            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">
                  노션에서 음식점과 평론 데이터를 동기화하고 있습니다...
                </p>
              </div>
            ) : error ? (
              <div className="py-16 text-center text-red-500 bg-red-50 rounded-2xl p-6 border border-red-200">
                {error}
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">검색 결과가 없습니다</h4>
                <p className="text-xs text-slate-500 mt-1">
                  새로운 음식점을 등록하고 인턴들과 함께 첫 평론을 남겨보세요!
                </p>
                <button
                  onClick={() => setIsAddRestaurantOpen(true)}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-orange-500 text-white rounded-xl shadow transition hover:bg-orange-600"
                >
                  + 새 음식점 등록하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onOpenDetail={(r) => setSelectedRestaurantForDetail(r)}
                    onOpenAddReview={handleOpenAddReview}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <RestaurantDetailModal
        restaurant={selectedRestaurantForDetail}
        onClose={() => setSelectedRestaurantForDetail(null)}
        onOpenAddReview={handleOpenAddReview}
      />

      <AddRestaurantModal
        isOpen={isAddRestaurantOpen}
        onClose={() => setIsAddRestaurantOpen(false)}
        onSuccess={handleRestaurantCreated}
      />

      <AddReviewModal
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        restaurants={restaurants}
        initialRestaurantId={reviewTargetRestaurantId}
        defaultAuthor={currentUser}
        onSuccess={handleReviewCreated}
      />
    </div>
  );
}