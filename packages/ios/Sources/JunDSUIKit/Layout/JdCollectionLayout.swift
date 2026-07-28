import JunDSCore
import UIKit

// MARK: - Compositional Layout 어댑터 (DEC-058)
//
// ## 왜 만들지 않고 얹었나
// 큰 스크롤 목록·격자의 현재 정답은 `UICollectionViewCompositionalLayout`이다.
// 셀 재사용, 프리페치, 섹션별 다른 배치, 스냅·페이징, 직교 스크롤까지 Apple이 이미 했고
// 우리 프레임 기반 `JdColumnsView`로는 그 근처도 못 간다(측정 결과 Auto Layout이
// 프레임 대비 12배 느리듯, 이쪽은 셀 재사용 유무가 자릿수를 가른다).
//
// **그래서 경쟁하지 않는다.** 대신 소비자가 Compositional Layout을 쓸 때 우리 어휘를
// 그대로 쓰게 한다. 이게 없으면 화면의 절반(정적 배치)은 `JdGap.md`로, 나머지 절반
// (컬렉션)은 `NSDirectionalEdgeInsets(top: 16, …)`로 적히게 된다 — 같은 화면에서 간격이
// 어긋나기 시작하는 정확한 지점이다.
//
// ## 무엇을 주는가
// 자주 쓰는 섹션 모양 셋을 토큰만 받아 만든다:
//  - `.list`        — 한 줄에 하나
//  - `.grid`        — 열 수 고정
//  - `.adaptiveGrid`— **최소 셀 폭**만 정하면 열 수가 폭에서 따라 나온다(웹 auto-fill 동형)
//
// 셋 다 원시 `NSCollectionLayoutSection`을 돌려주므로, 부족하면 받아서 마저 손보면 된다.
// 감싸서 막지 않는 것이 요점이다 — 우리가 못 하는 것을 소비자가 할 수 있어야 한다.

public enum JdCollectionLayout {

    /// 한 줄에 하나 — 설정 목록·피드.
    ///
    /// ```swift
    /// let layout = UICollectionViewCompositionalLayout { _, env in
    ///     JdCollectionLayout.list(estimatedHeight: 72, gap: .sm, padding: .md)
    /// }
    /// ```
    ///
    /// 높이를 `estimated`로 두는 이유: 셀 내용(동적 타입·여러 줄 라벨)이 높이를 정하게 하고
    /// 자동 크기 조정을 살린다. 고정하면 글자를 키웠을 때 잘린다.
    public static func list(
        estimatedHeight: CGFloat = 60,
        gap: JdGap = .none,
        padding: JdGap = .none
    ) -> NSCollectionLayoutSection {
        let size = NSCollectionLayoutSize(
            widthDimension: .fractionalWidth(1),
            heightDimension: .estimated(estimatedHeight))
        let item = NSCollectionLayoutItem(layoutSize: size)
        let group = NSCollectionLayoutGroup.horizontal(layoutSize: size, subitems: [item])
        return section(group: group, gap: gap, padding: padding)
    }

    /// 열 수가 고정된 격자 — 웹 `<jd-grid cols="3">` 동형.
    ///
    /// - Parameter aspectRatio: 셀의 가로:세로. 1이면 정사각.
    public static func grid(
        columns: Int,
        aspectRatio: CGFloat = 1,
        gap: JdGap = .md,
        padding: JdGap = .md
    ) -> NSCollectionLayoutSection {
        precondition(columns > 0, "JdCollectionLayout.grid: 열 수는 1 이상이어야 한다 — \(columns)")
        precondition(aspectRatio > 0, "JdCollectionLayout.grid: 비율은 양수여야 한다 — \(aspectRatio)")

        let item = NSCollectionLayoutItem(
            layoutSize: NSCollectionLayoutSize(
                widthDimension: .fractionalWidth(1), heightDimension: .fractionalHeight(1)))
        // 그룹 높이를 **폭의 비율**로 잡아 열 수가 바뀌어도 셀 비율이 유지된다.
        // fractionalWidth(1)은 그룹 폭이 아니라 섹션 폭 기준이므로 열 수로 나눈다.
        let groupHeight =
            NSCollectionLayoutDimension
            .fractionalWidth((1 / CGFloat(columns)) / aspectRatio)
        let group = NSCollectionLayoutGroup.horizontal(
            layoutSize: NSCollectionLayoutSize(
                widthDimension: .fractionalWidth(1),
                heightDimension: groupHeight),
            subitem: item, count: columns)
        group.interItemSpacing = .fixed(gap.value)
        return section(group: group, gap: gap, padding: padding)
    }

    /// **최소 셀 폭**만 정하면 열 수가 폭에서 따라 나오는 격자.
    ///
    /// ```swift
    /// UICollectionViewCompositionalLayout { _, env in
    ///     env.jdAdaptiveGrid(minItemWidth: 160)
    /// }
    /// ```
    ///
    /// 웹 `repeat(auto-fill, minmax(160px, 1fr))`와 같은 규칙이다. 브레이크포인트를 고르고
    /// 구간마다 열 수를 적는 방식은 사이드바 안이나 분할 화면에서 곧 틀리는데, 이건
    /// **컨테이너 폭**에서 열 수를 계산하므로 어디에 놓아도 맞다 — `<jd-switcher>`가
    /// `calc((임계값 - 100%) * 999)`로 자기 자리를 보는 것과 같은 성질이다.
    public static func adaptiveGrid(
        minItemWidth: CGFloat,
        aspectRatio: CGFloat = 1,
        gap: JdGap = .md,
        padding: JdGap = .md,
        environment: NSCollectionLayoutEnvironment
    ) -> NSCollectionLayoutSection {
        precondition(
            minItemWidth > 0,
            "JdCollectionLayout.adaptiveGrid: 최소 폭은 양수여야 한다 — \(minItemWidth)")
        let available = environment.container.effectiveContentSize.width - padding.value * 2
        let columns = Self.columnCount(
            available: available,
            minItemWidth: minItemWidth,
            gap: gap.value)
        return grid(columns: columns, aspectRatio: aspectRatio, gap: gap, padding: padding)
    }

    /// 주어진 폭에 최소 폭을 지키며 들어가는 열 수. 순수 함수라 전수 테스트가 가능하다.
    ///
    /// n열이 들어가려면 `n*minWidth + (n-1)*gap <= available` 이어야 한다.
    /// 간격을 빼먹고 `available / minWidth`로 계산하면 마지막 열이 삐져나간다 —
    /// 격자 어댑터에서 가장 흔한 실수라 여기서 한 번만 푼다.
    public static func columnCount(
        available: CGFloat,
        minItemWidth: CGFloat,
        gap: CGFloat
    ) -> Int {
        guard available > 0, minItemWidth > 0 else { return 1 }
        let n = Int(((available + gap) / (minItemWidth + gap)).rounded(.down))
        return max(n, 1)  // 아무리 좁아도 1열 — 0열이면 섹션이 사라진다
    }

    // MARK: 내부

    private static func section(
        group: NSCollectionLayoutGroup,
        gap: JdGap,
        padding: JdGap
    ) -> NSCollectionLayoutSection {
        let section = NSCollectionLayoutSection(group: group)
        section.interGroupSpacing = gap.value
        // directional inset — RTL에서 leading/trailing이 알아서 뒤집힌다
        section.contentInsets = NSDirectionalEdgeInsets(
            top: padding.value,
            leading: padding.value,
            bottom: padding.value,
            trailing: padding.value)
        return section
    }
}

// MARK: - 브레이크포인트 연동

public extension NSCollectionLayoutEnvironment {
    /// 이 섹션이 놓인 **컨테이너 폭**의 브레이크포인트 판정.
    ///
    /// ```swift
    /// UICollectionViewCompositionalLayout { _, env in
    ///     env.jdIsAtLeast(.md)
    ///         ? JdCollectionLayout.grid(columns: 3)
    ///         : JdCollectionLayout.list()
    /// }
    /// ```
    ///
    /// 화면 폭이 아니라 컨테이너 폭을 본다 — `jdShow(above:)`·웹 `threshold`와 같은 규칙이라
    /// 분할 화면·팝오버에서도 일관된다 (04 §10).
    func jdIsAtLeast(_ breakpoint: JdBreakpoint) -> Bool {
        container.effectiveContentSize.width >= breakpoint.width
    }

    /// `JdCollectionLayout.adaptiveGrid(…, environment: env)`의 축약.
    ///
    /// 클로저가 이미 `env`를 주는데 그것을 다시 인자로 넘기는 모양(`environment: env`)은
    /// 호출부에서 가장 눈에 걸리는 잡음이었다. 받은 쪽에서 부르게 하면 사라진다.
    ///
    /// ```swift
    /// UICollectionViewCompositionalLayout { _, env in
    ///     env.jdAdaptiveGrid(minItemWidth: 160)
    /// }
    /// ```
    func jdAdaptiveGrid(
        minItemWidth: CGFloat,
        aspectRatio: CGFloat = 1,
        gap: JdGap = .md,
        padding: JdGap = .md
    ) -> NSCollectionLayoutSection {
        JdCollectionLayout.adaptiveGrid(
            minItemWidth: minItemWidth,
            aspectRatio: aspectRatio,
            gap: gap,
            padding: padding,
            environment: self)
    }
}
