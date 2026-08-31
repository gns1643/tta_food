"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Rocket, Palette, Wrench, MessageSquare, Send, Loader2, Clock, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAuthor?: string;
  onSuccess: (newSuggestion: any) => void;
}

const DEFAULT_AUTHORS = ["지훈", "준협", "윤섭", "동찬"];

const SUGGESTION_TYPES = [
  { id: "feature", label: "기능 제안", icon: Rocket, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800" },
  { id: "design", label: "UI / 디자인", icon: Palette, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800" },
  { id: "fix", label: "버그 제보", icon: Wrench, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" },
  { id: "other", label: "기타 의견", icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" },
];

export default function SuggestionModal({
  isOpen,
  onClose,
  defaultAuthor = "지훈",
  onSuccess,
}: SuggestionModalProps) {
  const [author, setAuthor] = useState(defaultAuthor || "지훈");
  const [customAuthor, setCustomAuthor] = useState("");
  const [isCustomAuthor, setIsCustomAuthor] = useState(false);
  const [type, setType] = useState<"feature" | "design" | "fix" | "other">("feature");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultAuthor) {
      if (DEFAULT_AUTHORS.includes(defaultAuthor)) {
        setAuthor(defaultAuthor);
        setIsCustomAuthor(false);
      } else {
        setCustomAuthor(defaultAuthor);
        setIsCustomAuthor(true);
      }
    }
  }, [defaultAuthor]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAuthor = isCustomAuthor ? customAuthor.trim() : author;
    if (!finalAuthor) {
      setError("작성자를 입력해주세요.");
      return;
    }

    if (!title.trim()) {
      setError("제안 제목을 입력해주세요.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: finalAuthor,
          type,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "제안 등록에 실패했습니다.");
      }

      // Confetti 🎉
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      // Reset form
      setTitle("");
      setContent("");
      onSuccess(data.data);
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>Autonomous Feedback Box</span>
          </div>
          <h2 className="text-xl font-black">인턴 아이디어 & 기능 제안 💡</h2>
          <p className="text-xs text-orange-100 mt-1">
            남겨주신 의견은 정기 스케줄러가 자동 확인 후 코드로 구현하여 배포합니다!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Author Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              작성자 (인턴) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_AUTHORS.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    setAuthor(name);
                    setIsCustomAuthor(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                    !isCustomAuthor && author === name
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomAuthor(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                  isCustomAuthor
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                + 직접 입력
              </button>
            </div>
            {isCustomAuthor && (
              <input
                type="text"
                placeholder="인턴 이름 입력"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className="mt-2 w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              제안 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTION_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center space-x-2 ${
                      isSelected
                        ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              제안 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 룰렛으로 오늘 점심 메뉴 랜덤 추천하는 기능"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          {/* Content / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              상세 설명 / 요구사항 <span className="text-slate-400 dark:text-slate-500 font-normal">(자유롭게 서술)</span>
            </label>
            <textarea
              rows={4}
              placeholder="어떤 방식으로 동작하면 좋을지, 어떤 화면에서 보이면 좋을지 구체적인 아이디어를 적어주세요. Antigravity가 그대로 개발해 드립니다!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-orange-500 resize-none font-normal"
            />
          </div>

          {/* Automatic Processing Info Banner */}
          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 p-3.5 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              <strong className="font-bold">자동 스케줄러 연동</strong>: 등록된 제안은 정해진 스케줄마다 자동으로 검토·개발되어 Git에 푸시되고, 패치노트에 작성자 이름과 함께 기록됩니다!
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>의견 저장 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>의견 등록하고 자동 개발 요청하기 🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
