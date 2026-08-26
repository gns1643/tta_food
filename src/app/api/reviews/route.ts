import { NextResponse } from "next/server";
import { fetchAllData, createReview } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const refresh = searchParams.get("refresh") === "true";
    const { reviews } = await fetchAllData(refresh);

    if (restaurantId) {
      const filtered = reviews.filter((r) => r.restaurantId === restaurantId);
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.restaurantId) {
      return NextResponse.json(
        { success: false, error: "대상 음식점을 선택해주세요." },
        { status: 400 }
      );
    }
    if (!body.author || !body.author.trim()) {
      return NextResponse.json(
        { success: false, error: "작성자를 선택해주세요." },
        { status: 400 }
      );
    }

    const newReview = await createReview({
      restaurantId: body.restaurantId,
      author: body.author.trim(),
      visitDate: body.visitDate,
      rating: typeof body.rating === "number" ? body.rating : undefined,
      shortComment: body.shortComment,
      detailComment: body.detailComment,
      recommendedMenu: body.recommendedMenu,
      revisit: Boolean(body.revisit),
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}