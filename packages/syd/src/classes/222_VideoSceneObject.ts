import { SceneObject } from './288_SceneObject';
import { VideoResource } from './92_VideoResource';
import { SpriteBatch } from './248_SpriteBatch';
import { Matrix3 } from './57_Matrix3';
import { Effect } from './89_Effect';
import { SceneObjectType } from './SceneObjectType';

export class VideoSceneObject extends SceneObject {
  get runtimeType(): SceneObjectType {
    return SceneObjectType.VideoSprite;
  }
  private _resource: VideoResource;
  private _loop: boolean = false;

  set loop(value: boolean) {
    this._loop = value;
  }

  set frame(value: number) {
    if (value === 0) {
      this._resource.data!.play(this._loop);
    }
  }

  public prepareToPlay(): Promise<void> {
    return this._resource.data!.prepareToPlay();
  }

  public stop(): void {
    this._resource.data!.stop();
  }

  constructor(resource: VideoResource) {
    super();
    this._resource = resource;
    // if(this._resource.data) {
    //   this._resource.data.preinit();
    // }
  }

  public drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
    const sprite = this._resource.data!.getSprite();

    if (sprite && sprite.texture) {
      spriteBatch.pushState(Effect.Video);
      spriteBatch.drawRect(sprite.texture, sprite.rect, sprite.rect, transform);
      spriteBatch.popState(Effect.Video);
    }
  }

  public activeChanged(active: boolean): void {
    if (this._loop) {
      if (active) {
        this._resource.data!.play(true);
      } else {
        this._resource.data!.stop();
      }
    }
  }
}
