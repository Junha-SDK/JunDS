import { createRef } from "react";
import {
  Accordion,
  AddressInput,
  FlowDiagram,
  InfiniteList,
} from "../src/index.js";
import type { JdAccordion } from "@junds/web/accordion/element";

const accordionRef = createRef<JdAccordion>();

<Accordion
  ref={accordionRef}
  aria-label="자주 묻는 질문"
  data-track="faq"
  items={[{ key: "shipping", title: "배송", content: "하루 걸립니다." }]}
  onClick={(event) => {
    event.currentTarget.toggle("shipping");
  }}
  onJdChange={(event) => {
    event.detail.openKeys satisfies string[];
  }}
/>;

<AddressInput
  onJdChange={(event) => {
    event.detail.zonecode satisfies string;
  }}
/>;

<FlowDiagram connectionStyle="bezier" />;

<InfiniteList
  items={[{ id: 1 }]}
  renderItem={(item, index) => `${index}: ${String(item)}`}
  keyExtractor={(_, index) => String(index)}
/>;

// 공개 element의 literal union을 벗어난 값은 허용하지 않는다.
// @ts-expect-error "curve"는 JdFlowDiagram.connectionStyle에 없는 값이다.
<FlowDiagram connectionStyle="curve" />;
