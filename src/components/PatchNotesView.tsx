"use client";

import React from "react";
import { Sparkles, Rocket, Palette, Wrench, Calendar, CheckCircle2, History } from "lucide-react";

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
    version: "v1.2.0",
    date: "2026년 8월 26일",
    title: "평점 슬라이더 입력 & 패치노트 신설",
    tag: "기능 업데이트",
    tagColor: "bg-orange-100 text-orange-800 border-orange-200",
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
    tagColor: "bg-amber-100 text-amber-800 border-amber-200",
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
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
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
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-700">
            <Rocket className="w-3 h-3" />
            <span>신규 기능</span>
          </span>
        );
      case "design":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700">
            <Palette className="w-3 h-3" />
            <span>UI / 디자인</span>
          </span>
        );
      case "fix":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">
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
      <div className="relative border-l-2 border-orange-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-10">
        {PATCH_HISTORY.map((patch, patchIdx) => (
          <div key={patch.version} className="relative group">
            {/* Timeline Pin Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-orange-500 shadow-md group-hover:scale-125 transition-transform flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
            </div>

            {/* Version Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-black text-slate-900">{patch.version}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${patch.tagColor}`}>
                    {patch.tag}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{patch.date}</span>
                </div>
              </div>

              {/* Version Title */}
              <h3 className="text-base font-bold text-slate-900">{patch.title}</h3>

              {/* Detailed Changes */}
              <div className="space-y-3.5 pt-1">
                {patch.changes.map((change, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(change.type)}
                      <h4 className="text-sm font-bold text-slate-900">{change.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1">
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