import SwiftUI
import UIKit

// CADisplayLink 기반 fps 모니터 — 쇼룸 내장 계측기.
// DEBUG 빌드 전용(릴리스에선 제외). 시뮬레이터 수치는 "참고치" — 실기기 확정은 Xcode 복구 후.

#if DEBUG
@MainActor
final class FpsMonitor: ObservableObject {
    @Published private(set) var fps: Double = 0
    @Published private(set) var worstFrameMs: Double = 0

    private var link: CADisplayLink?
    private var timestamps: [CFTimeInterval] = []

    func start() {
        guard link == nil else { return }
        let link = CADisplayLink(target: self, selector: #selector(tick(_:)))
        link.add(to: .main, forMode: .common) // 스크롤 트래킹 중에도 계측
        self.link = link
    }

    func stop() {
        link?.invalidate()
        link = nil
        timestamps.removeAll()
        fps = 0
        worstFrameMs = 0
    }

    @objc private func tick(_ link: CADisplayLink) {
        let now = link.timestamp
        timestamps.append(now)
        // 최근 1초 창 유지
        while let first = timestamps.first, now - first > 1.0 {
            timestamps.removeFirst()
        }
        guard timestamps.count >= 2 else { return }
        let window = now - timestamps[0]
        guard window > 0 else { return }
        fps = Double(timestamps.count - 1) / window

        var worst: CFTimeInterval = 0
        for i in 1..<timestamps.count {
            worst = max(worst, timestamps[i] - timestamps[i - 1])
        }
        worstFrameMs = worst * 1000
    }
}

struct FpsBadge: View {
    @ObservedObject var monitor: FpsMonitor

    private var tone: Color {
        if monitor.fps >= 55 { return JdToken.Color.success.color }
        if monitor.fps >= 45 { return JdToken.Color.warning.color }
        return JdToken.Color.danger.color
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text(String(format: "%.0f fps", monitor.fps))
                .font(.system(.footnote, design: .monospaced).weight(.semibold))
                .foregroundColor(tone)
            Text(String(format: "worst %.1fms", monitor.worstFrameMs))
                .font(.system(.caption2, design: .monospaced))
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .accessibilityLabel("초당 프레임 \(Int(monitor.fps))")
    }
}

import JunDS
#endif
