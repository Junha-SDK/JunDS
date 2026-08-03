import JunDS
import SwiftUI

// Image 데모 — 레시피형 (04 §10.1). 웹 <jd-image>의 status(loading/loaded/error) 3상태가
// AsyncImage의 phase와 1:1이라 상태 기계를 새로 짜지 않는다 — 신규 타입 없음.
// 컨트롤 값 리터럴은 웹 attribute와 일치(status·fit — JdImageFit은 cover/contain/fill).
//
// ⚠️ 스테이지는 **네트워크를 쓰지 않는다**: 데모가 회선 상태에 좌우되면 세 상태를 마음대로
//    보여줄 수 없다. 그래서 phase를 컨트롤로 직접 고르고 그림은 로컬 SF Symbol·색 블록이다.
//    실제 소비 코드(AsyncImage)는 아래 recipe가 정본이다.

enum ImageDemo {
    static let demo = ComponentDemo(
        id: "Image",
        controls: [
            .options(
                "state", "state (AsyncImage phase)", ["loading", "success", "error"],
                initial: "success"),
            .options("fit", "fit", JdImageFit.allCases.map(\.rawValue), initial: "cover"),
            .options("radius", "radius", ["none", "sm", "md", "lg", "xl"], initial: "lg"),
        ],
        swiftUI: { state in AnyView(ImageStage(state: state)) },
        recipe: """
            // Image = AsyncImage phase 관용구 (04 §10.1 — 신규 컴포넌트 없음)
            AsyncImage(url: url) { phase in
                switch phase {
                case .empty:                                   // 웹 status="loading"
                    JdSpinner(size: .sm)
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(JdToken.Color.cardHover.color)
                case .success(let image):                      // status="loaded"
                    image.resizable()
                        .aspectRatio(contentMode: .fill)       // JdImageFit.cover (.fit = contain)
                case .failure:                                 // status="error" — 폴백
                    Image(systemName: "photo")
                        .font(.system(size: JdIconSize.lg.side))
                        .foregroundColor(JdToken.Color.mutedLight.color)
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(JdToken.Color.cardHover.color)
                @unknown default:
                    EmptyView()
                }
            }
            .frame(height: 160)
            .clipShape(RoundedRectangle(cornerRadius: JdToken.Radius.lg, style: .continuous))
            .accessibilityLabel(Text(alt))    // 의미 있는 이미지만. 장식이면 .accessibilityHidden(true)

            // UIKit — 로딩은 URLSession, 표시는 UIImageView
            imageView.contentMode = .scaleAspectFill    // cover (.scaleAspectFit = contain, .scaleToFill = fill)
            imageView.clipsToBounds = true
            imageView.layer.cornerRadius = JdToken.Radius.lg
            """
    )

    // 무대 높이 — 레시피의 frame(height: 160)과 같은 자리(토큰 파생 80×2)
    static let stageHeight = JdToken.Space.s20 * 2
}

@MainActor
private func imageFit(_ state: DemoState) -> JdImageFit {
    JdImageFit(rawValue: state.string("fit")) ?? .cover
}

@MainActor
private func imageRadius(_ state: DemoState) -> CGFloat {
    switch state.string("radius") {
    case "none": return JdToken.Radius.none
    case "sm": return JdToken.Radius.sm
    case "md": return JdToken.Radius.md
    case "xl": return JdToken.Radius.xl
    default: return JdToken.Radius.lg
    }
}

private let imageNote =
    "JdImageFit.fill(비율 무시)만 contentMode 대응이 없다 — .resizable() + 고정 "
    + "frame이 그 자리다. AsyncImage는 URLSession 공유 캐시에만 기대므로 긴 목록의 재사용 캐싱은 "
    + "소비자 몫이다(서드파티 0 규칙상 이미지 캐시 라이브러리는 도입하지 않는다)."

private let imageStageNote =
    "이 스테이지는 네트워크를 쓰지 않는다 — 세 상태를 컨트롤로 직접 고르고 "
    + "그림은 로컬 SF Symbol이다. 실제 소비 코드는 아래 레시피(AsyncImage phase)가 정본이다."

private struct ImageStage: View {
    @ObservedObject var state: DemoState

    var body: some View {
        let radius = imageRadius(state)

        return VStack(spacing: JdToken.Space.s4) {
            ImagePhaseBlock(
                phase: state.string("state", fallback: "success"),
                fit: imageFit(state)
            )
            .frame(
                maxWidth: .infinity,
                minHeight: ImageDemo.stageHeight,
                maxHeight: ImageDemo.stageHeight
            )
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .accessibilityLabel(Text("산 사진 예시"))

            VStack(spacing: JdToken.Space.s1) {
                Text(imageStageNote)
                Text(imageNote)
            }
            .font(.footnote)
            .foregroundColor(.secondary)
            .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(JdToken.Space.s6)
    }
}

// AsyncImage.phase 3분기와 같은 모양 — 소스만 로컬이다
private struct ImagePhaseBlock: View {
    var phase: String
    var fit: JdImageFit

    var body: some View {
        switch phase {
        case "loading":
            // 웹 status="loading"
            JdSpinner(size: .sm)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(JdToken.Color.cardHover.color)
        case "error":
            // 웹 status="error" — 폴백
            Image(systemName: "photo")
                .font(.system(size: JdIconSize.lg.side))
                .foregroundColor(JdToken.Color.mutedLight.color)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(JdToken.Color.cardHover.color)
        default:
            // 웹 status="loaded" — fit 3값이 여기서 갈린다
            ImageFitBlock(fit: fit)
        }
    }
}

private struct ImageFitBlock: View {
    var fit: JdImageFit

    var body: some View {
        // 비율이 있는 그림이라야 cover/contain/fill이 갈린다
        let art = Image(systemName: "photo.artframe").resizable()

        return ZStack {
            JdToken.Color.cardHover.color
            switch fit {
            case .cover:
                // 무대를 덮고 넘치는 쪽이 잘린다(웹 object-fit: cover)
                art.aspectRatio(contentMode: .fill)
            case .contain:
                // 비율을 지키며 안에 들어간다(웹 contain) — 남는 쪽에 여백이 생긴다
                art.aspectRatio(contentMode: .fit)
            case .fill:
                // 비율을 무시하고 늘어난다(웹 fill) — contentMode 대응이 없는 자리
                art
            }
        }
        .foregroundColor(JdToken.Color.primary.color)
        .clipped()
    }
}
