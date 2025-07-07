import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { PrimitiveVertex } from './128_PrimitiveVertex';
import { Vector2 } from './15_Vector2';
import { SpriteBatch } from './248_SpriteBatch';
import { PrimitiveType } from './26_PrimitiveType';
import { Matrix3 } from './57_Matrix3';

export class PrimitivesRenderer {
  static DrawRect(spriteBatch: SpriteBatch, rect: Rect, transform: Matrix3, color: Color4): void {
    const v1 = transform.transformVector(rect.lt);
    const v2 = transform.transformVector(new Vector2(rect.rb.x, rect.lt.y));
    const v3 = transform.transformVector(new Vector2(rect.lt.x, rect.rb.y));
    const v4 = transform.transformVector(rect.rb);

    const vertices: PrimitiveVertex[] = [
      new PrimitiveVertex(v1, color),
      new PrimitiveVertex(v2, color),
      new PrimitiveVertex(v3, color),
      new PrimitiveVertex(v4, color),
    ];

    const alphaBlend = spriteBatch.renderSupport.alphaBlend;

    spriteBatch.setState(alphaBlend);
    spriteBatch.drawPrimitiveVertices(vertices, PrimitiveType.TriangleStrip);
    spriteBatch.popState(alphaBlend);
  }
}
