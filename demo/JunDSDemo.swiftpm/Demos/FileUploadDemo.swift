import JunDS
import SwiftUI
import UIKit
import UniformTypeIdentifiers

// FileUpload 데모 — 실컴포넌트 JdFileUploadZone(SwiftUI)/JdFileUploadZoneView(UIKit).
//
// ⚠️ 컴포넌트는 **피커를 만들지 않는다**(DESIGN-3 §B, 04 §10 번역 원칙). 드롭존 외형과 파일 목록
//    표시만 책임지고, 실제 선택은 소비자가 시스템 피커를 붙여서 한다. 그래서 이 데모는 진짜
//    `.fileImporter`를 연결해 시스템 피커를 띄우고, 돌아온 URL의 lastPathComponent를 목록에 싣는다.
//    (UIKit 스테이지도 같은 시스템 피커를 쓴다 — UIDocumentPickerViewController의 SwiftUI 표면이다.)
// 컨트롤 키·값 리터럴은 웹 attribute 문자열과 일치(3플랫폼 동일 리터럴, 04 §3).

enum FileUploadDemo {
    static let demo = ComponentDemo(
        id: "FileUpload",
        controls: [
            .text("description", "description", placeholder: "드롭존 설명", initial: "파일을 선택하세요"),
            .toggle("error", "error"),
            .toggle("disabled", "disabled"),
        ],
        swiftUI: { state in AnyView(FileUploadStageSwiftUI(state: state)) },
        uikit: { state in AnyView(FileUploadStageUIKit(state: state)) }
    )

    static let fallbackDescription = "파일을 선택하세요"
}

// DemoState를 읽는 free function은 @MainActor 필수 (DemoState가 @MainActor 격리)

@MainActor
private func uploadDescription(_ state: DemoState) -> String {
    let raw = state.string("description", fallback: FileUploadDemo.fallbackDescription)
    return raw.isEmpty ? FileUploadDemo.fallbackDescription : raw
}

private struct FileUploadStageSwiftUI: View {
    @ObservedObject var state: DemoState
    @State private var fileNames: [String] = []
    @State private var isPicking = false
    @State private var failure: String?

    var body: some View {
        VStack(alignment: .leading, spacing: JdGap.sm.value) {
            JdFileUploadZone(
                description: uploadDescription(state),
                isError: state.bool("error"),
                isEnabled: !state.bool("disabled"),
                fileNames: fileNames
            ) {
                isPicking = true
            }

            uploadFootnote(fileNames: fileNames, failure: failure)
        }
        .padding(JdToken.Space.s6)
        // 피커는 시스템이 소유한다 — 컴포넌트가 감싸지 않는다
        .fileImporter(
            isPresented: $isPicking,
            allowedContentTypes: [.item],
            allowsMultipleSelection: true
        ) { result in
            apply(result)
        }
    }

    private func apply(_ result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            fileNames = urls.map(\.lastPathComponent)
            failure = nil
        case .failure(let error):
            failure = error.localizedDescription
        }
    }
}

private struct FileUploadStageUIKit: View {
    @ObservedObject var state: DemoState
    @State private var fileNames: [String] = []
    @State private var isPicking = false
    @State private var failure: String?

    var body: some View {
        VStack(alignment: .leading, spacing: JdGap.sm.value) {
            FileUploadZoneViewRep(
                description: uploadDescription(state),
                isError: state.bool("error"),
                disabled: state.bool("disabled"),
                fileNames: fileNames
            ) {
                isPicking = true
            }
            .frame(maxWidth: .infinity)

            uploadFootnote(fileNames: fileNames, failure: failure)
        }
        .padding(JdToken.Space.s6)
        .fileImporter(
            isPresented: $isPicking,
            allowedContentTypes: [.item],
            allowsMultipleSelection: true
        ) { result in
            apply(result)
        }
    }

    private func apply(_ result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            fileNames = urls.map(\.lastPathComponent)
            failure = nil
        case .failure(let error):
            failure = error.localizedDescription
        }
    }
}

// 각주 — 선택 결과와 책임 경계.
@ViewBuilder
private func uploadFootnote(fileNames: [String], failure: String?) -> some View {
    if let failure {
        Text("선택 실패: \(failure)")
            .font(.footnote)
            .foregroundColor(JdToken.Color.danger.color)
    } else if fileNames.isEmpty {
        Text(
            "드롭존을 탭하면 시스템 파일 피커가 열린다 — 컴포넌트는 피커를 만들지 않고 외형과 "
                + "선택된 파일 목록 표시만 책임진다. 파일 행은 표시 전용이라 삭제 동작은 표면이 아니다."
        )
        .font(.footnote)
        .foregroundColor(.secondary)
    } else {
        Text(
            "선택된 파일 \(fileNames.count)개 — 목록은 시스템 피커가 돌려준 URL의 "
                + "lastPathComponent다(파일 접근 자체는 데모의 관심사가 아니다)."
        )
        .font(.footnote)
        .foregroundColor(.secondary)
    }
}

// 데모 전용 UIKit 랩 — 소비자 관할 (DEC-010 각주).
// zoneDescription·isError·fileNames는 전부 var라 뷰 재생성 없이 갱신된다.
private struct FileUploadZoneViewRep: UIViewRepresentable {
    var description: String
    var isError: Bool
    var disabled: Bool
    var fileNames: [String]
    var onTap: () -> Void

    func makeUIView(context: Context) -> JdFileUploadZoneView {
        JdFileUploadZoneView(description: description, isError: isError, fileNames: fileNames)
    }

    func updateUIView(_ view: JdFileUploadZoneView, context: Context) {
        if view.zoneDescription != description { view.zoneDescription = description }
        if view.isError != isError { view.isError = isError }
        if view.fileNames != fileNames { view.fileNames = fileNames }
        if view.isEnabled != !disabled { view.isEnabled = !disabled }
        view.onTap = onTap
    }
}
