/**
 * get_usage — 플랫폼별 사용 스니펫 (08-mcp §4.3).
 *
 * 스니펫이 없어도 "아직 없음"은 질문에 대한 정답이지 실패가 아니다 — 에러 대신
 * { available: false, status, alternatives }를 구조화해 AI가 "iOS는 예정, 웹은 지금
 * 가능"을 정확히 말할 수 있게 한다.
 *
 * web 스니펫의 {prop} 템플릿 토큰(06 §2.3·DEC-021-4)은 controls 기본값으로 치환해
 * 반환한다 — 복사해 바로 동작하는 코드가 계약이다.
 */
import { contentFor, findRow, meta, normStatus, snippetPlatforms, suggest } from "./common.mjs";

/** `variant="{variant}"` → controls 기본값 주입. 매칭 실패 토큰은 원문 유지. */
function substituteTemplateTokens(code, controls = []) {
  return code.replace(/\{(\w+)\}/g, (raw, prop) => {
    const control = controls.find((c) => c.prop === prop);
    return control?.default !== undefined ? String(control.default) : raw;
  });
}

export function getUsage(data, input) {
  const { platform } = input;
  const row = findRow(data, input.id);
  if (!row) {
    return {
      ok: false,
      ...meta(data),
      error: `component "${input.id}" not found in ledger`,
      suggestions: suggest(data, input.id),
    };
  }
  const c = contentFor(data, row) ?? {};
  const snippet = c.snippets?.[platform] ?? null;
  const authored = snippetPlatforms(c);

  if (snippet) {
    const code =
      platform === "web"
        ? substituteTemplateTokens(snippet.code, c.controls)
        : snippet.code;
    return {
      ok: true,
      ...meta(data),
      id: row.id,
      platform,
      tag: c.tag ?? null,
      imp: snippet.imp,
      code,
      ...(c.controls?.length ? { controls: c.controls } : {}),
      ...(platform === "react"
        ? {
            note:
              "v2(@junds/ui) 참고 스니펫 — v3 React 어댑터(@junds/react)는 어댑터 트랙 " +
              "진행 중. 웹 CE(jd-*)는 React JSX에서도 직접 사용 가능하다.",
          }
        : {}),
    };
  }

  if (platform === "react") {
    return {
      ok: true,
      ...meta(data),
      id: row.id,
      platform,
      available: false,
      status: "planned",
      alternatives: authored,
      note:
        "react 참고 스니펫 미저작 — 전환기에는 v2 @junds/ui를 사용한다(01 §8). " +
        "웹 스니펫의 CE(jd-*)는 React JSX에서도 커스텀 엘리먼트로 직접 사용 가능하다.",
    };
  }

  const ledgerStatus = platform === "web" ? row.web : row.ios; // swiftui·uikit → ios
  const status = normStatus(ledgerStatus);
  const note =
    status === "done"
      ? `${platform} 구현은 완료(ledger: ${ledgerStatus})지만 스니펫이 아직 저작되지 ` +
        `않았다 — docs-content/${c.id ?? row.id}.json에 추가 필요(검증: build-index.mjs).`
      : `${platform} 전환 상태: ${ledgerStatus} (ledger 기준). ` +
        (authored.length
          ? `저작된 대안 플랫폼: ${authored.join(", ")}.`
          : "저작된 스니펫 없음.");

  return {
    ok: true,
    ...meta(data),
    id: row.id,
    platform,
    available: false,
    status,
    ledgerStatus,
    alternatives: authored,
    note,
  };
}
