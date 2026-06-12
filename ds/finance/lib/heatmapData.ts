import type { HeatmapCell } from "../MarketHeatmap";

export interface HeatmapGroup {
  name: string;
  cells: HeatmapCell[];
}

export const HEATMAP_GROUPS: HeatmapGroup[] = [
  {
    name: "반도체",
    cells: [
      { name: "삼성전자", ticker: "삼성전자", size: 1562, change: 14.95, price: 267500 },
      { name: "SK하이닉스", ticker: "SK하이닉스", size: 1138, change: 10.44, price: 1598000 },
      { name: "한미반도체", ticker: "한미반도체", size: 365, change: 1.72, price: 384500 },
      { name: "DB하이텍", ticker: "DB하이텍", size: 95, change: 4.21, price: 92500 },
      { name: "원익IPS", ticker: "원익IPS", size: 78, change: -1.4, price: 41200 },
      { name: "리노공업", ticker: "리노공업", size: 154, change: 2.8, price: 234000 },
      { name: "제주반도체", ticker: "제주반도체", size: 18, change: 6.42, price: 11890 },
    ],
  },
  {
    name: "증권/금융",
    cells: [
      { name: "미래에셋증권", ticker: "미래에셋", size: 488, change: 24.18, price: 87300 },
      { name: "삼성증권", ticker: "삼성증권", size: 135, change: 9.93, price: 151600 },
      { name: "한화투자증권", ticker: "한화투자", size: 95, change: 14.29, price: 9360 },
      { name: "유안타증권", ticker: "유안타", size: 60, change: 29.52, price: 7810 },
      { name: "KB금융", ticker: "KB금융", size: 280, change: 3.14, price: 78400 },
      { name: "신한지주", ticker: "신한지주", size: 240, change: 1.92, price: 51200 },
    ],
  },
  {
    name: "송배전/전력",
    cells: [
      { name: "LS ELECTRIC", ticker: "LS ELECTRIC", size: 95, change: 7.48, price: 316000 },
      { name: "대한전선", ticker: "대한전선", size: 127, change: 12.52, price: 68300 },
      { name: "선도전기", ticker: "선도전기", size: 22, change: 22.68, price: 13470 },
      { name: "KBI메탈", ticker: "KBI메탈", size: 12, change: 29.86, price: 8610 },
      { name: "제룡전기", ticker: "제룡전기", size: 28, change: 8.92, price: 31250 },
      { name: "보성파워텍", ticker: "보성파워텍", size: 8, change: 7.04, price: 15360 },
    ],
  },
  {
    name: "유리기판/디스플레이",
    cells: [
      { name: "SKC", ticker: "SKC", size: 61, change: 30.0, price: 161200 },
      { name: "필옵틱스", ticker: "필옵틱스", size: 60, change: 27.44, price: 62000 },
      { name: "켐트로닉스", ticker: "켐트로닉스", size: 32, change: 17.21, price: 44600 },
      { name: "HB테크놀러지", ticker: "HB테크", size: 8, change: 29.89, price: 4020 },
    ],
  },
  {
    name: "자동차/2차전지",
    cells: [
      { name: "현대차", ticker: "현대차", size: 1124, change: 1.86, price: 549000 },
      { name: "기아", ticker: "기아", size: 460, change: 0.89, price: 102000 },
      { name: "삼성SDI", ticker: "삼성SDI", size: 564, change: -0.57, price: 701000 },
      { name: "LG에너지솔루션", ticker: "LG엔솔", size: 880, change: -1.15, price: 376500 },
      { name: "에코프로비엠", ticker: "에코프로BM", size: 198, change: -2.4, price: 184500 },
    ],
  },
  {
    name: "바이오/헬스",
    cells: [
      { name: "삼성바이오로직스", ticker: "삼바", size: 720, change: 0.42, price: 1024000 },
      { name: "셀트리온", ticker: "셀트리온", size: 380, change: -0.83, price: 188400 },
      { name: "한미약품", ticker: "한미약품", size: 96, change: 1.21, price: 312000 },
      { name: "유한양행", ticker: "유한양행", size: 78, change: -1.96, price: 84600 },
    ],
  },
  {
    name: "조선/방산",
    cells: [
      { name: "HD현대중공업", ticker: "HD현중", size: 380, change: 5.1, price: 412000 },
      { name: "한화에어로스페이스", ticker: "한화에어로", size: 320, change: 3.21, price: 624000 },
      { name: "한국항공우주", ticker: "KAI", size: 174, change: -0.94, price: 178300 },
      { name: "대원전선", ticker: "대원전선", size: 14, change: 2.31, price: 17750 },
    ],
  },
  {
    name: "플랫폼/인터넷",
    cells: [
      { name: "NAVER", ticker: "NAVER", size: 540, change: 1.78, price: 234500 },
      { name: "카카오", ticker: "카카오", size: 320, change: 2.34, price: 56400 },
      { name: "크래프톤", ticker: "크래프톤", size: 160, change: -2.02, price: 312000 },
      { name: "넷마블", ticker: "넷마블", size: 64, change: -0.71, price: 56800 },
    ],
  },
];

export const HEATMAP_FLAT: HeatmapCell[] = HEATMAP_GROUPS.flatMap((g) =>
  g.cells.map((c) => ({ ...c, group: g.name })),
);
