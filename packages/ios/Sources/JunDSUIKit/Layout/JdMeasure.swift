import UIKit

/// 자식 뷰 측정의 **단일 규칙** (DEC-046).
///
/// ## 왜 필요했나 — 실제로 화면이 비었다
/// `JdWrapView`·`JdColumnsView`는 자식을 frame으로 놓으므로 "이 뷰가 이 폭에서 얼마나
/// 높은가"를 스스로 물어야 한다. 처음엔 `sizeThatFits` → `intrinsicContentSize` 순으로
/// 물었는데, **UIKit에서 그 둘은 Auto Layout 기반 뷰에 답하지 못한다**:
///
/// - `UIView.sizeThatFits(_:)`의 **기본 구현은 `bounds.size`를 돌려준다.** 아직 배치되지
///   않은 뷰는 `.zero`다. 스스로 `sizeThatFits`를 재정의한 뷰(UILabel, 자체 배치 뷰)만
///   의미 있는 값을 준다.
/// - `intrinsicContentSize`는 내용이 있는 리프(라벨·이미지)의 것이다. 내부 제약으로 크기가
///   정해지는 **컨테이너**는 `noIntrinsicMetric`을 돌려준다.
///
/// `JdMicroKpiCellView`가 정확히 후자였다(내부 스택을 네 변에 핀). 그래서 셀 높이가 0으로
/// 접혀 KPI 행이 **테두리 선만 남은 빈 줄**로 렌더됐다 — 시뮬레이터에서 눈으로 확인.
///
/// ## 왜 테스트가 못 잡았나
/// 테스트 픽스처가 `sizeThatFits`를 **재정의한** 가짜 뷰였다. 그래서 첫 경로에서 답이 나와
/// 나머지 경로를 한 번도 밟지 않았다 — 자기충족적 테스트였다. 이제 진짜 Auto Layout 뷰로
/// 회귀 테스트를 둔다.
///
/// ## 규칙
/// `systemLayoutSizeFitting` → `sizeThatFits` → `intrinsicContentSize` 순으로 묻고 **처음
/// 유효한 답**을 쓴다. 순서가 이 방향인 이유: 내부 제약이 있는 뷰는 첫 경로가 정확하고,
/// 자체 배치 뷰(우리 랩·열 뷰 자신)는 제약이 없어 첫 경로가 0을 주므로 자연히 두 번째로
/// 내려간다. 반대 순서면 위의 결함이 그대로 남는다.
@MainActor
public enum JdMeasure {

    /// "폭 제한 없음"으로 볼 임계값.
    ///
    /// ⚠️ `.greatestFiniteMagnitude`는 **유한하다**(`isFinite == true`). UIKit 관용상
    /// `sizeThatFits(CGSize(width: .greatestFiniteMagnitude, ...))`를 흔히 넘기는데,
    /// `isFinite`만으로 판정하면 그것을 "폭 900이 아니라 폭 1.8e308으로 강제"로 읽는다.
    /// 실제로 태그 칩이 컨테이너 폭을 요구해 한 줄에 하나씩 깔렸다(테스트가 잡음, DEC-047).
    public static let unboundedThreshold: CGFloat = 1_000_000

    /// 주어진 폭에서 뷰가 요구하는 크기. 폭이 무한(또는 임계값 이상)이면 내용이 원하는 폭을 구한다.
    public static func size(of view: UIView, width: CGFloat) -> CGSize {
        let bounded = width.isFinite && width > 0 && width < unboundedThreshold

        // (1) 내부 Auto Layout 제약 — 셀·카드처럼 자식을 제약으로 붙인 컨테이너의 정답.
        //     세로는 fittingSizeLevel로 열어 내용이 요구하는 높이를 그대로 받는다.
        let target = CGSize(
            width: bounded ? width : UIView.layoutFittingCompressedSize.width,
            height: 0)
        let system = view.systemLayoutSizeFitting(
            target,
            withHorizontalFittingPriority: bounded ? .required : .fittingSizeLevel,
            verticalFittingPriority: .fittingSizeLevel
        )
        if system.height > 0 {
            return clamp(
                CGSize(
                    width: bounded ? min(system.width, width) : system.width,
                    height: system.height), width: width, bounded: bounded)
        }

        // (2) sizeThatFits를 스스로 재정의한 뷰 — UILabel, 그리고 우리 자체 배치 뷰들
        let fits = view.sizeThatFits(
            CGSize(
                width: bounded ? width : .greatestFiniteMagnitude,
                height: .greatestFiniteMagnitude))
        if fits.height > 0 && fits.width > 0 {
            return clamp(fits, width: width, bounded: bounded)
        }

        // (3) 내용 리프의 고유 크기
        let intrinsic = view.intrinsicContentSize
        let w = intrinsic.width == UIView.noIntrinsicMetric ? 0 : max(0, intrinsic.width)
        let h = intrinsic.height == UIView.noIntrinsicMetric ? 0 : max(0, intrinsic.height)
        return clamp(CGSize(width: w, height: h), width: width, bounded: bounded)
    }

    /// 컨테이너보다 넓은 자식은 폭을 접는다 — 넘쳐 흐르지 않게
    private static func clamp(_ size: CGSize, width: CGFloat, bounded: Bool) -> CGSize {
        guard bounded else { return size }
        return CGSize(width: min(size.width, width), height: size.height)
    }

    /// 흐름 배치(줄바꿈)용 측정 — **내용이 원하는 폭**을 먼저 구한다.
    ///
    /// `size(of:width:)`는 폭을 `.required`로 강제한다. 격자에서는 그게 맞지만(열 폭이
    /// 정해져 있다) 흐름에서는 치명적이다: 칩마다 컨테이너 폭을 요구하게 되어 **한 줄에
    /// 하나씩** 놓인다. 실제로 태그 칩 8개가 폭 900에서도 8줄로 깔렸다(테스트가 잡음).
    ///
    /// 그래서 자연 폭으로 재고, 그것이 컨테이너보다 넓을 때만 폭을 강제해 다시 잰다
    /// (여러 줄이 되는 라벨의 높이를 얻기 위해).
    public static func flowSize(of view: UIView, maxWidth: CGFloat) -> CGSize {
        // .infinity 를 쓴다 — .greatestFiniteMagnitude 는 유한이라 "무제한"이 아니다(위 주석)
        let natural = size(of: view, width: .infinity)
        guard maxWidth.isFinite, maxWidth > 0, maxWidth < unboundedThreshold,
            natural.width > maxWidth
        else { return natural }
        return size(of: view, width: maxWidth)
    }
}
