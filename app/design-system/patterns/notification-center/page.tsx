"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { NotificationCenter } from "@/ds/patterns/NotificationCenter";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

const initialNotifications: Notification[] = [
  { id: "1", title: "배포 완료", message: "프로덕션 배포가 성공적으로 완료되었습니다.", time: "2분 전", read: false, type: "success" },
  { id: "2", title: "새 댓글", message: "김민수님이 PR #42에 댓글을 남겼습니다.", time: "15분 전", read: false, type: "info" },
  { id: "3", title: "디스크 경고", message: "서버 디스크 사용량이 85%를 초과했습니다.", time: "1시간 전", read: false, type: "warning" },
  { id: "4", title: "빌드 실패", message: "main 브랜치 빌드가 실패했습니다. 로그를 확인하세요.", time: "3시간 전", read: true, type: "error" },
  { id: "5", title: "팀 초대", message: "디자인 시스템 프로젝트에 초대되었습니다.", time: "어제", read: true, type: "info" },
];

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ComponentPage
      name="NotificationCenter"
      description="알림 센터. 벨 아이콘에 읽지 않은 알림 수를 표시하고, 클릭하면 알림 목록을 보여줍니다."
      importPath='import { NotificationCenter } from "@/ds/patterns/NotificationCenter"'
      props={[
        { name: "notifications", type: "Notification[]", description: "알림 배열 (id, title, message, time, read, type)" },
        { name: "unreadCount", type: "number", description: "읽지 않은 알림 수" },
        { name: "onRead", type: "(id: string) => void", description: "알림 읽음 처리 콜백" },
        { name: "onReadAll", type: "() => void", description: "모두 읽음 처리 콜백" },
      ]}
    >
      <Section title="벨 아이콘 + 알림 목록">
        <Preview>
          <div className="flex justify-center">
            <NotificationCenter
              notifications={notifications}
              onMarkAllRead={markAllAsRead}
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
