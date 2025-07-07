import { Texture } from './41_Texture';
import { Polyline } from './185_Polyline';
import { SpriteBatch } from './248_SpriteBatch';
import { SpriteVertex } from './115_SpriteVertex';
import { Matrix3 } from './57_Matrix3';

export class PolylineRenderer {
  texture: Texture;
  polyline: Polyline;

  draw(spriteBatch: SpriteBatch, vertices: Array<SpriteVertex>, transform: Matrix3): void {
    spriteBatch.drawSpriteVertices(this.texture, vertices, transform);
  }
}
