import { AbstractMouseEvent, MouseUpEvent, Rect, SceneObject, Vector2 } from '@cgs/syd';
import { ContextMarshaller } from '../future/ContextMarshaller';
import { NodeUtils } from '@cgs/shared';

export class ClickedOutsideNode extends SceneObject {
  private static _transformLocalPositionToWorld(so: SceneObject): Vector2 {
    const res: Vector2 = NodeUtils.worldPosition(so);
    return res;
  }

  private static _transformLocalSizeToWorld(so: SceneObject, size: Vector2): Vector2 {
    let cur: SceneObject = so;
    while (cur.parent) {
      cur = cur.parent;
      size.x *= cur.scale.x;
      size.y *= cur.scale.y;
    }
    return size;
  }

  private _nodes: SceneObject[];
  private _exceptNodes: SceneObject[];
  private _handler: () => void;

  constructor(handler: () => void, nodes: SceneObject[], exceptNodes: SceneObject[] = []) {
    super();
    this._handler = handler;
    this._nodes = nodes;
    this._exceptNodes = exceptNodes;
    this.touchable = true;
    this.touchArea = new Rect(new Vector2(-5000.0, -5000.0), new Vector2(5000.0, 5000.0));
  }

  onTouch(event: AbstractMouseEvent): void {
    if (
      this._nodes.every(
        (node) => node.visible && node.active && !node.isInPoint(event.event.location)
      )
    ) {
      if (event instanceof MouseUpEvent) {
        ContextMarshaller.marshalAsync(this._handler);
      }
    }
    // if (event instanceof MousePointerMoveEvent && (!this._exceptNodes || this._exceptNodes.every(node => node.visible && node.active && !node.isInPoint(event.event.location)))) {
    //   event.accept();
    // }
  }

  private _getNodeRectangle(node: SceneObject): Rect {
    const pos: Vector2 = ClickedOutsideNode._transformLocalPositionToWorld(node);
    const size: Vector2 = ClickedOutsideNode._transformLocalSizeToWorld(node, node.touchArea.size);
    return new Rect(pos, size);
  }
}
