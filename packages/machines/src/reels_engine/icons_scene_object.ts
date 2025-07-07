import {
  SceneObject,
  Vector2,
  Container,
  RenderContext,
  RasterizerDescription,
  Rect,
  RasterizerState,
  SpriteBatch,
  SpriteBatchWebGL,
} from '@cgs/syd';
import { IReelsConfig } from './i_reels_config';
import { ISlotGame } from './i_slot_game';
import { T_ISlotGame } from '../type_definitions';
import { ICoordinateSystemInfoProvider, T_ICoordinateSystemInfoProvider } from '@cgs/common';
import { StringUtils } from '@cgs/shared';

export class IconInfo {
  icon: SceneObject;
  position: Vector2;
  LineIndex: number;
  ReelIndex: number;
  IsSingleSpinning: boolean;
  z: number;
  constructor(
    icon: SceneObject,
    position: Vector2,
    z: number,
    ReelIndex: number = -1,
    LineIndex: number = -1,
    IsSingleSpinning: boolean = false
  ) {
    this.icon = icon;
    this.position = position;
    this.z = z;
    this.ReelIndex = ReelIndex;
    this.LineIndex = LineIndex;
    this.IsSingleSpinning = IsSingleSpinning;
  }
}

export class IconsSceneObject extends SceneObject {
  private _drawableIcons: IconInfo[] = [];
  private _drawWithPushState: boolean;
  private _container: Container;
  private _reelsConfig: IReelsConfig;

  get container(): Container {
    return this._container;
  }

  get reelsConfig(): IReelsConfig {
    return this._reelsConfig;
  }

  constructor(drawWithPushState: boolean, container: Container, reelsConfig: IReelsConfig) {
    super();
    this._drawWithPushState = drawWithPushState;
    this._container = container;
    this._reelsConfig = reelsConfig;
  }

  add(iconInfo: IconInfo): void {
    if (iconInfo.icon) {
      this._drawableIcons.push(iconInfo);
    }
  }

  remove(iconInfo: IconInfo): void {
    const index = this._drawableIcons.indexOf(iconInfo);
    if (index !== -1) {
      this._drawableIcons.splice(index, 1);
    }
  }

  get length(): number {
    return this._drawableIcons.length;
  }

  clear(): void {
    this._drawableIcons = [];
  }

  updateImpl(dt: number): void {
    const icons = this._drawableIcons;
    const uniqueIcons: SceneObject[] = [];
    for (let i = 0; i < icons.length; ++i) {
      const e = icons[i];
      if (e.icon) {
        if (!uniqueIcons.includes(e.icon)) {
          uniqueIcons.push(e.icon);
          e.icon.update(dt);
        }
      }
    }
    uniqueIcons.length = 0;
  }

  applyRasterizerState(iconInfo: IconInfo, _context: RenderContext): void {
    const icon = iconInfo.icon;
    const _width = Math.round(this._reelsConfig.symbolSize.x);
    const _height = Math.round(this._reelsConfig.symbolSize.y);
    const resourcesComponent = this._container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    const animIconsHolderPosition =
      resourcesComponent.findById('anim_icons_holder')!.worldTransform;
    const coordinateSystemProvider = this._container.resolve<ICoordinateSystemInfoProvider>(
      T_ICoordinateSystemInfoProvider
    )!;
    const projection = coordinateSystemProvider.coordinateSystem;
    const holder = resourcesComponent.findById(
      StringUtils.format('icon_holder_{0}_{1}', [iconInfo.ReelIndex, iconInfo.LineIndex])
    );
    const worldPosition = !holder
      ? new Vector2(
          animIconsHolderPosition.tx -
            // @ts-ignore TODO: why this props calls from Rect object?
            projection.x +
            this._reelsConfig.symbolSize.x * iconInfo.ReelIndex,
          animIconsHolderPosition.ty -
            // @ts-ignore TODO: why this props calls from Rect object?
            projection.y +
            this._reelsConfig.symbolSize.y * iconInfo.LineIndex
        )
      : new Vector2(
          // @ts-ignore TODO: why this props calls from Rect object?
          holder.worldTransform.tx - projection.X,
          // @ts-ignore TODO: why this props calls from Rect object?
          holder.worldTransform.ty - projection.Y
        );
    const description = new RasterizerDescription();
    description.scissocTestEnable = true;
    description.viewPortEnable = false;
    description.scissor = Rect.fromSize(
      new Vector2(worldPosition.x, worldPosition.y),
      new Vector2(this._reelsConfig.symbolSize.x, this._reelsConfig.symbolSize.y)
    );
    icon.rasterState = new RasterizerState(description);
  }

  drawInternal(iconInfo: IconInfo, batcher: SpriteBatch): void {
    if (batcher instanceof SpriteBatchWebGL) {
      const glBatcher = batcher as SpriteBatchWebGL;
      if (glBatcher) {
        const context = glBatcher.context;
        if (iconInfo.IsSingleSpinning) {
          this.applyRasterizerState(iconInfo, context);
        } else {
          iconInfo.icon.rasterState = null;
        }
        //iconInfo.icon.position = iconInfo.position;
        iconInfo.icon.draw(glBatcher);
      }
    } else {
      iconInfo.icon.draw(batcher);
    }
  }

  draw(spriteBatch: SpriteBatch): void {
    const icons = this._drawableIcons;

    icons.sort((x, y) => x.z - y.z);

    spriteBatch.pushState(this.worldTransform);

    let i = 0;
    for (; i < icons.length; ++i) {
      const icon = icons[i];
      if (icon.icon.z >= 1000) {
        break;
      }

      if (this._drawWithPushState) {
        spriteBatch.pushState(icon.position);
      } else {
        icon.icon.position = icon.position;
      }

      this.drawInternal(icon, spriteBatch);

      if (this._drawWithPushState) {
        spriteBatch.popState(icon.position);
      }
    }

    spriteBatch.popState(this.worldTransform);

    super.draw(spriteBatch);

    spriteBatch.pushState(this.worldTransform);
    for (; i < icons.length; ++i) {
      const icon = icons[i];
      if (icon.icon.z < 1000) {
        break;
      }
      if (this._drawWithPushState) {
        spriteBatch.pushState(icon.position);
      } else {
        icon.icon.position = icon.position;
      }

      this.drawInternal(icon, spriteBatch);

      if (this._drawWithPushState) {
        spriteBatch.popState(icon.position);
      }
    }
    spriteBatch.popState(this.worldTransform);
  }
}
