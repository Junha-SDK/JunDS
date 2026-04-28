"use client";
import { useState } from "react";
import { Button } from "@/ds/primitives/Button";
import { Badge } from "@/ds/primitives/Badge";
import { Avatar } from "@/ds/primitives/Avatar";
import { Input } from "@/ds/primitives/Input";
import { Card } from "@/ds/composites/Card";
import { MetricCard } from "@/ds/composites/MetricCard";
import { Tabs } from "@/ds/composites/Tabs";

const navItems = [
  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3", label: "대시보드", active: true },
  { icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197", label: "사용자" },
  { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", label: "주문" },
  { icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12", label: "분석" },
  { icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35", label: "설정" },
];

const orders = [
  { id: "ORD-001", customer: "김준하", product: "프리미엄 플랜", amount: "₩99,000", status: "completed" },
  { id: "ORD-002", customer: "이서연", product: "스타터 플랜", amount: "₩29,000", status: "pending" },
  { id: "ORD-003", customer: "박민수", product: "엔터프라이즈", amount: "₩299,000", status: "completed" },
  { id: "ORD-004", customer: "최유진", product: "프리미엄 플랜", amount: "₩99,000", status: "cancelled" },
  { id: "ORD-005", customer: "정다은", product: "스타터 플랜", amount: "₩29,000", status: "completed" },
];

const statusMap = { completed: { label: "완료", variant: "success" as const }, pending: { label: "대기", variant: "warning" as const }, cancelled: { label: "취소", variant: "danger" as const } };

export default function AdminTemplate() {
  return (
    <div className="flex h-[700px] rounded-2xl border border-border overflow-hidden shadow-lg">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white shrink-0 flex flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold">J</div>
            <span className="font-bold text-sm">JunDS Admin</span>
          </div>
        </div>
        <nav className="flex-1 py-3 px-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors cursor-pointer ${
                item.active ? "bg-white/10 text-white font-medium" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
          <Avatar name="Admin" size="sm" />
          <div>
            <p className="text-xs font-medium">관리자</p>
            <p className="text-[10px] text-white/40">admin@junds.dev</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col bg-gray-50/50 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-border shrink-0">
          <div>
            <h1 className="text-lg font-bold">대시보드</h1>
            <p className="text-xs text-muted">2026년 4월 25일</p>
          </div>
          <div className="flex items-center gap-3">
            <Input placeholder="검색..." size="sm" className="w-48" leftSlot={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>} />
            <Button variant="primary" size="sm">새 주문</Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="총 매출" value="₩12.4M" change={12.5} />
            <MetricCard label="주문 수" value="342" change={8.3} />
            <MetricCard label="신규 고객" value="56" change={-2.1} />
            <MetricCard label="평균 단가" value="₩36,200" change={4.7} />
          </div>

          {/* Orders Table */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-sm font-semibold">최근 주문</h3>
                <Button variant="ghost" size="xs">모두 보기</Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted uppercase">주문번호</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted uppercase">고객</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted uppercase">상품</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted uppercase">금액</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted uppercase">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border-light last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                      <td className="px-4 py-3 flex items-center gap-2"><Avatar name={order.customer} size="xs" />{order.customer}</td>
                      <td className="px-4 py-3 text-muted">{order.product}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{order.amount}</td>
                      <td className="px-4 py-3"><Badge variant={statusMap[order.status as keyof typeof statusMap].variant} size="sm" dot>{statusMap[order.status as keyof typeof statusMap].label}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
