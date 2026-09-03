"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Star,
  Building2,
  Utensils,
  Shuffle,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Restaurant } from "@/types";

interface LunchRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onOpenDetail: (restaurant: Restaurant) => void;
}

const SLICE_COLORS = [
  "#f97316", // orange-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#e11d48", // rose-600
  "#84cc16", // lime-500
  "#6366f1", // indigo-500
];

const BUILDING_OPTIONS = ["전체", "누리꿈", "사보이", "kgit", "기타"];

const AUTHOR_COLORS: Record<string, { bg: string; text: string }> = {
  지훈: { bg: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300", text: "text-blue-700 dark:text-blue-300" },
  준협: { bg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300", text: "text-emerald-700 dark:text-emerald-300" },
  윤섭: { bg: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300", text: "text-amber-700 dark:text-amber-300" },
  동찬: { bg: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300", text: "text-purple-700 dark:text-purple-300" },
};

export default function LunchRouletteModal({
  isOpen,
  onClose,
  restaurants,
  onOpenDetail,
}: LunchRouletteModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [wheelSize, setWheelSize] = useState<number | "all">(8); // default 8 items or "all"

  // Current candidates selected for the roulette wheel
  const [wheelCandidates, setWheelCandidates] = useState<Restaurant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [needleAngle, setNeedleAngle] = useState(0); // For needle tick bounce animation

  // Rotation animation references
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickSliceRef = useRef<number>(-1);

  // Filter pool
  const eligiblePool = useMemo(() => {
    return restaurants.filter((r) => {
      if (selectedBuilding !== "전체") {
        if (selectedBuilding === "기타") {
          if (["누리꿈", "사보이", "kgit"].includes(r.building)) return false;
        } else if (r.building !== selectedBuilding) {
          return false;
        }
      }
      if (selectedCategory !== "전체") {
        if (!r.categories || !r.categories.includes(selectedCategory)) return false;
      }
      return true;
    });
  }, [restaurants, selectedBuilding, selectedCategory]);

  // Categories available in pool
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    restaurants.forEach((r) => r.categories?.forEach((c) => cats.add(c)));
    return ["전체", ...Array.from(cats)];
  }, [restaurants]);

  // Shuffle and pick candidates for the wheel
  const pickWheelCandidates = useCallback(() => {
    if (eligiblePool.length === 0) {
      setWheelCandidates([]);
      return;
    }
    const count = wheelSize === "all" ? eligiblePool.length : Math.min(wheelSize, eligiblePool.length);
    const shuffled = [...eligiblePool].sort(() => 0.5 - Math.random());
    setWheelCandidates(shuffled.slice(0, count));
    setWinner(null);
  }, [eligiblePool, wheelSize]);

  // Initialize or re-pick when pool changes
  useEffect(() => {
    if (isOpen) {
      pickWheelCandidates();
    }
  }, [isOpen, eligiblePool, wheelSize, pickWheelCandidates]);

  // Audio helpers
  const playTick = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }, [soundEnabled]);

  const playFanfare = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }, [soundEnabled]);

  // Draw Roulette Canvas
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 14 * dpr;

      ctx.clearRect(0, 0, width, height);

      const count = wheelCandidates.length;
      if (count === 0) return;

      const sliceAngle = (2 * Math.PI) / count;

      // Draw slices
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);

      for (let i = 0; i < count; i++) {
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;
        const midA = startA + sliceAngle / 2;
        const color = SLICE_COLORS[i % SLICE_COLORS.length];

        // Slice background
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Slice border line
        ctx.lineWidth = count > 24 ? 1 * dpr : 1.8 * dpr;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // Outer rim decoration dot (scale down or skip if crowded)
        if (count <= 20 || (count <= 36 && i % 2 === 0) || (count > 36 && i % 3 === 0)) {
          const dotX = Math.cos(midA) * (radius - 7 * dpr);
          const dotY = Math.sin(midA) * (radius - 7 * dpr);
          ctx.beginPath();
          ctx.arc(dotX, dotY, (count > 24 ? 1.5 : 2.5) * dpr, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fill();
        }

        // Text rendering
        ctx.save();
        ctx.rotate(midA);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";

        // Dynamic font size and truncation based on count
        let fontSize = 13;
        if (count > 32) fontSize = 8;
        else if (count > 22) fontSize = 9.5;
        else if (count > 14) fontSize = 11;
        else if (count > 10) fontSize = 12;

        ctx.font = `bold ${fontSize * dpr}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = (count > 24 ? 2 : 4) * dpr;

        const restaurant = wheelCandidates[i];
        let name = restaurant.name;
        const maxChars = count > 32 ? 5 : count > 20 ? 6 : count > 12 ? 8 : 10;
        if (name.length > maxChars) name = name.slice(0, maxChars - 1) + "..";

        const textOffset = count > 24 ? 12 * dpr : count > 14 ? 18 * dpr : 24 * dpr;
        ctx.fillText(name, radius - textOffset, (fontSize * 0.35) * dpr);
        ctx.restore();
      }

      // Center Hub
      ctx.beginPath();
      ctx.arc(0, 0, 36 * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 10 * dpr;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 28 * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = "#f97316";
      ctx.fill();

      // Hub icon or text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${11 * dpr}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 0;
      ctx.fillText("TTA", 0, 0);

      ctx.restore();

      // Outer golden rim
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 4 * dpr, 0, 2 * Math.PI);
      ctx.lineWidth = 6 * dpr;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
      ctx.stroke();
    },
    [wheelCandidates]
  );

  // Redraw whenever candidates change or modal opens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 360;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    drawWheel(currentAngleRef.current);
  }, [drawWheel, isOpen]);

  // Spin the wheel!
  const spinWheel = () => {
    if (isSpinning || wheelCandidates.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const count = wheelCandidates.length;
    const sliceAngle = (2 * Math.PI) / count;

    // Randomly choose the winner index ahead of time
    const winningIdx = Math.floor(Math.random() * count);

    // Calculate target angle so pointer at 12 o'clock (-PI / 2 or 3PI / 2) lands right in center of winning slice
    const fullRotations = 6 + Math.floor(Math.random() * 3); // 6 to 8 full spins
    const currentAngle = currentAngleRef.current % (2 * Math.PI);

    // Center of winning slice is: (winningIdx + 0.5) * sliceAngle
    // When wheel rotates by A, that slice is at (winningIdx + 0.5) * sliceAngle + A.
    // We want it to be at 3 * Math.PI / 2.
    const targetSliceOffset = 1.5 * Math.PI - (winningIdx + 0.5) * sliceAngle;
    const finalAngle =
      currentAngleRef.current +
      fullRotations * 2 * Math.PI +
      ((targetSliceOffset - (currentAngleRef.current % (2 * Math.PI)) + 4 * Math.PI) %
        (2 * Math.PI));

    const startAngle = currentAngleRef.current;
    const deltaAngle = finalAngle - startAngle;

    const duration = 4800; // 4.8 seconds
    const startTime = performance.now();

    // Ease-out quartic curve: very fast start, dramatic slow tension finish
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    lastTickSliceRef.current = -1;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const angle = startAngle + deltaAngle * easedProgress;
      currentAngleRef.current = angle;
      drawWheel(angle);

      // Check current slice passing under top pointer (12 o'clock = 3PI/2)
      const normalized = (1.5 * Math.PI - (angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentSliceIdx = Math.floor(normalized / sliceAngle);

      if (currentSliceIdx !== lastTickSliceRef.current) {
        lastTickSliceRef.current = currentSliceIdx;
        playTick();
        // Needle bounce flick
        setNeedleAngle(18);
        setTimeout(() => setNeedleAngle(0), 45);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        setIsSpinning(false);
        setWinner(wheelCandidates[winningIdx]);
        playFanfare();

        // Confetti burst
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 70,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 70,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
          });
        }, 250);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between shadow-sm relative">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Compass className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  상암 미식 룰렛 (점메추)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-white/25 text-white rounded-full tracking-wider">
                  원판 룰렛
                </span>
              </div>
              <p className="text-xs text-orange-100 hidden sm:block">
                버튼 하나로 스핀! 틱틱틱 멈추는 손에 땀을 쥐는 점심 메뉴 추천
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "효과음 끄기" : "효과음 켜기"}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-5">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                <span>건물:</span>
                <select
                  disabled={isSpinning}
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  {BUILDING_OPTIONS.map((b) => (
                    <option key={b} value={b} className="dark:bg-slate-800">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <Utensils className="w-3.5 h-3.5 text-orange-500" />
                <span>종류:</span>
                <select
                  disabled={isSpinning}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c} className="dark:bg-slate-800">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span>칸 수:</span>
                <select
                  disabled={isSpinning}
                  value={wheelSize}
                  onChange={(e) => setWheelSize(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  <option value={6}>6칸</option>
                  <option value={8}>8칸 (기본)</option>
                  <option value={10}>10칸</option>
                  <option value="all">전체 ({eligiblePool.length}곳 모두)</option>
                </select>
              </div>
            </div>

            {/* Shuffle Button */}
            <button
              disabled={isSpinning || eligiblePool.length < 2}
              onClick={pickWheelCandidates}
              title={wheelSize === "all" ? "룰렛 순서 다시 섞기" : "룰렛 후보 새로고침"}
              className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-40"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{wheelSize === "all" ? "순서 섞기" : "후보 새로고침"}</span>
            </button>
          </div>

          {/* Roulette Arena */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            {/* Pointer / Needle Indicator at Top */}
            <div className="relative z-20 flex flex-col items-center -mb-4">
              <div
                className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-red-600 dark:border-t-red-500 filter drop-shadow-md transition-transform duration-75 origin-top"
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                }}
              />
              <div className="w-3 h-3 rounded-full bg-slate-800 border-2 border-white dark:border-slate-900 -mt-7" />
            </div>

            {/* Canvas Wheel */}
            <div className="relative p-2 rounded-full bg-gradient-to-tr from-slate-200 via-amber-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 shadow-2xl">
              <canvas
                ref={canvasRef}
                style={{ width: 340, height: 340 }}
                className="rounded-full select-none"
              />
            </div>

            {/* Spin CTA Button */}
            <div className="mt-6 text-center">
              {wheelCandidates.length < 2 ? (
                <div className="p-3 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800">
                  선택한 필터 조건의 식당이 부족합니다. 필터를 완화해주세요!
                </div>
              ) : (
                <button
                  disabled={isSpinning}
                  onClick={spinWheel}
                  className={`px-10 py-3.5 rounded-2xl font-black text-base shadow-lg transition transform flex items-center space-x-2 mx-auto cursor-pointer ${
                    isSpinning
                      ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed scale-95"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/30 hover:scale-105 active:scale-95"
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${isSpinning ? "animate-spin" : "animate-bounce"}`} />
                  <span>{isSpinning ? "돌아가는 중... 🎯" : "🎡 룰렛 힘차게 돌리기!"}</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* WINNER RESULT POPUP CARD                                  */}
          {/* ========================================================= */}
          {winner && (
            <div className="max-w-xl mx-auto p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border-2 border-amber-400 dark:border-amber-500 shadow-xl shadow-amber-500/10 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center space-x-1">
                  <span>🎉 룰렛 당첨! 오늘의 점심</span>
                </span>
                <div className="flex items-center text-amber-500 font-black text-xs space-x-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{winner.avgRating.toFixed(1)}점</span>
                  <span className="text-slate-400 font-normal">({winner.reviewCount}개)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {winner.building || "기타"}
                  </span>
                  {winner.categories?.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {winner.name}
                </h4>
              </div>

              {/* Menus */}
              {winner.menus && winner.menus.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-1">
                    인턴 추천 주문 메뉴:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {winner.menus.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 text-xs font-bold rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                      >
                        🍲 {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Intern Comment */}
              {Object.keys(winner.authorComments || {}).length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  {Object.entries(winner.authorComments)
                    .slice(0, 1)
                    .map(([author, comment]) => (
                      <div
                        key={author}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 space-y-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded ${
                              AUTHOR_COLORS[author]?.bg || "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {author}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">인턴 평가</span>
                        </div>
                        <p className="italic">&ldquo;{comment}&rdquo;</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    onOpenDetail(winner);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>식당 상세 & 리뷰 전체 보기</span>
                </button>

                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(
                    `${winner.name} ${winner.building || ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>네이버 지도</span>
                </a>

                <button
                  onClick={spinWheel}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>한 번 더 돌리기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
