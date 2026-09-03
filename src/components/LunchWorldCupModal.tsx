"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Trophy,
  Swords,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Star,
  Building2,
  Utensils,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Restaurant } from "@/types";

interface LunchWorldCupModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onOpenDetail: (restaurant: Restaurant) => void;
}

const AUTHOR_COLORS: Record<string, { bg: string; text: string }> = {
  지훈: { bg: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300", text: "text-blue-700 dark:text-blue-300" },
  준협: { bg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300", text: "text-emerald-700 dark:text-emerald-300" },
  윤섭: { bg: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300", text: "text-amber-700 dark:text-amber-300" },
  동찬: { bg: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300", text: "text-purple-700 dark:text-purple-300" },
};

const BUILDING_OPTIONS = ["전체", "누리꿈", "사보이", "kgit", "기타"];

export default function LunchWorldCupModal({
  isOpen,
  onClose,
  restaurants,
  onOpenDetail,
}: LunchWorldCupModalProps) {
  // Game phases: 'setup' | 'playing' | 'winner'
  const [phase, setPhase] = useState<"setup" | "playing" | "winner">("setup");
  const [roundSize, setRoundSize] = useState<4 | 8 | 16>(8);
  const [selectedBuilding, setSelectedBuilding] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // Tournament state
  const [currentRoundCandidates, setCurrentRoundCandidates] = useState<Restaurant[]>([]);
  const [nextRoundWinners, setNextRoundWinners] = useState<Restaurant[]>([]);
  const [currentMatchPairIndex, setCurrentMatchPairIndex] = useState(0); // 0, 2, 4, ...
  const [winner, setWinner] = useState<Restaurant | null>(null);

  // Animation & Audio State
  const [selectionAnimation, setSelectionAnimation] = useState<"left" | "right" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalMatchesInTournament, setTotalMatchesInTournament] = useState(7);
  const [completedMatchesCount, setCompletedMatchesCount] = useState(0);

  // Available categories based on filtered restaurants
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    restaurants.forEach((r) => r.categories?.forEach((c) => cats.add(c)));
    return ["전체", ...Array.from(cats)];
  }, [restaurants]);

  // Eligible pool of candidates based on filter
  const eligibleRestaurants = useMemo(() => {
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

  // Auto adjust roundSize if eligible count is smaller
  useEffect(() => {
    if (eligibleRestaurants.length < roundSize) {
      if (eligibleRestaurants.length >= 16) setRoundSize(16);
      else if (eligibleRestaurants.length >= 8) setRoundSize(8);
      else setRoundSize(4);
    }
  }, [eligibleRestaurants.length, roundSize]);

  // Audio synthesis helper (Web Audio API - zero latency, no external assets required)
  const playSound = useCallback(
    (type: "select" | "win" | "start") => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === "select") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(520, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        } else if (type === "start") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(392, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } else if (type === "win") {
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.value = freq;
            const start = ctx.currentTime + idx * 0.12;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.4);
          });
        }
      } catch {
        // Safe fallback if audio context fails
      }
    },
    [soundEnabled]
  );

  // Launch tournament
  const startTournament = () => {
    if (eligibleRestaurants.length < 2) return;

    // Determine actual starting size
    const actualSize = Math.min(
      roundSize,
      eligibleRestaurants.length >= 16 ? 16 : eligibleRestaurants.length >= 8 ? 8 : 4
    );

    // Shuffle candidates
    const shuffled = [...eligibleRestaurants].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, actualSize);

    // Calculate total matches: N - 1
    setTotalMatchesInTournament(selected.length - 1);
    setCompletedMatchesCount(0);

    setCurrentRoundCandidates(selected);
    setNextRoundWinners([]);
    setCurrentMatchPairIndex(0);
    setSelectionAnimation(null);
    setWinner(null);
    setPhase("playing");
    playSound("start");
  };

  // Reset to setup
  const handleReset = () => {
    setPhase("setup");
    setWinner(null);
    setSelectionAnimation(null);
    setCurrentRoundCandidates([]);
    setNextRoundWinners([]);
    setCurrentMatchPairIndex(0);
  };

  // Select Winner of current match
  const handleSelectWinner = useCallback(
    (side: "left" | "right") => {
      if (selectionAnimation || phase !== "playing") return;

      const leftRest = currentRoundCandidates[currentMatchPairIndex];
      const rightRest = currentRoundCandidates[currentMatchPairIndex + 1];
      if (!leftRest || !rightRest) return;

      const winningRest = side === "left" ? leftRest : rightRest;

      setSelectionAnimation(side);
      playSound("select");

      setTimeout(() => {
        const newWinners = [...nextRoundWinners, winningRest];
        const nextPairIdx = currentMatchPairIndex + 2;
        const newCompletedCount = completedMatchesCount + 1;
        setCompletedMatchesCount(newCompletedCount);

        // Check if current round has more matches
        if (nextPairIdx < currentRoundCandidates.length) {
          setCurrentMatchPairIndex(nextPairIdx);
          setNextRoundWinners(newWinners);
          setSelectionAnimation(null);
        } else {
          // Current round completed!
          if (newWinners.length === 1) {
            // We have a final champion!
            setWinner(newWinners[0]);
            setPhase("winner");
            setSelectionAnimation(null);
            playSound("win");

            // Multi-burst confetti celebration
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.55 },
            });
            setTimeout(() => {
              confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
              });
              confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
              });
            }, 250);
          } else {
            // Advance to next round (e.g., 8강 -> 4강, 4강 -> 결승)
            setCurrentRoundCandidates(newWinners);
            setNextRoundWinners([]);
            setCurrentMatchPairIndex(0);
            setSelectionAnimation(null);
          }
        }
      }, 400);
    },
    [
      selectionAnimation,
      phase,
      currentRoundCandidates,
      currentMatchPairIndex,
      nextRoundWinners,
      completedMatchesCount,
      playSound,
    ]
  );

  // Keyboard shortcut listener (1 / LeftArrow for Left, 2 / RightArrow for Right)
  useEffect(() => {
    if (!isOpen || phase !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1" || e.key === "ArrowLeft") {
        e.preventDefault();
        handleSelectWinner("left");
      } else if (e.key === "2" || e.key === "ArrowRight") {
        e.preventDefault();
        handleSelectWinner("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, phase, handleSelectWinner]);

  if (!isOpen) return null;

  // Round Title format
  const getRoundTitle = () => {
    const remaining = currentRoundCandidates.length;
    const matchNum = Math.floor(currentMatchPairIndex / 2) + 1;
    const totalMatchesInRound = Math.floor(remaining / 2);

    if (remaining === 2) {
      return "🔥 운명의 결승전 (FINAL)";
    }
    if (remaining === 4) {
      return `4강 준결승 (${matchNum}/${totalMatchesInRound} 경기)`;
    }
    if (remaining === 8) {
      return `8강 토너먼트 (${matchNum}/${totalMatchesInRound} 경기)`;
    }
    if (remaining === 16) {
      return `16강 토너먼트 (${matchNum}/${totalMatchesInRound} 경기)`;
    }
    return `${remaining}강 (${matchNum}/${totalMatchesInRound} 경기)`;
  };

  const leftCandidate = currentRoundCandidates[currentMatchPairIndex];
  const rightCandidate = currentRoundCandidates[currentMatchPairIndex + 1];

  // Pick best representative comment and menu for a restaurant
  const getRestaurantHighlights = (r: Restaurant) => {
    const menus = r.menus && r.menus.length > 0 ? r.menus : r.recommendedMenus || [];
    const commentEntries = Object.entries(r.authorComments || {}).filter(
      ([_, comment]) => comment && comment.trim().length > 0
    );
    const topComment = commentEntries.length > 0 ? commentEntries[0] : null;

    return {
      menus: menus.slice(0, 3),
      comment: topComment ? { author: topComment[0], text: topComment[1] } : null,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 py-4 sm:px-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between shadow-sm relative">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  오늘 점심 천하제일전
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-white/25 text-white rounded-full tracking-wider">
                  점메추 월드컵
                </span>
              </div>
              <p className="text-xs text-orange-100 hidden sm:block">
                인턴 동료들과 함께 1:1 토너먼트로 오늘의 최강 맛집을 뽑아보세요!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "효과음 끄기" : "효과음 켜기"}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* ========================================================= */}
          {/* PHASE 1: SETUP SCREEN                                     */}
          {/* ========================================================= */}
          {phase === "setup" && (
            <div className="max-w-xl mx-auto py-4 space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Swords className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  어떤 대결로 시작할까요?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  라운드 크기와 필터를 설정하고 토너먼트를 시작하세요!
                </p>
              </div>

              {/* Round Size Picker */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2.5 text-left">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>🏆 토너먼트 규모 선택</span>
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
                    현재 조건 가능 후보: {eligibleRestaurants.length}곳
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { size: 4, label: "4강 준결승", desc: "초스피드 3경기", min: 4 },
                    { size: 8, label: "8강 토너먼트", desc: "추천 국룰 7경기", min: 8 },
                    { size: 16, label: "16강 데스매치", desc: "치열한 15경기", min: 16 },
                  ].map((option) => {
                    const isAvailable = eligibleRestaurants.length >= option.min;
                    const isSelected = roundSize === option.size;
                    return (
                      <button
                        key={option.size}
                        disabled={!isAvailable}
                        onClick={() => setRoundSize(option.size as 4 | 8 | 16)}
                        className={`p-3 rounded-xl border text-center transition relative flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20 font-bold"
                            : isAvailable
                            ? "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            : "opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {option.size === 8 && isAvailable && (
                          <span className="absolute -top-2 px-1.5 py-0.2 text-[9px] font-black bg-orange-500 text-white rounded-full">
                            BEST
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-black">{option.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {option.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* Building Filter */}
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1" />
                    건물 위치
                  </label>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {BUILDING_OPTIONS.map((b) => (
                      <option key={b} value={b} className="dark:bg-slate-800">
                        {b === "전체" ? "건물 전체" : b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                    <Utensils className="w-3.5 h-3.5 mr-1" />
                    음식 종류
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c} className="dark:bg-slate-800">
                        {c === "전체" ? "카테고리 전체" : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start CTA */}
              <div className="pt-2">
                {eligibleRestaurants.length < 2 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
                    선택한 필터 조건에 해당하는 식당이 2곳 미만입니다. 필터를 완화해주세요!
                  </div>
                ) : (
                  <button
                    onClick={startTournament}
                    className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Flame className="w-5 h-5 animate-bounce" />
                    <span>⚔️ {roundSize}강 월드컵 시작하기!</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center space-x-3 text-[11px] text-slate-400 dark:text-slate-500 pt-2">
                <span>💡 키보드 단축키 지원: 왼쪽 [1 또는 ←], 오른쪽 [2 또는 →]</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PHASE 2: MATCH SCREEN (1 vs 1)                            */}
          {/* ========================================================= */}
          {phase === "playing" && leftCandidate && rightCandidate && (
            <div className="space-y-4">
              {/* Progress & Round Info Bar */}
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                    {getRoundTitle()}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    진행률: {completedMatchesCount + 1} / {totalMatchesInTournament} 매치
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (completedMatchesCount / totalMatchesInTournament) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* 1 vs 1 Arena */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {/* Center VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-xl shadow-orange-500/40 border-4 border-white dark:border-slate-900 animate-pulse">
                    VS
                  </div>
                </div>

                {/* Left Restaurant Card */}
                {(() => {
                  const highlights = getRestaurantHighlights(leftCandidate);
                  const isChosen = selectionAnimation === "left";
                  const isDefeated = selectionAnimation === "right";

                  return (
                    <div
                      onClick={() => handleSelectWinner("left")}
                      className={`group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-2 transition-all duration-200 transform flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-xl ${
                        isChosen
                          ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02] bg-emerald-50/20 dark:bg-emerald-950/20"
                          : isDefeated
                          ? "opacity-30 grayscale scale-95 border-slate-200 dark:border-slate-700 pointer-events-none"
                          : "border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:-translate-y-1"
                      }`}
                    >
                      {/* Keyboard badge */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1">
                        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
                          [1] or [←]
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pr-14">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1">
                            <Building2 className="w-3 h-3 mr-0.5" />
                            {leftCandidate.building || "기타"}
                          </span>
                          {leftCandidate.categories?.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                          {leftCandidate.name}
                        </h4>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-3 text-xs font-bold">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400 mr-1" />
                            <span>{leftCandidate.avgRating.toFixed(1)}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                              ({leftCandidate.reviewCount}개)
                            </span>
                          </div>
                          {leftCandidate.revisitRate > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              재방문 {leftCandidate.revisitRate}%
                            </span>
                          )}
                        </div>

                        {/* Menus */}
                        {highlights.menus.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1">
                              인턴 주문 메뉴:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {highlights.menus.map((m) => (
                                <span
                                  key={m}
                                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40"
                                >
                                  🍽️ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Intern comment bubble */}
                        {highlights.comment && (
                          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 relative">
                            <div className="flex items-center space-x-1.5 mb-1">
                              <span
                                className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded ${
                                  AUTHOR_COLORS[highlights.comment.author]?.bg ||
                                  "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {highlights.comment.author}
                              </span>
                              <span className="text-[10px] text-slate-400">인턴 한줄평</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium italic line-clamp-2">
                              &ldquo;{highlights.comment.text}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pick CTA Button */}
                      <button className="mt-5 w-full py-3 rounded-2xl bg-orange-50 dark:bg-orange-950/50 group-hover:bg-orange-500 dark:group-hover:bg-orange-600 text-orange-600 dark:text-orange-300 group-hover:text-white font-extrabold text-sm border border-orange-200 dark:border-orange-800 group-hover:border-transparent transition flex items-center justify-center space-x-1.5">
                        <span>👉 이 식당 선택하기</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Right Restaurant Card */}
                {(() => {
                  const highlights = getRestaurantHighlights(rightCandidate);
                  const isChosen = selectionAnimation === "right";
                  const isDefeated = selectionAnimation === "left";

                  return (
                    <div
                      onClick={() => handleSelectWinner("right")}
                      className={`group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border-2 transition-all duration-200 transform flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-xl ${
                        isChosen
                          ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02] bg-emerald-50/20 dark:bg-emerald-950/20"
                          : isDefeated
                          ? "opacity-30 grayscale scale-95 border-slate-200 dark:border-slate-700 pointer-events-none"
                          : "border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:-translate-y-1"
                      }`}
                    >
                      {/* Keyboard badge */}
                      <div className="absolute top-4 right-4 flex items-center space-x-1">
                        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
                          [2] or [→]
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pr-14">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1">
                            <Building2 className="w-3 h-3 mr-0.5" />
                            {rightCandidate.building || "기타"}
                          </span>
                          {rightCandidate.categories?.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                          {rightCandidate.name}
                        </h4>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-3 text-xs font-bold">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400 mr-1" />
                            <span>{rightCandidate.avgRating.toFixed(1)}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                              ({rightCandidate.reviewCount}개)
                            </span>
                          </div>
                          {rightCandidate.revisitRate > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              재방문 {rightCandidate.revisitRate}%
                            </span>
                          )}
                        </div>

                        {/* Menus */}
                        {highlights.menus.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1">
                              인턴 주문 메뉴:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {highlights.menus.map((m) => (
                                <span
                                  key={m}
                                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40"
                                >
                                  🍽️ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Intern comment bubble */}
                        {highlights.comment && (
                          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 relative">
                            <div className="flex items-center space-x-1.5 mb-1">
                              <span
                                className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded ${
                                  AUTHOR_COLORS[highlights.comment.author]?.bg ||
                                  "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {highlights.comment.author}
                              </span>
                              <span className="text-[10px] text-slate-400">인턴 한줄평</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium italic line-clamp-2">
                              &ldquo;{highlights.comment.text}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pick CTA Button */}
                      <button className="mt-5 w-full py-3 rounded-2xl bg-orange-50 dark:bg-orange-950/50 group-hover:bg-orange-500 dark:group-hover:bg-orange-600 text-orange-600 dark:text-orange-300 group-hover:text-white font-extrabold text-sm border border-orange-200 dark:border-orange-800 group-hover:border-transparent transition flex items-center justify-center space-x-1.5">
                        <span>👉 이 식당 선택하기</span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition inline-flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>처음부터 다시 설정하기</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PHASE 3: WINNER CELEBRATION SCREEN                        */}
          {/* ========================================================= */}
          {phase === "winner" && winner && (
            <div className="max-w-xl mx-auto py-4 space-y-6 text-center animate-in zoom-in-95 duration-300">
              {/* Golden Trophy */}
              <div className="relative inline-block">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 flex items-center justify-center text-white shadow-2xl shadow-amber-500/50 mx-auto transform hover:scale-105 transition">
                  <Trophy className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 mb-2">
                  <span>🏆 오늘 점심 최종 챔피언</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  오늘의 점심은 바로 여기!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  치열한 토너먼트를 뚫고 인턴들의 선택을 받은 최고의 맛집입니다.
                </p>
              </div>

              {/* Champion Card */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-amber-400/80 dark:border-amber-500/80 shadow-xl shadow-amber-500/10 text-left space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1">
                      <Building2 className="w-3 h-3 mr-0.5" />
                      {winner.building || "기타"}
                    </span>
                    {winner.categories?.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-black text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{winner.avgRating.toFixed(1)}점</span>
                    <span className="text-slate-400 font-normal">({winner.reviewCount}개 리뷰)</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                    {winner.name}
                  </h4>
                </div>

                {/* Menus */}
                {winner.menus && winner.menus.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                      추천 주문 메뉴:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {winner.menus.map((m) => (
                        <span
                          key={m}
                          className="px-3 py-1 text-xs font-bold rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                        >
                          🍲 {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intern Comments list */}
                {Object.keys(winner.authorComments || {}).length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block">
                      인턴들의 실제 평:
                    </span>
                    {Object.entries(winner.authorComments).map(([author, comment]) => (
                      <div
                        key={author}
                        className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded shrink-0 ${
                            AUTHOR_COLORS[author]?.bg || "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {author}
                        </span>
                        <span className="italic">&ldquo;{comment}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onOpenDetail(winner);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Utensils className="w-4 h-4" />
                  <span>식당 상세 & 리뷰 전체 보기</span>
                </button>

                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(
                    `${winner.name} ${winner.building || ""}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>네이버 지도 검색</span>
                </a>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>한 판 더 하기!</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
