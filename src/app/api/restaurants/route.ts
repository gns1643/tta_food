import { NextResponse } from "next/server";
import { fetchAllData, createRestaurant } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "true";
    const { restaurants } = await fetchAllData(refresh);
    return NextResponse.json({ success: true, data: restaurants });
  } catch (error: any) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "음식점 이름을 입력해주세요." },
        { status: 400 }
      );
    }
    const building = body.building || body.location || "기타";
    const categories = Array.isArray(body.categories) ? body.categories : [];
    const priceRange = body.priceRange;

    const newRestaurant = await createRestaurant({
      name: body.name.trim(),
      building,
      categories,
      priceRange,
    });
    return NextResponse.json({ success: true, data: newRestaurant }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/restaurants error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create restaurant" },
      { status: 500 }
    );
  }
}