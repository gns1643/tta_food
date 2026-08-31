import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "suggestions.json");

export interface Suggestion {
  id: string;
  author: string;
  type: "feature" | "design" | "fix" | "other";
  title: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  patchVersion?: string;
  createdAt: string;
  completedAt?: string;
}

async function readSuggestions(): Promise<Suggestion[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function writeSuggestions(suggestions: Suggestion[]): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(suggestions, null, 2), "utf-8");
}

export async function GET(req: Request) {
  try {
    const suggestions = await readSuggestions();
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

    const suggestions = await readSuggestions();

    const newSuggestion: Suggestion = {
      id: `sug-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: body.author.trim(),
      type: body.type || "feature",
      title: body.title.trim(),
      content: (body.content || "").trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Prepend new suggestion
    suggestions.unshift(newSuggestion);
    await writeSuggestions(suggestions);

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

    const suggestions = await readSuggestions();
    const index = suggestions.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "해당 제안을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (status) {
      suggestions[index].status = status;
      if (status === "completed") {
        suggestions[index].completedAt = new Date().toISOString();
      }
    }

    if (patchVersion) {
      suggestions[index].patchVersion = patchVersion;
    }

    await writeSuggestions(suggestions);

    return NextResponse.json({ success: true, data: suggestions[index] });
  } catch (error: any) {
    console.error("PATCH /api/suggestions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update suggestion" },
      { status: 500 }
    );
  }
}
