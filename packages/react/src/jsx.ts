/**
 * 파일럿 3종 커스텀 엘리먼트의 JSX 타입 증강.
 *
 * 어댑터는 반영(reflect)형 enum/boolean 호스트 프롭을 JSX attribute로 직접 렌더한다
 * — §11-1("ref 이펙트 property 대입") 스케치의 의도적 보정. 근거는 SSR 완성 골격(§11-4):
 * variant/size/open 같은 호스트 속성 셀렉터 훅이 서버 HTML에 이미 있어야 hydration 전에도
 * 스타일이 완성된다. 클라이언트에서 React 18은 attribute로 쓰고(attributeChangedCallback
 * → coerce), React 19는 업그레이드된 프로퍼티에 대입한다 — 두 경로 모두 CE 반영 규칙(§1.3)과
 * 합류한다. 규약: boolean은 반드시 `cond ? true : undefined`로 넘긴다(React 18 SSR이
 * false를 "false" 문자열 attribute로 직렬화해 존재=참 규칙을 깨는 것을 차단).
 * 복합 데이터(value 등 비반영 프롭)는 §11-1 그대로 layout effect에서 property 대입.
 */
import type { HTMLAttributes, RefAttributes } from "react";
import type { JdButton } from "@junds/web/button/element";
import type { JdTextField } from "@junds/web/text-field/element";
import type { JdModal } from "@junds/web/modal/element";

type JdHost<T extends HTMLElement, P> = HTMLAttributes<T> &
  RefAttributes<T> &
  P & {
    /** React 18 Custom Element의 className 직렬화 차이를 피하는 표준 attribute 이름 */
    class?: string;
  };

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "jd-button": JdHost<
        JdButton,
        {
          variant?: string;
          size?: string;
          type?: string;
          loading?: true;
          disabled?: true;
          "full-width"?: true;
        }
      >;
      "jd-text-field": JdHost<
        JdTextField,
        {
          label?: string;
          placeholder?: string;
          name?: string;
          type?: string;
          size?: string;
          value?: string;
          error?: string;
          invalid?: true;
          disabled?: true;
          required?: true;
        }
      >;
      "jd-modal": JdHost<
        JdModal,
        {
          open?: true;
          size?: string;
          persistent?: true;
        }
      >;
    }
  }
}
