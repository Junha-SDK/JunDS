import SwiftUI
import JunDS

// JunDS Showroom 카탈로그 — 원장(ledger.json) 동기화가 정체성.
// 445행 전부 노출: 만든 것은 만질 수 있게, 못 만든 것은 "예정"으로 — 진행률이 보이는 것이 가치다.

struct CatalogHome: View {
    @State private var query = ""

    private var filtered: [String: [CatalogEntry]] {
        guard !query.isEmpty else { return ShowroomCatalog.byCategory }
        let q = query.lowercased()
        var result: [String: [CatalogEntry]] = [:]
        for (category, entries) in ShowroomCatalog.byCategory {
            result[category] = entries.filter { $0.id.lowercased().contains(q) }
        }
        return result
    }

    private var iosDone: Int { ShowroomCatalog.all.filter { $0.ios == "done" }.count }
    private var iosEligible: Int { ShowroomCatalog.all.filter { $0.ios != "n/a" }.count }

    var body: some View {
        NavigationStack {
            List {
                progressHeader
                ForEach(ShowroomCatalog.categories, id: \.self) { category in
                    let entries = filtered[category] ?? []
                    if !entries.isEmpty {
                        Section {
                            ForEach(entries, id: \.uid) { entry in
                                NavigationLink(value: entry) {
                                    CatalogRow(entry: entry)
                                }
                            }
                        } header: {
                            categoryHeader(category, entries: entries)
                        }
                    }
                }
                footer
            }
            .listStyle(.insetGrouped)
            .navigationTitle("JunDS Showroom")
            .navigationDestination(for: CatalogEntry.self) { entry in
                ComponentDetail(entry: entry)
            }
            .searchable(text: $query, prompt: "컴포넌트 검색")
        }
    }

    private var progressHeader: some View {
        Section {
            VStack(alignment: .leading, spacing: JdToken.Space.s3) {
                HStack(alignment: .firstTextBaseline) {
                    Text("iOS \(iosDone)")
                        .font(.system(.title2, design: .rounded).weight(.bold))
                        .foregroundColor(JdToken.Color.primary.color)
                    Text("/ \(iosEligible)")
                        .font(.system(.callout, design: .rounded))
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("웹 \(ShowroomCatalog.all.filter { $0.web == "done" }.count) done")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
                ProgressView(value: Double(iosDone), total: Double(max(iosEligible, 1)))
                    .tint(JdToken.Color.primary.color)
                Text("원장 ledger.json 동기화 — 목록은 손으로 관리하지 않는다")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, JdToken.Space.s2)
            .accessibilityElement(children: .combine)
            .accessibilityLabel("iOS 진행률 \(iosDone) / \(iosEligible)")
        }
    }

    private func categoryHeader(_ category: String, entries: [CatalogEntry]) -> some View {
        let title = ShowroomCatalog.categoryTitles[category] ?? category
        let done = entries.filter { $0.ios == "done" }.count
        return HStack {
            Text(title)
            Spacer()
            Text("\(done)/\(entries.count)")
                .font(.caption.monospacedDigit())
                .foregroundColor(.secondary)
        }
    }

    private var footer: some View {
        Section {
            Text("ledger generatedAt \(ShowroomCatalog.ledgerGeneratedAt) · 총 \(ShowroomCatalog.all.count)행")
                .font(.caption2)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)
                .listRowBackground(Color.clear)
        }
    }
}

struct CatalogRow: View {
    let entry: CatalogEntry

    private var hasDemo: Bool { DemoRegistry.byId[entry.id] != nil }

    var body: some View {
        HStack(spacing: JdToken.Space.s2) {
            Text(entry.id)
                .font(.body)
                .lineLimit(1)
            if hasDemo {
                Image(systemName: "play.circle.fill")
                    .font(.caption)
                    .foregroundColor(JdToken.Color.primary.color)
                    .accessibilityLabel("라이브 데모 있음")
            }
            Spacer(minLength: JdToken.Space.s2)
            statusBadge
        }
        .padding(.vertical, 2)
    }

    @ViewBuilder
    private var statusBadge: some View {
        switch entry.ios {
        case "done":
            badge("iOS", fg: .white, bg: JdToken.Color.primary.color)
        case "n/a":
            badge("n/a", fg: .secondary, bg: Color(.tertiarySystemFill))
        default:
            if entry.web == "done" {
                badge("예정", fg: JdToken.Color.warning.color, bg: JdToken.Color.warningLight.color)
            } else {
                badge("대기", fg: .secondary, bg: Color(.tertiarySystemFill))
            }
        }
    }

    private func badge(_ text: String, fg: Color, bg: Color) -> some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(bg, in: Capsule())
            .foregroundColor(fg)
    }
}
