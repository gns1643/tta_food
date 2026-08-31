"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Utensils, ChevronDown, Check, X, Sparkles } from "lucide-react";

interface MenuComboboxProps {
  value: string;
  onChange: (val: string) => void;
  availableMenus: string[];
  placeholder?: string;
  accentColor?: "orange" | "blue";
}

export default function MenuCombobox({
  value,
  onChange,
  availableMenus,
  placeholder = "예: 얼큰 순대국, 안심 돈가스, 마라탕...",
  accentColor = "orange",
}: MenuComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter available menus based on current input
  const filteredMenus = useMemo(() => {
    if (!value.trim()) return availableMenus;
    const query = value.trim().toLowerCase();
    return availableMenus.filter((m) => m.toLowerCase().includes(query));
  }, [availableMenus, value]);

  const isExactMatch = useMemo(() => {
    if (!value.trim()) return false;
    return availableMenus.some((m) => m.trim().toLowerCase() === value.trim().toLowerCase());
  }, [availableMenus, value]);

  const handleSelect = (menuName: string) => {
    onChange(menuName);
    setIsOpen(false);
  };

  const isOrange = accentColor === "orange";
  const focusRingClass = isOrange ? "focus:ring-orange-500" : "focus:ring-blue-500";
  const activeBgClass = isOrange ? "bg-orange-500 text-white" : "bg-blue-500 text-white";
  const hoverTextClass = isOrange
    ? "hover:text-orange-600 dark:hover:text-orange-400"
    : "hover:text-blue-600 dark:hover:text-blue-400";
  const highlightItemClass = isOrange
    ? "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold"
    : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold";

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Combobox Input Container */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Utensils className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className={`w-full pl-10 pr-16 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 ${focusRingClass} transition font-medium`}
        />

        {/* Right action buttons: Clear & Dropdown Chevron */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-0.5">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              title="입력 내용 지우기"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            title="메뉴 목록 열기/닫기"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Dropdown Menu Popup */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
            {/* Header */}
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>이 식당의 이전 주문 메뉴</span>
              </span>
              <span>{availableMenus.length}개 등록됨</span>
            </div>

            {/* Menu List */}
            {availableMenus.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                <p>등록된 이전 주문 메뉴가 없습니다.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  직접 메뉴 이름을 입력하시면 자동으로 등록됩니다!
                </p>
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left p-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-between"
                >
                  <span>
                    새 메뉴 직접 입력: <strong className="font-bold text-orange-600 dark:text-orange-400">&ldquo;{value}&rdquo;</strong>
                  </span>
                  <Check className="w-3.5 h-3.5 text-orange-500" />
                </button>
              </div>
            ) : (
              <div className="p-1.5 space-y-1">
                {filteredMenus.map((menuItem) => {
                  const isSelected = menuItem === value.trim();
                  return (
                    <button
                      type="button"
                      key={menuItem}
                      onClick={() => handleSelect(menuItem)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        isSelected
                          ? highlightItemClass
                          : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-sm">🍲</span>
                        <span className="font-medium truncate">{menuItem}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />}
                    </button>
                  );
                })}

                {/* Direct input option if typed something not in list */}
                {value.trim() && !isExactMatch && (
                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between"
                    >
                      <span className="truncate">
                        + 새 메뉴로 사용: <strong className="text-slate-900 dark:text-white">&ldquo;{value}&rdquo;</strong>
                      </span>
                      <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Suggestion Pills */}
      {availableMenus.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-0.5 flex items-center">
            빠른 선택:
          </span>
          {availableMenus.map((item) => {
            const isSelected = value.trim() === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => handleSelect(item)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  isSelected
                    ? `${activeBgClass} shadow-xs font-bold`
                    : `bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 ${hoverTextClass} border border-slate-200/60 dark:border-slate-700`
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
