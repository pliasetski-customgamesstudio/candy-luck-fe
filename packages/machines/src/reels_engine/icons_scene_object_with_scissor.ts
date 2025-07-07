import {
  Container,
  RenderContext,
  Vector2,
  RasterizerDescription,
  Rect,
  RasterizerState,
} from '@cgs/syd';
import { IReelsConfig } from './i_reels_config';
import { IconsSceneObject, IconInfo } from './icons_scene_object';
import { ISlotGame } from './i_slot_game';
import { T_ISlotGame } from '../type_definitions';
import {
  ICoordinateSystemInfoProvider,
  ScaleInfo,
  ScaleManager,
  T_ScaleManager,
} from '@cgs/common';
import { StringUtils } from '@cgs/shared';

export class IconsSceneObjectWithScissor extends IconsSceneObject {
  private _coordinateProvider: ICoordinateSystemInfoProvider;
  private _scaleManager: ScaleManager;
  private _scaleInfo: ScaleInfo;

  constructor(
    drawWithPushState: boolean,
    container: Container,
    reelsConfig: IReelsConfig,
    coordinateProvider: ICoordinateSystemInfoProvider
  ) {
    super(drawWithPushState, container, reelsConfig);
    this._scaleManager = container.forceResolve(T_ScaleManager);
    this._scaleManager.lobbyScaler.addScaleChangedListener((info: ScaleInfo) => {
      this._scaleInfo = info;
    });
    this._coordinateProvider = coordinateProvider;
  }

  applyRasterizerState(iconInfo: IconInfo, _context: RenderContext): void {
    const icon = iconInfo.icon;
    const resourcesComponent = this.container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    if (iconInfo.LineIndex < 0) {
      return;
    }
    const holder = resourcesComponent.findById(
      StringUtils.format('icon_holder_{0}_{1}', [iconInfo.ReelIndex, iconInfo.LineIndex])
    )!;
    const _width = holder.size.x;
    const _height = holder.size.y;
    const _animIconsHolderPosition =
      resourcesComponent.findById('anim_icons_holder')?.worldTransform;
    const holderWorldPos = this._coordinateProvider.transformToGlobalPosition(
      holder.worldTransform
    );

    const worldPosition = new Vector2(holderWorldPos.x, holderWorldPos.y);
    const description = new RasterizerDescription();

    const canvasScale = new Vector2(
      this._coordinateProvider.canvas.width / this._coordinateProvider.coordinateSystem.width,
      this._coordinateProvider.canvas.height / this._coordinateProvider.coordinateSystem.height
    );

    const newSize = this._scaleInfo.scale.multiply(holder.size).multiply(canvasScale);

    description.scissocTestEnable = true;
    description.viewPortEnable = false;
    description.scissor = new Rect(
      new Vector2(
        worldPosition.x,
        this._coordinateProvider.canvas.height - worldPosition.y - newSize.y
      ),
      new Vector2(newSize.x, newSize.y)
    );
    icon.rasterState = new RasterizerState(description);
  }
}
