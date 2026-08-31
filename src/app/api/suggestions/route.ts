import { NextResponse } from "next/server";
import {
  fetchSuggestionsFromNotion,
  createSuggestionInNotion,
  updateSuggestionInNotion,
} from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const suggestions = await fetchSuggestionsFromNotion();
    return NextResponse.json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error("GET /api/suggestions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "제안 제목을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!body.author || !body.author.trim()) {
      return NextResponse.json(
        { success: false, error: "작성자를 입력해주세요." },
        { status: 400 }
      );
    }

    const newSuggestion = await createSuggestionInNotion({
      author: body.author.trim(),
      type: body.type || "feature",
      title: body.title.trim(),
      content: (body.content || "").trim(),
    });

    return NextResponse.json({ success: true, data: newSuggestion }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/suggestions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save suggestion" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, patchVersion } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "제안 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const updated = await updateSuggestionInNotion(id, status, patchVersion);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/suggestions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update suggestion" },
      { status: 500 }
    );
  }
}
