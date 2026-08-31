"use client";

import React from "react";
import { Sparkles, Rocket, Palette, Wrench, Calendar, CheckCircle2, History, Moon, Edit3, ArrowDownAZ } from "lucide-react";

interface PatchItem {
  version: string;
  date: string;
  title: string;
  tag: string;
  tagColor: string;
  changes: {
    type: "feature" | "design" | "fix";
    title: string;
    description: string;
  }[];
}

const PATCH_HISTORY: PatchItem[] = [
  {
    version: "v1.5.0",
    date: "2026년 8월 31일",
    title: "노션 점심 방문 달력 뷰(Calendar View) 공식 출시 📅",
    tag: "대규모 업데이트",
    tagColor: "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    changes: [
      {
        type: "feature",
        title: "월별 인터랙티브 달력 뷰 추가",
        description:
          "기존 노션에서 보던 방문일 기준 캘린더를 웹사이트에서 그대로 확인하고 탐색할 수 있는 '달력 뷰' 탭이 신설되었습니다. 날짜별로 방문한 식당, 작성자별 컬러 뱃지, 별점을 한눈에 파악할 수 있습니다.",
      },
      {
        type: "feature",
        title: "날짜별 평론 즉시 등록 & 식당 상세 연동",
        description:
          "달력의 특정 날짜나 '+' 버튼을 클릭하면 해당 날짜가 기본 설정된 평론 작성 모달이 즉시 열리며, 달력의 식당 카드를 클릭하면 식당 상세 정보와 모든 평론을 바로 조회할 수 있습니다.",
      },
      {
        type: "feature",
        title: "월간 방문 통계 & 인턴/건물 필터링",
        description:
          "해당 월의 총 방문 횟수, 평균 별점, 이달의 최다 방문 식당 요약 정보를 제공하며, 인턴(지훈/준협/윤섭/동찬) 및 건물별로 필터링하여 맞춤 캘린더를 확인할 수 있습니다.",
      },
    ],
  },
  {
    version: "v1.4.1",
    date: "2026년 8월 27일",
    title: "기본 정렬 기준 '최신순'으로 변경 📅",
    tag: "UX 개선",
    tagColor: "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    changes: [
      {
        type: "feature",
        title: "기본 정렬 최신순 적용",
        description:
          "메인 화면 진입 시 기본 정렬이 '최신순'으로 적용되어, 새로 등록된 식당이나 가장 최근에 평론이 작성된 식당이 상단에 우선적으로 노출됩니다.",
      },
    ],
  },
  {
    version: "v1.4.0",
    date: "2026년 8월 26일",
    title: "평론 수정 기능 추가 ✏️",
    tag: "기능 추가",
    tagColor: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    changes: [
      {
        type: "feature",
        title: "작성한 평론 자유롭게 수정 가능",
        description:
          "식당 상세 화면에서 각 인턴 평론 카드 우측 상단의 '✏️ 수정' 버튼을 눌러 별점, 한줄평, 추천 메뉴, 상세 평론, 재방문 여부를 언제든 수정하고 노션 DB에 실시간 반영할 수 있습니다.",
      },
    ],
  },
  {
    version: "v1.3.1",
    date: "2026년 8월 26일",
    title: "재방문율(%) 산출 로직 고도화 🎯",
    tag: "통계 로직 개선",
    tagColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    changes: [
      {
        type: "fix",
        title: "실제 평론 작성자 기준 재방문율 집계",
        description:
          "기존 노션 템플릿 생성 시 남겨진 미작성 빈 평론 항목을 모수에서 제외하고, 실제로 평점이나 후기를 남긴 인턴 기준으로만 재방문 희망률(%)을 정확하게 계산하도록 개선했습니다.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "2026년 8월 26일",
    title: "야간 모드 (Dark Mode) 공식 지원 🌙",
    tag: "UI / 테마 업데이트",
    tagColor: "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    changes: [
      {
        type: "design",
        title: "다크 테마 (야간 모드) 추가",
        description:
          "눈의 피로를 덜어주는 고대비 다크 모드가 추가되었습니다. 상단 헤더의 달/해(🌙/☀️) 아이콘을 클릭하여 언제든 테마를 전환할 수 있으며, 설정한 모드는 브라우저에 자동 저장됩니다.",
      },
      {
        type: "design",
        title: "전체 화면 다크 모드 최적화",
        description:
          "음식점 카드, 평론 작성/등록 모달, 랭킹 통계 대시보드 및 타임라인의 가독성을 다크 모드에 맞춰 섬세하게 조정했습니다.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "2026년 8월 26일",
    title: "평점 슬라이더 입력 & 패치노트 신설",
    tag: "기능 업데이트",
    tagColor: "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    changes: [
      {
        type: "feature",
        title: "0.1단위 정밀 평점 슬라이더 & 숫자 입력 추가",
        description:
          "평론 작성 시 마우스/터치 드래그로 조절 가능한 슬라이더 바와 소수점(예: 4.3, 3.8)을 바로 타이핑할 수 있는 숫자 입력창이 추가되었습니다. 빠른 선택 버튼(1.0, 2.0, 3.0, 3.5, 4.0, 4.5, 5.0)도 함께 제공됩니다.",
      },
      {
        type: "feature",
        title: "패치노트(Patch Notes) 섹션 추가",
        description:
          "웹사이트의 새로운 기능과 업데이트 내역을 인턴들과 함께 확인할 수 있는 패치노트 탭이 신설되었습니다.",
      },
      {
        type: "design",
        title: "사이트 공식 파비콘 & 북마크/홈화면 아이콘 적용",
        description:
          "브라우저 탭과 즐겨찾기, 스마트폰 홈 화면 추가 시 예쁜 🍽️ 오렌지 스퀘어 아이콘이 표시되도록 개선되었습니다.",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "2026년 8월 26일",
    title: "노션 DB 건물 및 카테고리 속성 정밀 동기화",
    tag: "데이터 & 필터 개선",
    tagColor: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    changes: [
      {
        type: "fix",
        title: "건물(위치) 컬럼 정확 매핑 (누리꿈 / 사보이 / kgit)",
        description:
          "노션 음식점 DB의 '건물' 컬럼과 100% 일치하도록 매핑을 수정하여 상암동 주요 빌딩별 맛집 필터링이 정상 작동합니다.",
      },
      {
        type: "feature",
        title: "음식 종류(한식, 일식, 중식, 양식, 분식 등) 필터 추가",
        description:
          "노션의 카테고리 속성을 연동하여 원하는 음식 종류별로 식당을 모아볼 수 있는 필터 버튼이 추가되었습니다.",
      },
      {
        type: "feature",
        title: "식당 등록 모달 업그레이드",
        description:
          "새 음식점을 등록할 때 건물, 음식 카테고리(다중 선택), 가격대 정보를 함께 입력하여 노션에 저장할 수 있습니다.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026년 8월 26일",
    title: "TTA 인턴 맛집 평론 웹 플랫폼 공식 런칭 🎉",
    tag: "최초 런칭",
    tagColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    changes: [
      {
        type: "feature",
        title: "노션 DB 실시간 연동 (음식점 DB + 평론 DB)",
        description:
          "노션 공식 API를 통해 인턴들의 점심 맛집 데이터베이스와 평론을 실시간으로 읽고 쓰는 풀스택 웹 애플리케이션 구축.",
      },
      {
        type: "feature",
        title: "원클릭 평론 작성 (노션 템플릿 버튼 웹 구현)",
        description:
          "인턴(작성자) 선택, 별점, 한줄평, 추천 메뉴, 상세 평론, 재방문 의사를 입력하면 노션에 즉시 생성 및 음식점 Relation이 자동 매핑됩니다.",
      },
      {
        type: "feature",
        title: "명예의 전당 & 통계 대시보드",
        description:
          "1위~3위 맛집 포디움, 재방문 희망률 100% 식당 모아보기, 리뷰왕 인턴 랭킹, 실시간 최근 한줄평 피드를 제공합니다.",
      },
      {
        type: "feature",
        title: "Vercel 클라우드 24/7 무료 배포 및 CI/CD 자동화",
        description:
          "내 컴퓨터가 꺼져 있어도 스마트폰과 PC 웹 링크로 언제든 접속 가능한 상시 가동 환경 구축.",
      },
    ],
  },
];

export default function PatchNotesView() {
  const getTypeBadge = (type: "feature" | "design" | "fix") => {
    switch (type) {
      case "feature":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300">
            <Rocket className="w-3 h-3" />
            <span>신규 기능</span>
          </span>
        );
      case "design":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
            <Palette className="w-3 h-3" />
            <span>UI / 디자인</span>
          </span>
        );
      case "fix":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
            <Wrench className="w-3 h-3" />
            <span>개선 / 버그 수정</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/10 relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3">
            <History className="w-3.5 h-3.5" />
            <span>업데이트 히스토리</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">TTA 맛집 평론 패치노트</h2>
          <p className="text-xs sm:text-sm text-orange-100 mt-2 max-w-xl leading-relaxed">
            인턴분들의 더 즐거운 점심 식사를 위해 지속적으로 업데이트되고 있습니다. 새롭게 추가된 기능과 개선 사항을 날짜순으로 확인해 보세요!
          </p>
        </div>

        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-orange-200 dark:border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-10">
        {PATCH_HISTORY.map((patch) => (
          <div key={patch.version} className="relative group">
            {/* Timeline Pin Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-orange-500 shadow-md group-hover:scale-125 transition-transform flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
            </div>

            {/* Version Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-black text-slate-900 dark:text-white">{patch.version}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${patch.tagColor}`}>
                    {patch.tag}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{patch.date}</span>
                </div>
              </div>

              {/* Version Title */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{patch.title}</h3>

              {/* Detailed Changes */}
              <div className="space-y-3.5 pt-1">
                {patch.changes.map((change, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(change.type)}
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{change.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                      {change.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}