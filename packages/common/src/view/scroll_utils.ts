import {
  SceneObject,
  MouseDownEvent,
  MouseMoveEvent,
  ScrollSceneObject,
  IScrollBar,
  clamp,
  lerp,
  IStreamSubscription,
  CGSMouseEvent,
  Vector2,
} from '@cgs/syd';

export class ScrollUtils {
  static initScrollBarContainer(
    sliderContainer: SceneObject,
    scroll: ScrollSceneObject,
    bar: IScrollBar
  ): IStreamSubscription {
    sliderContainer.touchable = true;
    return sliderContainer.touchEvent.listen((e) => {
      let mouseEvent: CGSMouseEvent | null = null;
      if (e instanceof MouseDownEvent) {
        mouseEvent = e.event;
        e.accept();
      } else if (e instanceof MouseMoveEvent) {
        mouseEvent = e.moveEvent;
        e.accept();
      }
      if (mouseEvent) {
        const local = sliderContainer.inverseTransform.transformVector(mouseEvent.location);
        const factorY = clamp(
          (local.y - bar.size.y * 0.5) / (sliderContainer.touchArea.height - bar.size.y),
          0.0,
          1.0
        );
        const offsetY = lerp(0.0, scroll.contentSize.y - scroll.size.y, factorY);
        scroll.scrollBehavior.setOffset(new Vector2(0.0, offsetY));
      }
    });
  }
}
