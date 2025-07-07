import { TextureResource } from './174_TextureResource';
import { Vector2 } from './15_Vector2';
import { Matrix3 } from './57_Matrix3';
import { Mask } from './211_Mask';
import { Texture } from './41_Texture';

export class MaskParams {
  private _texture: TextureResource;
  private _texCoords: Vector2;
  private _texCoordsScale: Vector2;
  private _matrix: Matrix3 = Matrix3.undefined();

  get texture(): Texture | null {
    return this._texture.data;
  }

  get texCoords(): Vector2 {
    return this._texCoords;
  }

  get texCoordsScale(): Vector2 {
    return this._texCoordsScale;
  }

  get matrix(): Matrix3 {
    return this._matrix;
  }

  update(mask: Mask): void {
    this._texture = mask.texture;
    const texture = mask.texture.data;

    if (!texture) {
      throw new Error('Mask.texture should not be null');
    }

    this._texCoords = new Vector2(
      mask.sourceFrame.lt.x * texture.invWidth,
      mask.sourceFrame.lt.y * texture.invHeight
    );

    const frameSize = mask.sourceFrame.size;
    this._texCoordsScale = new Vector2(
      (frameSize.x * texture.invWidth) / mask.size.x,
      (frameSize.y * texture.invHeight) / mask.size.y
    );
    Matrix3.Inverse(mask.worldTransform, this._matrix);
  }
}
