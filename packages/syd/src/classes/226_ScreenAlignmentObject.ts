import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';
import { SpriteBatch } from './248_SpriteBatch';
import { SceneObject } from './288_SceneObject';
import { Matrix3 } from './57_Matrix3';
import { VerticalAlignment } from './66_VerticalAlignment';
import { HorizontalAlignment } from './73_HorizontalAlignment';
import { SceneObjectType } from './SceneObjectType';

export class ScreenAlignmentObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.ScreenAlignment;
  }

  private _halign: HorizontalAlignment = HorizontalAlignment.None;
  private _valign: VerticalAlignment = VerticalAlignment.None;
  private _coordinateSystem: Rect;

  get halign(): HorizontalAlignment {
    return this._halign;
  }

  set halign(value: HorizontalAlignment) {
    this._halign = value;
    this.invalidateWorldTransform();
  }

  get valign(): VerticalAlignment {
    return this._valign;
  }

  set valign(value: VerticalAlignment) {
    this._valign = value;
    this.invalidateWorldTransform();
  }

  constructor(coordinateSystem: Rect) {
    super();
    this._coordinateSystem = coordinateSystem;
  }

  draw(spriteBatch: SpriteBatch): void {
    const cs = spriteBatch.getCoordinateSystem();
    if (this._coordinateSystem !== cs) {
      this.layoutImpl(cs);
    }
    super.draw(spriteBatch);
  }

  layoutImpl(coordinateSystem: Rect): void {
    this._coordinateSystem = coordinateSystem;
    this.invalidateWorldTransform();
  }

  calculateWorldTransform(parentTransform: Matrix3, result: Matrix3): void {
    Matrix3.Multiply(this.localTransform, parentTransform, result);

    const position = this._calculateAlignment(this._coordinateSystem, parentTransform);

    result.tx = position.x + super.position.x;
    result.ty = position.y + super.position.y;
  }

  private _calculateAlignment(coordSystem: Rect, parentTransform: Matrix3): Vector2 {
    let x = 0.0;
    let y = 0.0;

    switch (this._valign) {
      case VerticalAlignment.Top:
        y = coordSystem.lt.y;
        break;
      case VerticalAlignment.Center:
        y = coordSystem.lt.y + coordSystem.height * 0.5;
        break;
      case VerticalAlignment.Bottom:
        y = coordSystem.lt.y + coordSystem.height;
        break;
      case VerticalAlignment.None:
        y = parentTransform.ty;
        break;
    }

    switch (this._halign) {
      case HorizontalAlignment.Left:
        x = coordSystem.lt.x;
        break;
      case HorizontalAlignment.Center:
        x = coordSystem.lt.x + coordSystem.width * 0.5;
        break;
      case HorizontalAlignment.Right:
        x = coordSystem.lt.x + coordSystem.width;
        break;
      case HorizontalAlignment.None:
        x = parentTransform.tx;
        break;
    }

    return new Vector2(x, y);
  }
}
