import {
  SceneObject,
  Container,
  AbstractMouseEvent,
  MouseDownEvent,
  Vector2,
  Rect,
} from '@cgs/syd';
import { CheatComponent } from './cheat_component';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { ResourcesComponent } from './resources_component';
import { Cheat } from './node_tap_action/strategies/cheat_provider_strategy';
import {
  T_CheatComponent,
  T_IGameParams,
  T_IReelsConfigProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IGameParams } from '../../reels_engine/interfaces/i_game_params';

export class CheatSceneObject extends SceneObject {
  private _reelIndex: number;
  private _container: Container;
  private _isActive: boolean;
  private _cheatComponent: CheatComponent;

  constructor(container: Container, reelIndex: number) {
    super();
    this._container = container;
    this._reelIndex = reelIndex;
    this._cheatComponent = this._container.forceResolve<CheatComponent>(T_CheatComponent);
    this._isActive = true;
  }

  public deactivateCheat(): void {
    this._isActive = false;
  }

  public activateCheat(): void {
    this._isActive = true;
  }

  public onTouch(event: AbstractMouseEvent): void {
    if (event instanceof MouseDownEvent && this._isActive) {
      switch (this._reelIndex) {
        case 0:
          this._cheatComponent.setCheatType(Cheat.Bonus);
          break;
        case 1:
          this._cheatComponent.setCheatType(Cheat.FreeSpins);
          break;
        case 2:
          this._cheatComponent.setCheatType(Cheat.Config);
          break;
        case 4:
          this._cheatComponent.setCheatType(Cheat.Scatter);
          break;
        default:
          break;
      }
      this._cheatComponent.doSpin();
    }

    if (event instanceof MouseEvent) {
      event.accept();
    }
  }
}

export class CheatSceneObjectProvider {
  private readonly _container: Container;
  private readonly _cheatNodes: CheatSceneObject[];

  constructor(container: Container, isTouchable: boolean = true) {
    this._container = container;
    this._cheatNodes = [];
    this.initCheatPanel(isTouchable);
  }

  public get container(): Container {
    return this._container;
  }

  public get cheatNodes(): CheatSceneObject[] {
    return this._cheatNodes;
  }

  private initCheatPanel(isTouchable: boolean): void {
    const res = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    const iconsHolder = res.slot.findById('icons_holder') as SceneObject;
    const gameParams = this._container.forceResolve<IGameParams>(T_IGameParams);
    const reelsConfig =
      this._container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;

    for (let i = 0; i < reelsConfig.reelCount; i++) {
      const reelOffset = reelsConfig.reelsOffset[i];
      const cheatSceneObject = new CheatSceneObject(this._container, i) as CheatSceneObject;
      cheatSceneObject.position = new Vector2(reelsConfig.symbolSize.x * i, 0.0).add(reelOffset);
      if (reelsConfig.symbolSizeByReel) {
        cheatSceneObject.position = new Vector2(i * reelsConfig.symbolSizeByReel[i].x, 0.0).add(
          reelOffset
        );
      }
      cheatSceneObject.touchable = isTouchable;
      cheatSceneObject.touchArea = Rect.fromSize(
        Vector2.Zero,
        new Vector2(
          reelsConfig.symbolSize.x,
          reelsConfig.symbolSize.y * gameParams.maxIconsPerGroup
        )
      );
      if (reelsConfig.symbolSizeByReel) {
        // let xSize = 0.0;
        let ySize = 0.0;
        for (let j = 0; j < reelsConfig.lineCount; j++) {
          ySize += reelsConfig.symbolSizeByReel[i].y;
        }
        cheatSceneObject.touchArea = Rect.fromSize(
          Vector2.Zero,
          new Vector2(reelsConfig.symbolSizeByReel[i].x, ySize)
        );
      }
      iconsHolder.touchable = isTouchable;
      if (!iconsHolder.isInitialized) {
        iconsHolder.initialize();
      }
      iconsHolder.addChild(cheatSceneObject);
      this._cheatNodes.push(cheatSceneObject);
    }
  }

  public getCheatNodes(): CheatSceneObject[] {
    return this._cheatNodes;
  }
}
