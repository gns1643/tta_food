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
  recommendedMenu: string;
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
  recommendedMenus: string[];
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
  recommendedMenu?: string;
  revisit?: boolean;
}

export interface Stats {
  totalRestaurants: number;
  totalReviews: number;
  authorReviewCounts: Record<string, number>;
  authorAvgRatings: Record<string, number>;
  topRestaurants: Restaurant[];
  recentReviews: Review[];
  revisitTopRestaurants: Restaurant[];
}