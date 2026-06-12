"use client";

import { Modal } from "@junds/ui";
import type { ReactNode } from "react";

interface FZoneHelpModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: TabKey;
}

type TabKey = "F존포착" | "F존+" | "SF존" | "골드존" | "38스윙";

interface TabContent {
  headline: string;
  oneLiner: string;
  bullets: string[];
  example?: string;
  /** 탭 컬러 - 헤더/배지/포인트에 사용 */
  color: string;
  /** 그라데이션용 두 번째 컬러 */
  colorB: string;
  emoji: string;
}

const TAB_CONTENT: Record<TabKey, TabContent> = {
  F존포착: {
    headline: "매수 후보 구간을 알고리즘이 미리 잡아둡니다",
    oneLiner:
      "주가가 추세 하단의 1차 매수 영역(B1)·2차 매수 영역(B2)·3차 매수 영역(B3)에 닿았는지 한눈에 보여줍니다.",
    bullets: [
      "현재가가 B1·B2·B3 중 어디에 있는지 빨간 강조 라벨로 표시됩니다.",
      "‘F존임박’은 곧 B1을 터치할 가능성이 높은 종목, ‘B1·B2’는 이미 해당 구간에 진입한 종목입니다.",
      "저항선은 단기 반등 시 부딪히기 쉬운 위쪽 가격대입니다.",
    ],
    example:
      "예) ‘대원전선 B1 17,940’은 현재가가 17,940원 부근에서 1차 매수 후보 구간에 진입했다는 뜻입니다.",
    color: "var(--bm-up)",
    colorB: "#fb923c",
    emoji: "🎯",
  },
  "F존+": {
    headline: "신규 편입 + 프로그램 매매 흐름까지 함께 봅니다",
    oneLiner:
      "오늘 새로 F존 후보로 들어온 종목과, 외국인·기관의 프로그램 순매수/매도 규모를 묶어서 보여줍니다.",
    bullets: [
      "‘NEW’ 핑크 배지는 오늘 처음 F존+에 편입된 종목입니다.",
      "프로그램 컬럼이 양수(빨강)면 매수 우위, 음수(파랑)면 매도 우위입니다.",
      "B1·B2 두 줄은 같은 종목의 1차/2차 매수 후보 가격을 동시에 보여줍니다.",
    ],
    color: "#ec4899",
    colorB: "#8b5cf6",
    emoji: "✨",
  },
  SF존: {
    headline: "Strong F존 — 강한 매수 신호가 중첩된 구간",
    oneLiner:
      "거래대금·추세·이동평균선 등 여러 조건을 동시에 만족한 ‘프리미엄 F존’만 따로 모은 탭입니다.",
    bullets: [
      "F존포착보다 조건이 까다롭기 때문에 후보 종목 수가 더 적습니다.",
      "신호 강도가 높은 만큼 진입가·손절가를 더 명확히 잡을 수 있습니다.",
    ],
    color: "#8b5cf6",
    colorB: "var(--bm-down)",
    emoji: "💎",
  },
  골드존: {
    headline: "중장기 매수 누적 구간(G1·G2·G3)",
    oneLiner:
      "단기 매수 구간(B1~B3)이 아닌, 주봉·월봉 기준의 장기 누적 매수 후보 가격대를 표시합니다.",
    bullets: [
      "G1이 가장 가까운 1차 누적 후보, G3로 갈수록 더 깊은 조정 시의 분할매수 후보입니다.",
      "단기 매매보다 ‘분할 적립’ 관점으로 활용하기 좋습니다.",
    ],
    color: "var(--bm-warning)",
    colorB: "var(--bm-warning)",
    emoji: "🏆",
  },
  "38스윙": {
    headline: "38% 되돌림 자리에서 짧게 잡는 단타 후보",
    oneLiner:
      "직전 상승 폭의 약 38% 구간(피보나치 되돌림)까지 눌림이 나온 종목을, 단기 스윙용으로 추려서 보여줍니다.",
    bullets: [
      "J1·J2·J3는 38스윙 진입 후보가, 가까운 순서대로 표시됩니다(J1=1차).",
      "보통 며칠~2주 내 단기 반등을 노리는 자리이므로, 손절·목표가를 짧게 잡는 것이 일반적입니다.",
      "장기 추세가 무너진 종목에서는 38스윙이 실패할 확률이 높습니다.",
    ],
    example:
      "예) ‘10,000원→13,000원’ 상승 후 11,860원 부근까지 눌리면 38% 되돌림 자리입니다.",
    color: "var(--bm-cat-3)",
    colorB: "#0ea5e9",
    emoji: "⚡",
  },
};

interface Term {
  term: string;
  meaning: string;
  color: string;
}

const SHARED_TERMS: Term[] = [
  {
    term: "B1·B2·B3",
    meaning:
      "단기 매수 후보 가격(1차→3차). 숫자가 커질수록 더 깊게 조정받았을 때의 분할매수 자리.",
    color: "var(--bm-up)",
  },
  {
    term: "G1·G2·G3",
    meaning: "골드존 — 중장기 누적 매수 후보 가격대 (1차~3차).",
    color: "var(--bm-warning)",
  },
  {
    term: "J1·J2·J3",
    meaning: "38스윙 — 단기 되돌림 진입 후보 가격대 (1차~3차).",
    color: "var(--bm-cat-3)",
  },
  {
    term: "저항선",
    meaning: "단기 반등 시 매물벽으로 작용하기 쉬운 위쪽 가격.",
    color: "#0ea5e9",
  },
  {
    term: "F존임박",
    meaning: "아직 B1을 터치하진 않았지만 곧 진입할 가능성이 높은 상태.",
    color: "#a855f7",
  },
];

export function FZoneHelpModal({
  open,
  onClose,
  initialTab = "F존포착",
}: FZoneHelpModalProps) {
  const tabs: TabKey[] = ["F존포착", "F존+", "SF존", "골드존", "38스윙"];
  const ordered = [
    initialTab,
    ...tabs.filter((t) => t !== initialTab),
  ] as TabKey[];

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header onClose={onClose}>F존 사용법</Modal.Header>
      <div className="max-h-[78vh] overflow-y-auto">
        {/* Hero — gradient intro */}
        <div
          className="px-6 py-5 relative overflow-hidden"
          style={{
            background: "var(--bm-soft-100)",
            borderBottom: "1px solid var(--bm-border)",
          }}
        >
          <div className="flex items-start gap-4">
            <span
              className="inline-flex items-center justify-center rounded-2xl shrink-0"
              style={{
                width: 56,
                height: 56,
                background: "var(--bm-warning)",
                fontSize: 28,
              }}
            >
              🎯
            </span>
            <div className="min-w-0">
              <p className="text-[18px] font-extrabold leading-tight">
                자주 보는 매수 자리, 알고리즘이 자동으로 잡아드려요
              </p>
              <p
                className="text-[13px] mt-1.5 leading-relaxed"
                style={{ color: "var(--bm-muted)" }}
              >
                F존은 추세·이동평균·거래대금을 조합한{" "}
                <strong style={{ color: "var(--bm-text)" }}>매수 후보 가격 구간</strong>
                입니다. 매수·매도 권유가 아닌 보조 지표로 활용하세요.
              </p>
            </div>
          </div>

          {/* Quick chips */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {SHARED_TERMS.slice(0, 3).map((t) => (
              <span
                key={t.term}
                className="bm-pill text-[11px] font-extrabold"
                style={{
                  background: `color-mix(in srgb, ${t.color} 12%, transparent)`,
                  color: t.color,
                  border: `1px solid color-mix(in srgb, ${t.color} 20%, transparent)`,
                  padding: "3px 10px",
                }}
              >
                {t.term}
              </span>
            ))}
          </div>
        </div>

        <div className="px-5 py-5">
          {/* 카드 읽는 법 */}
          <Section
            title="카드 읽는 법"
            icon="📖"
            accent="var(--bm-up)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  title: "현재가 색상",
                  body: "빨강 = 상승, 파랑 = 하락",
                  color: "var(--bm-up)",
                },
                {
                  title: "우측 상단 배지",
                  body: "F존임박 / B1 / B2 — 종목 상태 요약",
                  color: "#a855f7",
                },
                {
                  title: "가격 정렬 순서",
                  body: "위에서 아래로 가격이 높은 → 낮은 순",
                  color: "#0ea5e9",
                },
                {
                  title: "하이라이트 라인",
                  body: "현재 상태와 일치하는 줄에 빨간 테두리",
                  color: "#fb923c",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-xl px-3.5 py-2.5"
                  style={{
                    border: "1px solid var(--bm-border)",
                    background: "var(--bm-card)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ background: c.color }}
                    />
                    <span className="text-[12.5px] font-extrabold">
                      {c.title}
                    </span>
                  </div>
                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: "var(--bm-muted)" }}
                  >
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* 탭별 설명 */}
          <Section title="탭별 의미" icon="🗂️" accent="#a855f7">
            <div className="space-y-3">
              {ordered.map((tab, i) => {
                const content = TAB_CONTENT[tab];
                const isFirst = i === 0;
                return (
                  <article
                    key={tab}
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: `1px solid ${
                        isFirst
                          ? `color-mix(in srgb, ${content.color} 33%, transparent)`
                          : "var(--bm-border)"
                      }`,
                      boxShadow: isFirst
                        ? `0 4px 14px color-mix(in srgb, ${content.color} 10%, transparent)`
                        : undefined,
                    }}
                  >
                    <header
                      className="px-3.5 py-2.5 flex items-center gap-2"
                      style={{
                        background: `color-mix(in srgb, ${content.color} 6%, transparent)`,
                        borderBottom: "1px solid var(--bm-border)",
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center rounded-lg shrink-0"
                        style={{
                          width: 30,
                          height: 30,
                          background: content.color,
                          fontSize: 16,
                        }}
                      >
                        {content.emoji}
                      </span>
                      <span
                        className="bm-pill text-[11px] font-extrabold"
                        style={{
                          background: content.color,
                          color: "white",
                          padding: "2px 10px",
                        }}
                      >
                        {tab}
                      </span>
                      {isFirst ? (
                        <span
                          className="bm-pill text-[10px] font-extrabold ml-1"
                          style={{
                            background: "var(--bm-success-bg)",
                            color: "var(--bm-success)",
                            padding: "1px 6px",
                          }}
                        >
                          현재 탭
                        </span>
                      ) : null}
                      <span className="text-[13px] font-extrabold ml-1 truncate">
                        {content.headline}
                      </span>
                    </header>
                    <div className="px-3.5 py-3">
                      <p
                        className="text-[12.5px] leading-relaxed"
                        style={{ color: "var(--bm-muted)" }}
                      >
                        {content.oneLiner}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {content.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex gap-2 text-[12.5px] leading-relaxed"
                          >
                            <span
                              className="shrink-0 mt-[7px] size-1.5 rounded-full"
                              style={{ background: content.color }}
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      {content.example ? (
                        <div
                          className="mt-3 rounded-lg px-3 py-2 text-[12px] leading-relaxed flex gap-2"
                          style={{
                            background: `color-mix(in srgb, ${content.color} 4%, transparent)`,
                            border: `1px dashed color-mix(in srgb, ${content.color} 33%, transparent)`,
                          }}
                        >
                          <span
                            className="text-[10.5px] font-extrabold shrink-0"
                            style={{
                              color: content.color,
                              minWidth: 32,
                            }}
                          >
                            예시
                          </span>
                          <span style={{ color: "var(--bm-text)" }}>
                            {content.example.replace(/^예\)\s*/, "")}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>

          {/* 용어 사전 */}
          <Section title="용어 한눈에 보기" icon="📚" accent="var(--bm-accent-strong)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHARED_TERMS.map(({ term, meaning, color }) => (
                <div
                  key={term}
                  className="rounded-lg px-3 py-2.5 flex gap-2.5"
                  style={{
                    background: "var(--bm-soft-100)",
                    border: "1px solid var(--bm-border)",
                  }}
                >
                  <span
                    className="bm-pill text-[10.5px] font-extrabold shrink-0 self-start"
                    style={{
                      background: `color-mix(in srgb, ${color} 12%, transparent)`,
                      color,
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {term}
                  </span>
                  <span
                    className="text-[12px] leading-snug"
                    style={{ color: "var(--bm-text)" }}
                  >
                    {meaning}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <div
            className="mt-5 rounded-lg px-3 py-2.5 text-[11.5px] leading-relaxed flex gap-2"
            style={{
              background: "var(--bm-warning-bg)",
              border: "1px solid color-mix(in srgb, var(--bm-warning) 30%, transparent)",
              color: "color-mix(in srgb, var(--bm-warning) 40%, var(--bm-text))",
            }}
          >
            <span className="shrink-0">⚠️</span>
            <span>
              모든 지표는 시스템 계산값이며 매수·매도 권유가 아닙니다. 최종 판단과 책임은 투자자 본인에게 있습니다.
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Section({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-5 first:mt-0">
      <h4 className="flex items-center gap-2 text-[13.5px] font-extrabold mb-2.5">
        <span
          className="inline-flex items-center justify-center rounded-md shrink-0"
          style={{
            width: 22,
            height: 22,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            fontSize: 12,
          }}
        >
          {icon}
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}
