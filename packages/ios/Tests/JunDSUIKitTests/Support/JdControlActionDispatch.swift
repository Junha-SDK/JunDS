import UIKit

// UIControl.sendActions(for:)는 액션 디스패치를 UIApplication.sendAction 경유로 하기 때문에,
// 앱 호스트 없이 `simctl spawn … xctest`로 도는 이 번들에서는 **조용히 무동작**이다
// (실측: setOn 직후 상태 단언은 통과하는데 target-action만 발화하지 않았다).
//
// 그래서 등록된 target-action을 직접 호출해 배선을 검증한다. addTarget이 빠지면
// allTargets/actions(forTarget:)가 비어 아무것도 부르지 못하므로 회귀 감지력은 유지된다.
extension UIControl {
    func jdSendActions(for event: UIControl.Event) {
        for target in allTargets {
            for action in actions(forTarget: target, forControlEvent: event) ?? [] {
                let selector = Selector(action)
                // 인자 없는 셀렉터에 perform(_:with:)를 쓰지 않도록 콜론 유무로 갈라 호출한다
                if action.contains(":") {
                    _ = (target as AnyObject).perform(selector, with: self)
                } else {
                    _ = (target as AnyObject).perform(selector)
                }
            }
        }
    }
}
