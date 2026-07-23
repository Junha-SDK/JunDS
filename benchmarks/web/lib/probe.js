/**
 * benchmarks/web/lib/probe.js — 의존성 0 계측 스크립트 (05-perf §2.1 최소 구현).
 *
 * - 상호작용(W3): performance.mark 쌍 + rAF→setTimeout(0) 이중 콜백으로
 *   "핸들러 시작 → 다음 페인트" 경계를 근사한다(Event Timing 동일 모델).
 * - 롱태스크(W5): PerformanceObserver({ type: "longtask", buffered: true }) —
 *   계측 창(start~stop) 내 건수·최대 duration.
 * - 규약: 목데이터·DOM 초기 주입은 start() 이전에 완료. 첫 1회 워밍업 폐기·중앙값
 *   채택은 드라이버(run.mjs) 몫.
 * - RAF 워치독: 숨은 탭/헤드리스에서 rAF가 멎으면(1초 0프레임) 즉시 실패 보고.
 */
(function () {
  "use strict";

  const state = {
    active: false,
    samples: [], // { label, ms }
    longtasks: [],
    rafDead: false,
    observer: null,
  };

  /** 다음 페인트 경계 근사 — rAF 콜백 후 태스크 큐 선두 */
  function afterNextPaint(cb) {
    const deadline = setTimeout(() => {
      // 1초간 rAF 무발화 — 컴포지터 정지(숨은 탭) 감지 시 하니스 실패 (05 §2.1 주의)
      state.rafDead = true;
      cb();
    }, 1000);
    requestAnimationFrame(() => {
      setTimeout(() => {
        clearTimeout(deadline);
        cb();
      }, 0);
    });
  }

  const probe = {
    start() {
      state.active = true;
      state.samples.length = 0;
      state.longtasks.length = 0;
      state.rafDead = false;
      if (typeof PerformanceObserver !== "undefined") {
        try {
          state.observer = new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (state.active) state.longtasks.push(e.duration);
            }
          });
          state.observer.observe({ type: "longtask", buffered: true });
        } catch {
          state.observer = null; // longtask 미지원 환경 — 건수 계측만 생략
        }
      }
      performance.mark("probe:start");
    },

    /**
     * 상호작용 1회 계측: fn() 실행 시작 → 다음 페인트 완료까지(ms).
     * fn은 동기 상태 변경(핸들러 본체)이어야 한다.
     */
    interaction(label, fn) {
      return new Promise((resolve) => {
        const t0 = performance.now();
        performance.mark(`probe:${label}:start`);
        fn();
        afterNextPaint(() => {
          const ms = performance.now() - t0;
          performance.mark(`probe:${label}:end`);
          state.samples.push({ label, ms });
          resolve(ms);
        });
      });
    },

    stop() {
      performance.mark("probe:stop");
      state.active = false;
      if (state.observer) state.observer.disconnect();
      return probe.report();
    },

    report() {
      const byLabel = {};
      for (const s of state.samples) (byLabel[s.label] ??= []).push(s.ms);
      const stats = {};
      for (const [label, arr] of Object.entries(byLabel)) {
        const sorted = [...arr].sort((a, b) => a - b);
        const pick = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
        stats[label] = {
          count: arr.length,
          mean: arr.reduce((a, b) => a + b, 0) / arr.length,
          median: pick(0.5),
          p95: pick(0.95),
          max: sorted[sorted.length - 1],
        };
      }
      return {
        rafDead: state.rafDead,
        interactions: stats,
        longtasks: {
          count: state.longtasks.length,
          maxDuration: state.longtasks.length ? Math.max(...state.longtasks) : 0,
        },
      };
    },
  };

  window.__probe = probe;
})();
