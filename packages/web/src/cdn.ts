/**
 * CDN IIFE 진입점 — <script src=".../junds.min.js"> 한 줄 소비용 (globalName: JunDS).
 * define.ts 부작용으로 전 컴포넌트 자동 등록 + 클래스·유틸을 window.JunDS로 노출.
 */
import "./define.js";
export * from "./index.js";
export { defineJunds } from "./define.js";
