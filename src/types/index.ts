export interface Review {
  id: string;
  title: string;
  restaurantId: string;
  restaurantName?: string;
  author: string;
  visitDate: string | null;
  rating: number | null;
  shortComment: string;
  detailComment: string;
  menu: string; // 주문 메뉴 (해당 평론 대상 메뉴)
  recommendedMenu?: string; // 하위 호환성 유지
  revisit: boolean;
  url?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string; // building alias
  building: string;
  categories: string[];
  priceRange?: string;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  revisitRate: number;
  authorScores: Record<string, number | null>;
  authorComments: Record<string, string>;
  menus: string[]; // 식당 평론들에 등록된 주문 메뉴 목록
  recommendedMenus?: string[]; // 하위 호환성 유지
  url?: string;
  createdAt: string;
}

export interface CreateRestaurantInput {
  name: string;
  building: string;
  categories?: string[];
  priceRange?: string;
}

export interface CreateReviewInput {
  restaurantId: string;
  author: string;
  visitDate?: string;
  rating?: number;
  shortComment?: string;
  detailComment?: string;
  menu?: string;
  recommendedMenu?: string; // 하위 호환성 유지
  revisit?: boolean;
}

export interface AuthorDetailStat {
  name: string;
  reviewCount: number;
  avgRating: number;
  revisitRate: number;
  favoriteRestaurant?: { id: string; name: string; rating: number } | null;
}

export interface BuildingStat {
  building: string;
  restaurantCount: number;
  avgRating: number;
  reviewCount: number;
  topRestaurant?: Restaurant | null;
}

export interface CategoryChampion {
  category: string;
  restaurant: Restaurant;
}

export interface MenuStat {
  menu: string;
  count: number;
}

export interface ControversialStat {
  restaurant: Restaurant;
  maxDiff: number;
  highest: { author: string; rating: number };
  lowest: { author: string; rating: number };
}

export interface Stats {
  totalRestaurants: number;
  totalReviews: number;
  authorReviewCounts: Record<string, number>;
  authorAvgRatings: Record<string, number>;
  topRestaurants: Restaurant[];
  recentReviews: Review[];
  revisitTopRestaurants: Restaurant[];
  authorDetails?: AuthorDetailStat[];
  mostGenerousAuthor?: { name: string; avgRating: number } | null;
  strictestAuthor?: { name: string; avgRating: number } | null;
  controversialRestaurants?: ControversialStat[];
  unanimousRestaurants?: Restaurant[];
  buildingStats?: BuildingStat[];
  topMenus?: MenuStat[];
  categoryChampions?: CategoryChampion[];
  hiddenGems?: Restaurant[];
  dormantRestaurants?: Restaurant[];
}