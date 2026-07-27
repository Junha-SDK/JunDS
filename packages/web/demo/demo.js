/**
 * JunDS v3 데모 셸 — 마스트헤드·히어로·푸터 주입 + 테마 기억.
 *
 * 데모 10장이 각자 헤더 마크업과 테마 토글 스크립트를 복사해 갖고 있었다.
 * 그래서 (1) 페이지끼리 서로 링크가 없어 하나를 보면 나머지 9장의 존재를 모르고,
 * (2) 다크로 바꾼 뒤 다른 데모로 넘어가면 라이트로 돌아왔다. 둘 다 여기서 끝낸다.
 *
 * 라이브러리 코드가 아니다 — `../dist/junds.min.js` 가 제공하는 것에 손대지 않고,
 * 데모 껍데기만 만든다. 껍데기의 버튼조차 <jd-button> 을 쓰는 것은 의도적이다:
 * 데모의 크롬까지 자기 컴포넌트로 짓지 못한다면 그건 라이브러리의 문제다.
 *
 * type="module" 이 아니라 **클래식 스크립트 + IIFE** 인 이유: 모듈은 file:// 에서
 * CORS 로 차단된다("origin 'null'"). 데모는 서버 없이 파일을 그냥 열어도 돌아야
 * 하고, a11y 감사(.github/scripts/web-a11y-audit.mjs)도 file:// 로 연다 —
 * 모듈로 두면 감사 화면에서 이 셸이 통째로 없는 페이지를 검사하게 된다.
 */
(function () {
"use strict";

/** 데모 페이지 목록 — 파일명이 곧 키다. */
const PAGES = [
  { file: "index.html", tag: "G1", label: "파일럿" },
  { file: "core.html", tag: "B1", label: "core" },
  { file: "layout.html", tag: "B2", label: "레이아웃" },
  { file: "form.html", tag: "B3", label: "폼" },
  { file: "display.html", tag: "B4", label: "표시" },
  { file: "special-input.html", tag: "B5", label: "특수 입력" },
  { file: "text-media.html", tag: "B6", label: "텍스트·미디어" },
  { file: "infra-social.html", tag: "B7", label: "인프라·소셜" },
  { file: "overlay-feedback.html", tag: "B13", label: "오버레이" },
  { file: "stability.html", tag: "P", label: "안정성" },
];

const THEME_KEY = "junds.demo.theme";

/* ── 테마 ─────────────────────────────────────────────────────────────────
   최초 적용은 각 페이지 <head> 의 인라인 한 줄이 이미 끝냈다(첫 페인트 전).
   여기서는 토글과 저장만 맡는다 — 여기서 적용하면 defer 실행이라 흰 화면이
   한 프레임 번쩍인다. */

const isDark = () => document.documentElement.getAttribute("data-jd-theme") === "dark";

function applyTheme(dark, button) {
  const root = document.documentElement;
  if (dark) root.setAttribute("data-jd-theme", "dark");
  else root.removeAttribute("data-jd-theme");
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    /* 파일 프로토콜·프라이빗 모드 — 기억하지 못할 뿐 토글은 동작한다 */
  }
  if (button) {
    button.textContent = dark ? "라이트 모드" : "다크 모드";
    button.setAttribute("aria-pressed", String(dark));
  }
}

/* ── 마스트헤드 ───────────────────────────────────────────────────────── */

function fillNav(nav, activeFile, pillClass) {
  for (const page of PAGES) {
    const link = document.createElement("a");
    if (pillClass) link.className = pillClass;
    link.href = page.file;
    link.textContent = `${page.tag} ${page.label}`;
    if (page.file === activeFile) link.setAttribute("aria-current", "page");
    nav.append(link);
  }
  return nav;
}

function bindToggle(toggle) {
  toggle.textContent = isDark() ? "라이트 모드" : "다크 모드";
  toggle.setAttribute("aria-pressed", String(isDark()));
  toggle.addEventListener("click", () => applyTheme(!isDark(), toggle));
  return toggle;
}

function buildBar(activeFile) {
  const bar = document.createElement("header");
  bar.className = "demo-bar";

  const brand = document.createElement("a");
  brand.className = "demo-brand";
  brand.href = "index.html";
  brand.innerHTML =
    '<span class="demo-brand__mark" aria-hidden="true"></span>' +
    '<span class="demo-brand__label">JunDS <span class="demo-brand__ver">v3</span></span>';

  const nav = document.createElement("nav");
  nav.className = "demo-nav";
  nav.setAttribute("aria-label", "데모 페이지");
  fillNav(nav, activeFile, "demo-pill");

  const toggle = document.createElement("jd-button");
  toggle.id = "theme-toggle";
  toggle.setAttribute("variant", "outline");
  toggle.setAttribute("size", "sm");

  bar.append(brand, nav, bindToggle(toggle));
  return bar;
}

/* ── 히어로 ───────────────────────────────────────────────────────────────
   내용은 <body> 의 data-demo-* 에서 읽는다. 데모마다 같은 마크업을 열 번
   베껴 두면 한 곳을 고칠 때 아홉 곳이 남는다. */

function buildHero(data) {
  const hero = document.createElement("div");
  hero.className = "demo-hero";

  if (data.demoEyebrow) {
    const eyebrow = document.createElement("p");
    eyebrow.className = "demo-hero__eyebrow";
    eyebrow.textContent = data.demoEyebrow;
    hero.append(eyebrow);
  }

  const title = document.createElement("h1");
  title.className = "demo-hero__title";
  title.textContent = data.demoTitle ?? "JunDS v3";
  hero.append(title);

  if (data.demoDesc) {
    const desc = document.createElement("p");
    desc.className = "demo-hero__desc";
    desc.textContent = data.demoDesc;
    hero.append(desc);
  }

  const meta = (data.demoMeta ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  if (meta.length) {
    const row = document.createElement("div");
    row.className = "demo-hero__meta";
    for (const item of meta) {
      const chip = document.createElement("span");
      chip.className = "demo-meta";
      chip.textContent = item;
      row.append(chip);
    }
    hero.append(row);
  }

  return hero;
}

function buildFoot() {
  const foot = document.createElement("footer");
  foot.className = "demo-foot";
  foot.innerHTML =
    "<span>JunDS v3 · 빌드 산출물(<code>junds.css</code> + <code>junds.min.js</code>)만으로 동작하는 데모</span>" +
    '<span><a href="index.html">데모 홈</a></span>';
  return foot;
}

/* ── 조립 ─────────────────────────────────────────────────────────────── */

const file = location.pathname.split("/").pop() || "index.html";
/** full = 바+히어로+푸터 · bar = 바만 · off = 페이지가 자기 크롬을 직접 갖는다 */
const shell = document.body.dataset.demoShell ?? "full";

if (shell !== "off") document.body.prepend(buildBar(file));

if (shell === "full") {
  const main = document.querySelector("main");
  if (main) {
    main.classList.add("demo-main");
    if (document.body.dataset.demoWidth === "wide") main.classList.add("demo-main--wide");
    main.prepend(buildHero(document.body.dataset));
    main.append(buildFoot());
  }
}

/* shell=off 페이지(앱 셸 데모)는 자기 사이드바·헤더에 자리를 마련해 둔다 */
for (const slot of document.querySelectorAll("[data-demo-nav]")) {
  fillNav(slot, file, slot.dataset.demoNav); // 값이 비면 클래스 없이 — 그 자리 CSS를 따른다
}
const existingToggle = shell === "off" && document.getElementById("theme-toggle");
if (existingToggle) bindToggle(existingToggle);

})();
