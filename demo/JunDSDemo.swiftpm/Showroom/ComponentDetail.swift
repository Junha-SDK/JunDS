import JunDS
import SwiftUI
import UIKit

// 컴포넌트 상세 — 스키마(ComponentDemo)로부터 일괄 구동되는 화면.
// 라이브 스테이지 + 컨트롤 패널 + SwiftUI↔UIKit 탭 + 다크/Dynamic Type/Reduce Motion + 접근성 검사.

struct ComponentDetail: View {
    let entry: CatalogEntry

    var body: some View {
        if let demo = DemoRegistry.byId[entry.id] {
            DemoScreen(entry: entry, demo: demo)
        } else {
            PlannedDetail(entry: entry)
        }
    }
}

// MARK: - 스키마 구동 데모 화면

private enum StageImpl: String, CaseIterable {
    case swiftUI = "SwiftUI"
    case uikit = "UIKit"
    case stress = "스트레스"
}

struct DemoScreen: View {
    let entry: CatalogEntry
    let demo: ComponentDemo

    @StateObject private var state: DemoState
    @StateObject private var proxy = StageProxy()
    #if DEBUG
    @StateObject private var fps = FpsMonitor()
    #endif

    @State private var impl: StageImpl = .swiftUI
    @State private var dark = false
    @State private var typeIndex: Double = Double(TypeLadder.defaultIndex)
    @State private var reduceMotion = false
    @State private var showA11y = false
    @State private var showFps = false

    init(entry: CatalogEntry, demo: ComponentDemo) {
        self.entry = entry
        self.demo = demo
        _state = StateObject(wrappedValue: DemoState(controls: demo.controls))
    }

    private var availableImpls: [StageImpl] {
        var impls: [StageImpl] = [.swiftUI]
        if demo.uikitStage != nil { impls.append(.uikit) }
        if demo.stress != nil { impls.append(.stress) }
        return impls
    }

    private var stageContent: AnyView {
        switch impl {
        case .swiftUI: return demo.swiftUIStage(state)
        case .uikit: return demo.uikitStage?(state) ?? demo.swiftUIStage(state)
        case .stress: return demo.stress?(state) ?? demo.swiftUIStage(state)
        }
    }

    var body: some View {
        List {
            stageSection
            environmentSection
            if !demo.controls.isEmpty { controlsSection }
            if let recipe = demo.recipe { recipeSection(recipe) }
            ledgerSection
        }
        .listStyle(.insetGrouped)
        .navigationTitle(entry.id)
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showA11y) { A11yInspector(proxy: proxy) }
        .onChange(of: reduceMotion) { on in
            JdMotion.isReduced = on ? { true } : { UIAccessibility.isReduceMotionEnabled }
        }
        .onDisappear {
            JdMotion.isReduced = { UIAccessibility.isReduceMotionEnabled }
            #if DEBUG
            fps.stop()
            #endif
        }
        #if DEBUG
        .onChange(of: showFps) { on in on ? fps.start() : fps.stop() }
        #endif
    }

    private var stageSection: some View {
        Section {
            ZStack(alignment: .topTrailing) {
                StageHost(
                    content: stageContent,
                    dark: dark,
                    sizeCategory: TypeLadder.categories[Int(typeIndex)],
                    proxy: proxy
                )
                .frame(minHeight: impl == .stress ? 420 : 240)
                #if DEBUG
                if showFps {
                    FpsBadge(monitor: fps)
                        .padding(JdToken.Space.s2)
                }
                #endif
            }
            // 스테이지 배경은 StageHost 내부(트레이트 오버라이드를 받는 쪽)에서 칠한다
            .listRowInsets(EdgeInsets())

            if availableImpls.count > 1 {
                Picker("구현", selection: $impl) {
                    ForEach(availableImpls, id: \.self) { Text($0.rawValue) }
                }
                .pickerStyle(.segmented)
            }
        } header: {
            Text("스테이지")
        }
    }

    private var environmentSection: some View {
        Section("환경") {
            Toggle("다크 모드", isOn: $dark)
            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                HStack {
                    Text("Dynamic Type")
                    Spacer()
                    Text(TypeLadder.labels[Int(typeIndex)])
                        .font(.footnote.monospaced().weight(.semibold))
                        .foregroundColor(JdToken.Color.primary.color)
                }
                Slider(value: $typeIndex, in: 0...Double(TypeLadder.categories.count - 1), step: 1)
                    .accessibilityLabel("Dynamic Type 단계")
                    .accessibilityValue(TypeLadder.labels[Int(typeIndex)])
            }
            Toggle("Reduce Motion (JdMotion 경로)", isOn: $reduceMotion)
            #if DEBUG
            Toggle("fps 오버레이 (시뮬레이터 참고치)", isOn: $showFps)
            #endif
            Button {
                showA11y = true
            } label: {
                HStack {
                    Text("접근성 검사")
                    Spacer()
                    Image(systemName: "accessibility")
                }
            }
        }
    }

    private var controlsSection: some View {
        Section("컨트롤") {
            ForEach(demo.controls) { control in
                controlRow(control)
            }
        }
    }

    @ViewBuilder
    private func controlRow(_ control: DemoControlSpec) -> some View {
        switch control.kind {
        case .options(let options):
            Picker(control.label, selection: state.stringBinding(control.id)) {
                ForEach(options, id: \.self) { Text($0) }
            }
        case .toggle:
            Toggle(control.label, isOn: state.boolBinding(control.id))
        case .slider(let range, let step):
            VStack(alignment: .leading, spacing: JdToken.Space.s1) {
                HStack {
                    Text(control.label)
                    Spacer()
                    Text(String(format: "%.0f", state.number(control.id)))
                        .font(.footnote.monospaced())
                        .foregroundColor(.secondary)
                }
                Slider(value: state.numberBinding(control.id), in: range, step: step)
            }
        case .text(let placeholder):
            HStack {
                Text(control.label)
                TextField(placeholder, text: state.stringBinding(control.id))
                    .multilineTextAlignment(.trailing)
                    .foregroundColor(.secondary)
            }
        }
    }

    private func recipeSection(_ recipe: String) -> some View {
        Section("레시피") {
            ScrollView(.horizontal, showsIndicators: false) {
                Text(recipe)
                    .font(.system(.caption, design: .monospaced))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, JdToken.Space.s1)
            }
        }
    }

    private var ledgerSection: some View {
        Section {
            LedgerStatusRows(entry: entry)
        } header: {
            Text("원장")
        } footer: {
            Text(entry.note)
        }
    }
}

// MARK: - 예정 화면 (원장 상태만)

struct PlannedDetail: View {
    let entry: CatalogEntry

    var body: some View {
        List {
            Section {
                VStack(spacing: JdToken.Space.s3) {
                    Image(systemName: entry.ios == "n/a" ? "nosign" : "hammer")
                        .font(.system(size: 34, weight: .light))
                        .foregroundColor(.secondary)
                    Text(entry.ios == "n/a" ? "iOS 해당 없음" : "iOS 구현 예정")
                        .font(.headline)
                    if entry.web == "done" {
                        Text("웹 구현이 완료돼 대기열에 있다")
                            .font(.footnote)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, JdToken.Space.s8)
            }
            Section("원장") {
                LedgerStatusRows(entry: entry)
            }
            if !entry.note.isEmpty {
                Section("노트") {
                    Text(entry.note)
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle(entry.id)
    }
}

struct LedgerStatusRows: View {
    let entry: CatalogEntry

    var body: some View {
        row("카테고리", entry.category)
        row("티어", entry.tier)
        row("web", entry.web)
        row("ios", entry.ios)
        row("docs", entry.docs)
        row("tests", entry.tests)
        row("bench", entry.bench)
    }

    private func row(_ label: String, _ value: String) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
            Spacer()
            Text(value)
                .font(.footnote)
                .foregroundColor(
                    value == "done" || value.hasPrefix("pass")
                        ? JdToken.Color.success.color : .secondary
                )
                .multilineTextAlignment(.trailing)
        }
    }
}

// MARK: - 접근성 검사 시트

struct A11yInspector: View {
    @ObservedObject var proxy: StageProxy
    @State private var rows: [A11yRow] = []

    var body: some View {
        NavigationStack {
            List {
                if rows.isEmpty {
                    VStack(alignment: .leading, spacing: JdToken.Space.s2) {
                        Text("표시할 접근성 요소가 없다")
                            .font(.footnote.weight(.medium))
                        Text(
                            "SwiftUI는 보조기술(VoiceOver)이 실제로 켜져 있을 때만 접근성 트리를 만든다 — SwiftUI 스테이지가 비어 보이는 것은 정상이며 요소가 없다는 뜻이 아니다. UIKit 탭으로 바꾸면 실제 요소·트레이트·값을 볼 수 있다."
                        )
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }
                    .padding(.vertical, JdToken.Space.s1)
                }
                ForEach(rows) { row in
                    VStack(alignment: .leading, spacing: 3) {
                        HStack {
                            Text(row.label)
                                .font(.subheadline.weight(.medium))
                            Spacer()
                            Text(row.type)
                                .font(.caption2.monospaced())
                                .foregroundColor(.secondary)
                        }
                        HStack(spacing: JdToken.Space.s2) {
                            Text(row.traits)
                                .font(.caption)
                                .foregroundColor(JdToken.Color.primary.color)
                            if let value = row.value {
                                Text("값: \(value)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        if let hint = row.hint {
                            Text("힌트: \(hint)")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.leading, CGFloat(min(row.depth, 6)) * 6)
                }
            }
            .navigationTitle("VoiceOver 표면")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear { rows = proxy.a11ySnapshot() }
            .toolbar {
                Button("새로고침") { rows = proxy.a11ySnapshot() }
            }
        }
        .presentationDetents([.medium, .large])
    }
}
