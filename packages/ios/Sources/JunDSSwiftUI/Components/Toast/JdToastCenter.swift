import SwiftUI
import Combine
import JunDSCore

// 웹 toast() 싱글턴 + jd-toast 큐의 SwiftUI 번역 (DESIGN-4 §C).
// Core JdToastQueue(값 타입 상태머신)를 감싸 @Published로 노출하고, 자동 닫힘 타이머만
// 이 계층이 얹는다. 타이머는 Task.sleep이되 hover/드래그 중이면 정지한다(WCAG 2.2.1).
//
// ⚠️ 이 타입은 JunDSSwiftUI 전용이다 — UIKit(JdToastHostView)은 DEC-010(계층 상호 import 금지)
//    때문에 이걸 참조하지 못하고 자체 큐를 소유한다. 우산(JunDS) 재수출에서 이름이 겹치지 않도록
//    UIKit엔 동명 타입을 두지 않는다.
@MainActor
public final class JdToastCenter: ObservableObject {

    /// 웹 toast() 싱글턴 동형 — 어디서든 부르는 기본 센터
    public static let shared = JdToastCenter()

    /// Core 상태머신 — 렌더는 이 값만 읽는다
    @Published public private(set) var queue: JdToastQueue

    // 토스트별 자동 닫힘 태스크. 축출·수동 닫힘·정지 시 취소한다.
    private var dismissTasks: [JdToast.ID: Task<Void, Never>] = [:]
    // hover/드래그 정지 상태 — 정지 중엔 새 타이머를 걸지 않고, 해제 시 남은 토스트를 재예약한다
    private var isPausedInteractively = false

    public init(maxVisible: Int = 4) {
        self.queue = JdToastQueue(maxVisible: maxVisible)
    }

    /// 토스트를 큐에 넣고(초과분은 Core가 축출) 자동 닫힘 타이머를 관리한다.
    @discardableResult
    public func show(_ toast: JdToast) -> JdToast.ID {
        queue.add(toast)
        // add가 가장 오래된 것을 축출했으면 그 타이머도 함께 정리한다
        reconcileTasks()
        // duration>0 이고 정지 중이 아닐 때만 타이머를 건다(웹 duration 0 = 수동 닫기 전용)
        if toast.duration > 0 && !isPausedInteractively {
            scheduleAutoDismiss(toast.id, after: toast.duration)
        }
        announce(toast)
        return toast.id
    }

    /// 명시적 닫기 — 타이머 취소 후 큐에서 제거
    public func dismiss(_ id: JdToast.ID) {
        dismissTasks[id]?.cancel()
        dismissTasks[id] = nil
        queue.dismiss(id)
    }

    /// 전체 비우기 — 모든 타이머 취소
    public func clear() {
        for task in dismissTasks.values { task.cancel() }
        dismissTasks.removeAll()
        queue.clear()
    }

    /// hover/드래그 정지(WCAG 2.2.1) — 정지 시 대기 중 타이머를 모두 멈추고,
    /// 해제 시 보이는 토스트의 타이머를 처음부터 다시 건다(정지 중 시간 진행 금지).
    public func setPaused(_ paused: Bool) {
        guard paused != isPausedInteractively else { return }
        isPausedInteractively = paused
        if paused {
            for task in dismissTasks.values { task.cancel() }
            dismissTasks.removeAll()
        } else {
            for toast in queue.visible where toast.duration > 0 {
                scheduleAutoDismiss(toast.id, after: toast.duration)
            }
        }
    }

    // MARK: - 내부

    private func scheduleAutoDismiss(_ id: JdToast.ID, after duration: TimeInterval) {
        dismissTasks[id]?.cancel()
        dismissTasks[id] = Task { @MainActor [weak self] in
            let nanoseconds = UInt64((duration * 1_000_000_000).rounded())
            try? await Task.sleep(nanoseconds: nanoseconds)
            guard !Task.isCancelled else { return }
            self?.dismiss(id)
        }
    }

    // 큐에서 사라진(축출된) 토스트의 타이머를 정리한다
    private func reconcileTasks() {
        let liveIDs = Set(queue.visible.map { $0.id })
        for (id, task) in dismissTasks where !liveIDs.contains(id) {
            task.cancel()
            dismissTasks[id] = nil
        }
    }

    // 화면 변화 없이 뜬 알림을 AT에 통지한다 — danger만 assertive(Core 판정 승계)
    private func announce(_ toast: JdToast) {
        let message = [toast.title, toast.message]
            .compactMap { $0 }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        guard !message.isEmpty else { return }
        JdAnnouncer.announce(message, priority: toast.variant.announcePriority)
    }
}
