/**
 * "@junds/web/define" — 전량 정의 진입점 (03-web-arch §2, §6.2 부작용 모듈).
 * defineJunds(): 전량/부분 등록 + prefix 탈출구(멀티 버전 공존).
 * SSR 안전: defineElement가 Node에서 no-op(§2).
 */
import { defineElement } from "./core/define.js";
import { JdButton } from "./components/button/element.js";
import { JdTextField } from "./components/text-field/element.js";
import { JdModal } from "./components/modal/element.js";
import { JdBox } from "./components/box/element.js";
import { JdCenter } from "./components/center/element.js";
import { JdDivider } from "./components/divider/element.js";
import { JdFlex } from "./components/flex/element.js";
import { JdGridLayout } from "./components/grid-layout/element.js";
import { JdGroup } from "./components/group/element.js";
import { JdHStack } from "./components/hstack/element.js";
import { JdHeading } from "./components/heading/element.js";
import { JdPage, JdPageBody, JdPageHeader } from "./components/page/element.js";
import { JdSection } from "./components/section/element.js";
import { JdText } from "./components/text/element.js";
import { JdVStack } from "./components/vstack/element.js";

type JdCtor = CustomElementConstructor & { tag: string };

/** G1 파일럿 3종 + B1 core 12행(페이지 컴파운드 3태그 포함) — 배치마다 여기(와 exports)에 추가 */
const ALL: JdCtor[] = [
  JdButton,
  JdTextField,
  JdModal,
  JdBox,
  JdCenter,
  JdDivider,
  JdFlex,
  JdGridLayout,
  JdGroup,
  JdHStack,
  JdHeading,
  JdPage,
  JdPageHeader,
  JdPageBody,
  JdSection,
  JdText,
  JdVStack,
];

export function defineJunds(
  list: readonly JdCtor[] = ALL,
  opts?: { prefix?: string },
): void {
  for (const ctor of list) {
    const tag = opts?.prefix ? ctor.tag.replace(/^jd-/, `${opts.prefix}-`) : ctor.tag;
    defineElement(tag, ctor);
  }
}

defineJunds(); // import 부작용 — "@junds/web/define" 한 줄로 전량 등록
