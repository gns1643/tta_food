import { Client } from "@notionhq/client";
import {
  Restaurant,
  Review,
  CreateRestaurantInput,
  CreateReviewInput,
  Stats,
  AuthorDetailStat,
  BuildingStat,
  CategoryChampion,
  MenuStat,
  ControversialStat,
} from "@/types";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const RESTAURANT_DB_ID = process.env.NOTION_RESTAURANT_DB_ID || "";
const REVIEW_DB_ID = process.env.NOTION_REVIEW_DB_ID || "";

// In-memory cache for fast responses
let cachedData: {
  restaurants: Restaurant[];
  reviews: Review[];
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 15 * 1000; // 15 seconds cache

export function invalidateCache() {
  cachedData = null;
}

export async function fetchAllData(forceRefresh = false): Promise<{
  restaurants: Restaurant[];
  reviews: Review[];
}> {
  const now = Date.now();
  if (!forceRefresh && cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return { restaurants: cachedData.restaurants, reviews: cachedData.reviews };
  }

  if (!RESTAURANT_DB_ID || !REVIEW_DB_ID || !process.env.NOTION_API_KEY) {
    return { restaurants: [], reviews: [] };
  }

  // 1. Query Restaurant DB
  const restQuery = await notion.databases.query({
    database_id: RESTAURANT_DB_ID,
    page_size: 100,
  });

  // 2. Query Review DB
  const reviewQuery = await notion.databases.query({
    database_id: REVIEW_DB_ID,
    page_size: 100,
    sorts: [
      {
        property: "방문일",
        direction: "descending",
      },
    ],
  });

  // Map Reviews & Filter out unwritten/empty template rows
  const rawReviews: Review[] = reviewQuery.results
    .map((page: any) => {
      const props = page.properties;
      const title = props["제목"]?.title?.[0]?.plain_text || "";
      const author = props["작성자"]?.select?.name || "익명";
      const visitDate = props["방문일"]?.date?.start || null;
      const rating = typeof props["별점"]?.number === "number" ? props["별점"]?.number : null;
      const shortComment = props["한줄평"]?.rich_text?.[0]?.plain_text || "";
      const detailComment = props["상세 평론"]?.rich_text?.[0]?.plain_text || "";
      const menu =
        props["주문 메뉴"]?.rich_text?.[0]?.plain_text ||
        props["메뉴"]?.rich_text?.[0]?.plain_text ||
        props["추천 메뉴"]?.rich_text?.[0]?.plain_text ||
        "";
      const revisit = Boolean(props["재방문?"]?.checkbox);
      const restaurantRelations = props["음식점"]?.relation || [];
      const restaurantId = restaurantRelations[0]?.id || "";

      return {
        id: page.id,
        title,
        restaurantId,
        author,
        visitDate,
        rating,
        shortComment,
        detailComment,
        menu,
        recommendedMenu: menu, // 하위 호환성 유지
        revisit,
        url: page.url,
      };
    })
    .filter((r) => {
      const hasRating = r.rating !== null && r.rating > 0;
      const hasShort = r.shortComment.trim().length > 0;
      const hasDetail = r.detailComment.trim().length > 0;
      const hasMenu = r.menu.trim().length > 0;
      return hasRating || hasShort || hasDetail || hasMenu;
    });

  // Build a map of restaurant ID -> restaurant Name for reviews
  const restNameMap = new Map<string, string>();
  restQuery.results.forEach((page: any) => {
    const props = page.properties;
    const name = props["음식점"]?.title?.[0]?.plain_text || "이름 없음";
    restNameMap.set(page.id, name);
  });

  const reviews = rawReviews.map((r) => ({
    ...r,
    restaurantName: restNameMap.get(r.restaurantId) || "",
  }));

  // Map Restaurants & connect reviews
  const restaurants: Restaurant[] = restQuery.results.map((page: any) => {
    const props = page.properties;
    const name = props["음식점"]?.title?.[0]?.plain_text || "이름 없음";
    const building = props["건물"]?.select?.name || "기타";
    const categories = props["카테고리"]?.multi_select?.map((c: any) => c.name) || [];
    const priceRange = props["가격대"]?.select?.name;
    const restReviews = reviews.filter((r) => r.restaurantId === page.id);

    // Calculate ratings
    const validRatings = restReviews
      .map((r) => r.rating)
      .filter((r): r is number => typeof r === "number" && r > 0);

    const avgRating =
      validRatings.length > 0
        ? Number(
            (
              validRatings.reduce((acc, curr) => acc + curr, 0) / validRatings.length
            ).toFixed(1)
          )
        : 0;

    const revisitCount = restReviews.filter((r) => r.revisit).length;
    const revisitRate =
      restReviews.length > 0
        ? Math.round((revisitCount / restReviews.length) * 100)
        : 0;

    const authorScores: Record<string, number | null> = {};
    const authorComments: Record<string, string> = {};
    const menus: string[] = [];

    restReviews.forEach((r) => {
      if (r.author) {
        if (r.rating !== null) authorScores[r.author] = r.rating;
        if (r.shortComment) authorComments[r.author] = r.shortComment;
      }
      if (r.menu && !menus.includes(r.menu)) {
        menus.push(r.menu);
      }
    });

    return {
      id: page.id,
      name,
      location: building,
      building,
      categories,
      priceRange,
      reviews: restReviews,
      avgRating,
      reviewCount: restReviews.length,
      revisitRate,
      authorScores,
      authorComments,
      menus,
      recommendedMenus: menus, // 하위 호환성 유지
      url: page.url,
      createdAt: page.created_time,
    };
  });

  cachedData = {
    restaurants,
    reviews,
    timestamp: now,
  };

  return { restaurants, reviews };
}

export async function createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
  const properties: any = {
    "음식점": {
      title: [
        {
          text: {
            content: input.name,
          },
        },
      ],
    },
    "건물": {
      select: {
        name: input.building,
      },
    },
  };

  if (input.categories && input.categories.length > 0) {
    properties["카테고리"] = {
      multi_select: input.categories.map((cat) => ({ name: cat })),
    };
  }

  if (input.priceRange) {
    properties["가격대"] = {
      select: {
        name: input.priceRange,
      },
    };
  }

  const response: any = await notion.pages.create({
    parent: { database_id: RESTAURANT_DB_ID },
    properties,
  });

  invalidateCache();

  return {
    id: response.id,
    name: input.name,
    location: input.building,
    building: input.building,
    categories: input.categories || [],
    priceRange: input.priceRange,
    reviews: [],
    avgRating: 0,
    reviewCount: 0,
    revisitRate: 0,
    authorScores: {},
    authorComments: {},
    menus: [],
    recommendedMenus: [],
    url: response.url,
    createdAt: response.created_time,
  };
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { restaurants } = await fetchAllData(false);
  const targetRest = restaurants.find((r) => r.id === input.restaurantId);
  const restName = targetRest?.name || "음식점";
  const title = `${restName} - ${input.author}`;
  const menuValue = (input.menu ?? input.recommendedMenu ?? "").trim();

  const properties: any = {
    "제목": {
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
    },
    "음식점": {
      relation: [
        {
          id: input.restaurantId,
        },
      ],
    },
    "작성자": {
      select: {
        name: input.author,
      },
    },
    "재방문?": {
      checkbox: Boolean(input.revisit),
    },
  };

  if (input.visitDate) {
    properties["방문일"] = {
      date: {
        start: input.visitDate,
      },
    };
  } else {
    const today = new Date().toISOString().split("T")[0];
    properties["방문일"] = {
      date: {
        start: today,
      },
    };
  }

  if (typeof input.rating === "number") {
    properties["별점"] = {
      number: input.rating,
    };
  }

  if (input.shortComment) {
    properties["한줄평"] = {
      rich_text: [
        {
          text: {
            content: input.shortComment,
          },
        },
      ],
    };
  }

  if (input.detailComment) {
    properties["상세 평론"] = {
      rich_text: [
        {
          text: {
            content: input.detailComment,
          },
        },
      ],
    };
  }

  if (menuValue) {
    properties["주문 메뉴"] = {
      rich_text: [
        {
          text: {
            content: menuValue,
          },
        },
      ],
    };
  }

  const response: any = await notion.pages.create({
    parent: { database_id: REVIEW_DB_ID },
    properties,
  });

  invalidateCache();

  return {
    id: response.id,
    title,
    restaurantId: input.restaurantId,
    restaurantName: restName,
    author: input.author,
    visitDate: input.visitDate || new Date().toISOString().split("T")[0],
    rating: input.rating ?? null,
    shortComment: input.shortComment || "",
    detailComment: input.detailComment || "",
    menu: menuValue,
    recommendedMenu: menuValue,
    revisit: Boolean(input.revisit),
    url: response.url,
  };
}

export async function updateReview(
  reviewId: string,
  input: {
    restaurantId?: string;
    author?: string;
    visitDate?: string;
    rating?: number;
    shortComment?: string;
    detailComment?: string;
    menu?: string;
    recommendedMenu?: string;
    revisit?: boolean;
  }
): Promise<Review> {
  const properties: any = {};

  if (input.author) {
    properties["작성자"] = {
      select: {
        name: input.author,
      },
    };
  }

  if (input.visitDate) {
    properties["방문일"] = {
      date: {
        start: input.visitDate,
      },
    };
  }

  if (typeof input.rating === "number") {
    properties["별점"] = {
      number: input.rating,
    };
  }

  if (input.shortComment !== undefined) {
    properties["한줄평"] = {
      rich_text: [
        {
          text: {
            content: input.shortComment,
          },
        },
      ],
    };
  }

  if (input.detailComment !== undefined) {
    properties["상세 평론"] = {
      rich_text: [
        {
          text: {
            content: input.detailComment,
          },
        },
      ],
    };
  }

  const menuInput = input.menu !== undefined ? input.menu : input.recommendedMenu;
  if (menuInput !== undefined) {
    properties["주문 메뉴"] = {
      rich_text: [
        {
          text: {
            content: menuInput,
          },
        },
      ],
    };
  }

  if (input.revisit !== undefined) {
    properties["재방문?"] = {
      checkbox: Boolean(input.revisit),
    };
  }

  const response: any = await notion.pages.update({
    page_id: reviewId,
    properties,
  });

  invalidateCache();

  const finalMenu =
    menuInput ??
    response.properties["주문 메뉴"]?.rich_text?.[0]?.plain_text ??
    response.properties["메뉴"]?.rich_text?.[0]?.plain_text ??
    response.properties["추천 메뉴"]?.rich_text?.[0]?.plain_text ??
    "";

  return {
    id: response.id,
    title: response.properties["제목"]?.title?.[0]?.plain_text || "",
    restaurantId: input.restaurantId || "",
    author: input.author || response.properties["작성자"]?.select?.name || "",
    visitDate: input.visitDate || response.properties["방문일"]?.date?.start || null,
    rating: input.rating ?? response.properties["별점"]?.number ?? null,
    shortComment: input.shortComment ?? "",
    detailComment: input.detailComment ?? "",
    menu: finalMenu,
    recommendedMenu: finalMenu,
    revisit: Boolean(input.revisit),
    url: response.url,
  };
}

export async function getStats(): Promise<Stats> {
  const { restaurants, reviews } = await fetchAllData(false);

  const authorReviewCounts: Record<string, number> = {};
  const authorRatingSums: Record<
    string,
    { sum: number; count: number; revisitCount: number; reviews: Review[] }
  > = {};

  reviews.forEach((r) => {
    if (!r.author) return;
    authorReviewCounts[r.author] = (authorReviewCounts[r.author] || 0) + 1;

    if (!authorRatingSums[r.author]) {
      authorRatingSums[r.author] = { sum: 0, count: 0, revisitCount: 0, reviews: [] };
    }
    authorRatingSums[r.author].reviews.push(r);
    if (r.revisit) {
      authorRatingSums[r.author].revisitCount += 1;
    }
    if (r.rating !== null && r.rating > 0) {
      authorRatingSums[r.author].sum += r.rating;
      authorRatingSums[r.author].count += 1;
    }
  });

  const authorAvgRatings: Record<string, number> = {};
  const authorDetails: AuthorDetailStat[] = [];

  Object.keys(authorRatingSums).forEach((author) => {
    const item = authorRatingSums[author];
    const avg = item.count > 0 ? Number((item.sum / item.count).toFixed(1)) : 0;
    authorAvgRatings[author] = avg;

    // Find favorite restaurant for this author
    let favRest: { id: string; name: string; rating: number } | null = null;
    const sortedAuthorReviews = [...item.reviews]
      .filter((rv) => typeof rv.rating === "number" && rv.rating > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (sortedAuthorReviews.length > 0) {
      const topRv = sortedAuthorReviews[0];
      const rObj = restaurants.find((r) => r.id === topRv.restaurantId);
      favRest = {
        id: topRv.restaurantId,
        name: rObj?.name || topRv.restaurantName || "식당",
        rating: topRv.rating || 5,
      };
    }

    const revisitRate =
      item.reviews.length > 0
        ? Math.round((item.revisitCount / item.reviews.length) * 100)
        : 0;

    authorDetails.push({
      name: author,
      reviewCount: item.reviews.length,
      avgRating: avg,
      revisitRate,
      favoriteRestaurant: favRest,
    });
  });

  // Sort authorDetails by review count desc
  authorDetails.sort((a, b) => b.reviewCount - a.reviewCount);

  // Generous vs Strict author
  const authorsWithReviews = authorDetails.filter((a) => a.reviewCount >= 1);
  const mostGenerousAuthor =
    authorsWithReviews.length > 0
      ? [...authorsWithReviews].sort((a, b) => b.avgRating - a.avgRating)[0]
      : null;
  const strictestAuthor =
    authorsWithReviews.length > 0
      ? [...authorsWithReviews].sort((a, b) => a.avgRating - b.avgRating)[0]
      : null;

  // Controversial restaurants (score variance between interns >= 1.0)
  const controversialRestaurants: ControversialStat[] = [];
  restaurants.forEach((rest) => {
    const validReviews = rest.reviews.filter((r) => typeof r.rating === "number" && r.rating > 0);
    if (validReviews.length >= 2) {
      const sorted = [...validReviews].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      const highest = sorted[0];
      const lowest = sorted[sorted.length - 1];
      const diff = Number(((highest.rating || 0) - (lowest.rating || 0)).toFixed(1));
      if (diff >= 0.5) {
        controversialRestaurants.push({
          restaurant: rest,
          maxDiff: diff,
          highest: { author: highest.author, rating: highest.rating || 0 },
          lowest: { author: lowest.author, rating: lowest.rating || 0 },
        });
      }
    }
  });
  controversialRestaurants.sort((a, b) => b.maxDiff - a.maxDiff);

  // Unanimous Praise (>= 2 reviews, all ratings >= 4.0, revisit 100%)
  const unanimousRestaurants = restaurants
    .filter((r) => r.reviewCount >= 2 && r.avgRating >= 4.2 && r.revisitRate === 100)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, 5);

  // Building stats
  const BUILDING_LIST = ["누리꿈", "사보이", "kgit", "기타"];
  const buildingStats: BuildingStat[] = BUILDING_LIST.map((bldg) => {
    const bldgRestaurants = restaurants.filter((r) => {
      if (bldg === "기타") return !["누리꿈", "사보이", "kgit"].includes(r.building);
      return r.building === bldg;
    });
    const reviewed = bldgRestaurants.filter((r) => r.reviewCount > 0);
    const avg =
      reviewed.length > 0
        ? Number((reviewed.reduce((sum, r) => sum + r.avgRating, 0) / reviewed.length).toFixed(1))
        : 0;
    const totalRevCount = bldgRestaurants.reduce((sum, r) => sum + r.reviewCount, 0);
    const topRest =
      [...reviewed].sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)[0] ||
      null;

    return {
      building: bldg,
      restaurantCount: bldgRestaurants.length,
      avgRating: avg,
      reviewCount: totalRevCount,
      topRestaurant: topRest,
    };
  }).sort((a, b) => b.avgRating - a.avgRating || b.restaurantCount - a.restaurantCount);

  // Top menus (most ordered lunch menus)
  const menuFreq: Record<string, number> = {};
  reviews.forEach((r) => {
    const m = r.menu || r.recommendedMenu;
    if (m && m.trim()) {
      const clean = m.trim();
      menuFreq[clean] = (menuFreq[clean] || 0) + 1;
    }
  });
  const topMenus: MenuStat[] = Object.entries(menuFreq)
    .map(([menu, count]) => ({ menu, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Category Champions
  const CATEGORIES = ["한식", "일식", "중식", "양식", "분식", "카페", "아시안"];
  const categoryChampions: CategoryChampion[] = [];
  CATEGORIES.forEach((cat) => {
    const matches = restaurants
      .filter((r) => r.categories && r.categories.includes(cat) && r.reviewCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    if (matches.length > 0) {
      categoryChampions.push({
        category: cat,
        restaurant: matches[0],
      });
    }
  });

  // Hidden gems: high rating (>= 4.5) with only 1~2 reviews
  const hiddenGems = restaurants
    .filter((r) => r.reviewCount >= 1 && r.reviewCount <= 2 && r.avgRating >= 4.5)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  // Dormant restaurants: has reviews, but visited long ago
  const dormantRestaurants = [...restaurants]
    .filter((r) => r.reviewCount > 0 && r.reviews.some((rv) => rv.visitDate))
    .sort((a, b) => {
      const aLatest = Math.max(
        ...a.reviews.map((rv) => (rv.visitDate ? new Date(rv.visitDate).getTime() : 0))
      );
      const bLatest = Math.max(
        ...b.reviews.map((rv) => (rv.visitDate ? new Date(rv.visitDate).getTime() : 0))
      );
      return aLatest - bLatest; // oldest first
    })
    .slice(0, 5);

  // Sort top rated with at least 1 review
  const topRestaurants = [...restaurants]
    .filter((r) => r.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
    .slice(0, 10);

  // Top revisit rate restaurants (with at least 1 review)
  const revisitTopRestaurants = [...restaurants]
    .filter((r) => r.reviewCount > 0 && r.revisitRate > 0)
    .sort((a, b) => b.revisitRate - a.revisitRate || b.reviewCount - a.reviewCount)
    .slice(0, 10);

  // Recent 10 reviews
  const recentReviews = [...reviews].slice(0, 10);

  return {
    totalRestaurants: restaurants.length,
    totalReviews: reviews.length,
    authorReviewCounts,
    authorAvgRatings,
    topRestaurants,
    recentReviews,
    revisitTopRestaurants,
    authorDetails,
    mostGenerousAuthor,
    strictestAuthor,
    controversialRestaurants: controversialRestaurants.slice(0, 4),
    unanimousRestaurants,
    buildingStats,
    topMenus,
    categoryChampions,
    hiddenGems,
    dormantRestaurants,
  };
}

const NOTION_SUGGESTION_DB_ID =
  process.env.NOTION_SUGGESTION_DB_ID || "3cd2e712-ccaf-812b-a89f-ff559f1a4fe3";

export interface NotionSuggestion {
  id: string;
  author: string;
  type: "feature" | "design" | "fix" | "other";
  title: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  patchVersion?: string;
  createdAt: string;
}

export async function fetchSuggestionsFromNotion(): Promise<NotionSuggestion[]> {
  try {
    const response: any = await notion.databases.query({
      database_id: NOTION_SUGGESTION_DB_ID,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      const title = props["제안 제목"]?.title?.[0]?.plain_text || "";
      const author = props["작성자"]?.select?.name || "익명";
      const typeRaw = props["유형"]?.select?.name || "기능 제안";
      const statusRaw = props["상태"]?.select?.name || "접수 완료";
      const content = props["상세 내용"]?.rich_text?.[0]?.plain_text || "";
      const patchVersion = props["반영 버전"]?.rich_text?.[0]?.plain_text || "";

      let type: "feature" | "design" | "fix" | "other" = "feature";
      if (typeRaw.includes("UI") || typeRaw.includes("디자인")) type = "design";
      else if (typeRaw.includes("버그")) type = "fix";
      else if (typeRaw.includes("기타")) type = "other";

      let status: "pending" | "in_progress" | "completed" = "pending";
      if (statusRaw.includes("완료") || statusRaw.includes("적용")) status = "completed";
      else if (statusRaw.includes("진행")) status = "in_progress";

      return {
        id: page.id,
        author,
        type,
        title,
        content,
        status,
        patchVersion: patchVersion || undefined,
        createdAt: page.created_time,
      };
    });
  } catch (error) {
    console.error("fetchSuggestionsFromNotion error:", error);
    return [];
  }
}

export async function createSuggestionInNotion(input: {
  author: string;
  type?: string;
  title: string;
  content?: string;
}): Promise<NotionSuggestion> {
  const typeMap: Record<string, string> = {
    feature: "기능 제안",
    design: "UI/디자인",
    fix: "버그 제보",
    other: "기타 의견",
  };

  const response: any = await notion.pages.create({
    parent: { database_id: NOTION_SUGGESTION_DB_ID },
    properties: {
      "제안 제목": {
        title: [{ text: { content: input.title } }],
      },
      "작성자": {
        select: { name: input.author },
      },
      "유형": {
        select: { name: typeMap[input.type || "feature"] || "기능 제안" },
      },
      "상세 내용": {
        rich_text: input.content ? [{ text: { content: input.content } }] : [],
      },
      "상태": {
        select: { name: "접수 완료" },
      },
    },
  });

  return {
    id: response.id,
    author: input.author,
    type: (input.type as any) || "feature",
    title: input.title,
    content: input.content || "",
    status: "pending",
    createdAt: response.created_time,
  };
}

export async function updateSuggestionInNotion(
  id: string,
  status?: string,
  patchVersion?: string
) {
  const properties: any = {};
  if (status) {
    const statusMap: Record<string, string> = {
      pending: "접수 완료",
      in_progress: "개발 진행 중",
      completed: "적용 완료",
    };
    properties["상태"] = {
      select: { name: statusMap[status] || status },
    };
  }
  if (patchVersion) {
    properties["반영 버전"] = {
      rich_text: [{ text: { content: patchVersion } }],
    };
  }

  const response: any = await notion.pages.update({
    page_id: id,
    properties,
  });

  return response;
}