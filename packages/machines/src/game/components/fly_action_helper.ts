import { SceneFactory, SceneCommon } from '@cgs/common';
import { LazyAction, StringUtils, NodeUtils } from '@cgs/shared';
import {
  SceneObject,
  Container,
  Tuple,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  ParamEvent,
  Vector2,
  InterpolateInplaceAction,
  IntervalAction,
} from '@cgs/syd';
import { IconTextHelper } from '../common/utils/icon_text_helper';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import {
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
  T_ISlotGame,
} from '../../type_definitions';
import { ResourcesComponent } from './resources_component';
import { IFlyActionHelper } from './i_fly_action_helper';

export class FlyActionHelper implements IFlyActionHelper {
  private _sceneFactory: SceneFactory;
  private _reelEngine: ReelsEngine;
  private _gameResourceProvider: ResourcesComponent;
  private _root: SceneObject;
  private _sceneCommon: SceneCommon;
  private _upperNode: SceneObject;
  private _winHolder: SceneObject;
  private _animIconHolder: SceneObject;
  private _animNode: SceneObject;
  private _bottomNode: SceneObject;
  private _hud: SceneObject;

  constructor(container: Container, sceneCommon: SceneCommon) {
    this._sceneFactory = sceneCommon.sceneFactory;
    this._reelEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._root = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._hud = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).footer;
    this._bottomNode = this._root.findById('hudMovingNode')!;
    this._upperNode = this._root.findById('contestMovingNode')!;
    this._animNode = this._hud.findById('glowAnimation')!;
    this._winHolder = this._hud.findById('TotalWinHolder')!;
  }

  public collectSceneOnIconToHud(
    pos: number,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
      duration?: number;
      valueString?: string;
    }
  ): Tuple<Action, Action> {
    const destinationHolderPos = this.getDestinationMovingScenePosition(this._winHolder);
    const action = this.collectFromIconToMachineHolder(pos, destinationHolderPos, value, options);
    return new Tuple<Action, Action>(
      action.item1,
      new SequenceSimpleAction([
        new FunctionAction(() => {
          this._animNode.stateMachine!.sendEvent(new ParamEvent<string>('anim'));
        }),
        action.item2,
      ])
    );
  }

  public getIconCenterPossitionOffset(): Vector2 {
    return new Vector2(
      this._reelEngine.internalConfig.symbolSize.x / 2,
      this._reelEngine.internalConfig.symbolSize.y / 2
    );
  }

  public flyAnimation(
    flyingNode: SceneObject,
    startPos: Vector2,
    endPos: Vector2,
    duration: number = 0.5
  ): Action {
    const moveToAction = new LazyAction(() => {
      const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
        .withInterpolateFunction(Vector2.lerpInplace)
        .withValues(startPos, endPos)
        .withTimeFunction((time, _start, _dx) => time)
        .withDuration(duration);
      interpolateAction.valueChange.listen((e) => {
        flyingNode.position = e;
      });
      return interpolateAction;
    });
    return moveToAction;
  }

  public getDestinationMovingScenePosition(destinationHolder: SceneObject): Vector2 {
    const destination = new Vector2(
      destinationHolder.worldTransform.tx,
      destinationHolder.worldTransform.ty
    );
    this._root.inverseTransform.transformVectorInplace(destination);
    return destination;
  }

  public getStartMovingScenePosition(positionOnReels: number, offset: Vector2): Vector2 {
    const reelIndex = positionOnReels % this._reelEngine.ReelConfig.reelCount;
    const lineIndex = Math.floor(positionOnReels / this._reelEngine.ReelConfig.reelCount);
    const positionIndex = this._reelEngine.entityEngine.getComponentIndex(ComponentNames.Position);
    const entity = this._reelEngine.getReelStopedEntities(reelIndex, lineIndex)[0];
    const entityPosition = entity.get(positionIndex) as Vector2;
    const animIconsHolder = this._gameResourceProvider.slot.findById(
      'anim_icons_holder'
    ) as SceneObject;
    const animIconsHolderPosition = new Vector2(
      animIconsHolder.worldTransform.tx,
      animIconsHolder.worldTransform.ty
    );
    this._gameResourceProvider.root.inverseTransform.transformVectorInplace(
      animIconsHolderPosition
    );
    return animIconsHolderPosition.add(entityPosition).add(offset);
  }

  public collectFromHolderToMachineHolder(
    startScene: SceneObject,
    destinationScene: SceneObject,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
    }
  ): Tuple<Action, Action> {
    const iconActions: Action[] = [];
    const prizeScene = this.loadSceneToSlot(options.featureSceneName!, true, 100000);
    const position = this.getDestinationMovingScenePosition(startScene);
    const endPos = this.getDestinationMovingScenePosition(destinationScene);
    iconActions.push(
      new FunctionAction(() => {
        if (options.showValueOnScene) {
          if (options.isMultiplier) {
            IconTextHelper.updateTextOnIcon(prizeScene, value.toFixed(0), options.textField);
          } else {
            IconTextHelper.updateTextOnIcon(
              prizeScene,
              IconTextHelper.formatCoinsOnIcon(value, 4),
              options.textField
            );
          }
        }
        this.addCreatedSceneToSlot(prizeScene, position);
        prizeScene.stateMachine!.sendEvent(new ParamEvent<string>(options.featureFlyState!));
      })
    );
    iconActions.push(
      this.flyAnimation(
        prizeScene,
        position,
        endPos,
        (prizeScene.stateMachine!.findById(options.featureFlyState!)!.enterAction as IntervalAction)
          ?.duration ?? 0.0
      )
    );
    const afterFlyActions: Action[] = [];
    afterFlyActions.push(this.removeCreatedSceneFromSlotAction(prizeScene));
    return new Tuple<Action, Action>(
      new SequenceSimpleAction(iconActions),
      new SequenceSimpleAction(afterFlyActions)
    );
  }

  public collectFromIconToMachineHolder(
    pos: number,
    destinationHolderPos: Vector2,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
      valueString?: string;
      duration?: number;
    }
  ): Tuple<Action, Action> {
    const iconActions: Action[] = [];
    const prizeScene = this.loadSceneToSlot(options.featureSceneName!, true, 100000);
    const position = this.getStartMovingScenePosition(pos, this.getIconCenterPossitionOffset());
    const endPos = destinationHolderPos;
    iconActions.push(
      new FunctionAction(() => {
        if (options.showValueOnScene) {
          if (!StringUtils.isNullOrWhiteSpace(options.valueString!)) {
            IconTextHelper.updateTextOnIcon(prizeScene, options.valueString!, options.textField);
          } else if (options.isMultiplier) {
            IconTextHelper.updateTextOnIcon(prizeScene, value.toFixed(0), options.textField);
          } else {
            IconTextHelper.updateTextOnIcon(
              prizeScene,
              IconTextHelper.formatCoinsOnIcon(value, 4),
              options.textField
            );
          }
        }
        this.addCreatedSceneToSlot(prizeScene, position);
        prizeScene.stateMachine!.sendEvent(new ParamEvent<string>(options.featureFlyState!));
      })
    );
    iconActions.push(
      this.flyAnimation(
        prizeScene,
        position,
        endPos,
        options.duration === 0.0
          ? (
              prizeScene.stateMachine!.findById(options.featureFlyState!)!
                .enterAction as IntervalAction
            )?.duration ?? 0.0
          : options.duration
      )
    );
    const afterFlyActions: Action[] = [];
    afterFlyActions.push(this.removeCreatedSceneFromSlotAction(prizeScene));
    return new Tuple<Action, Action>(
      new SequenceSimpleAction(iconActions),
      new SequenceSimpleAction(afterFlyActions)
    );
  }

  public collectFromIconToMachineHolderWithStartOffset(
    pos: number,
    destinationHolderPos: Vector2,
    startOffset: Vector2,
    value: number,
    options: {
      showValueOnScene?: boolean;
      isMultiplier?: boolean;
      drawOrder?: number;
      featureSceneName?: string;
      textField?: string;
      featureFlyState?: string;
      valueString?: string;
      parent?: SceneObject;
    }
  ): Tuple<Action, Action> {
    const iconActions: Action[] = [];
    const prizeScene = this.loadSceneToSlot(options.featureSceneName!, true, options.drawOrder);
    const position = this.getStartMovingScenePosition(pos, startOffset);
    const endPos = destinationHolderPos;
    iconActions.push(
      new FunctionAction(() => {
        if (options.showValueOnScene) {
          if (!StringUtils.isNullOrWhiteSpace(options.valueString!)) {
            IconTextHelper.updateTextOnIcon(prizeScene, options.valueString!, options.textField);
          } else if (options.isMultiplier) {
            IconTextHelper.updateTextOnIcon(prizeScene, value.toFixed(0), options.textField);
          } else {
            IconTextHelper.updateTextOnIcon(
              prizeScene,
              IconTextHelper.formatCoinsOnIcon(value, 4),
              options.textField
            );
          }
        }
        this.addCreatedSceneToSlot(prizeScene, position, options.parent);
        prizeScene.stateMachine!.sendEvent(new ParamEvent<string>(options.featureFlyState!));
      })
    );
    iconActions.push(
      this.flyAnimation(
        prizeScene,
        position,
        endPos,
        (prizeScene.stateMachine!.findById(options.featureFlyState!)!.enterAction as IntervalAction)
          ?.duration ?? 0.0
      )
    );
    const afterFlyActions: Action[] = [];
    afterFlyActions.push(this.removeCreatedSceneFromSlotAction(prizeScene));
    return new Tuple<Action, Action>(
      new SequenceSimpleAction(iconActions),
      new SequenceSimpleAction(afterFlyActions)
    );
  }

  public loadSceneToSlot(
    sceneName: string,
    loadFromAdditional: boolean = false,
    drawOrder?: number
  ): SceneObject {
    let fsScene: SceneObject;
    if (loadFromAdditional) {
      fsScene = this._sceneFactory.build(sceneName)!;
    } else {
      fsScene = this._sceneFactory.build(sceneName)!;
    }
    if (typeof drawOrder === 'number') {
      fsScene.z = drawOrder;
    } else {
      fsScene.z = 100000;
    }
    fsScene.visible = false;
    fsScene = NodeUtils.removeMask(fsScene);
    fsScene.active = true;
    fsScene.initialize();
    return fsScene;
  }

  public addCreatedSceneToSlot(
    scene: SceneObject,
    initialPos: Vector2,
    parent: SceneObject | null = null
  ): void {
    if (!scene.isInitialized) {
      scene.initialize();
    }
    if (parent) {
      parent.addChild(scene);
    } else {
      this._root.addChild(scene);
    }
    scene.position = initialPos;
    scene.visible = true;
  }

  public removeCreatedSceneFromSlot(scene: SceneObject): void {
    scene.parent!.removeChild(scene);
    scene.stateMachine!.sendEvent(new ParamEvent<string>('default'));
    scene.scale = new Vector2(1.0, 1.0);
    scene.visible = false;
    scene.deinitialize();
  }

  public addCreatedSceneToSlotAction(
    scene: SceneObject,
    initialPos: Vector2,
    parent: SceneObject | null = null
  ): Action {
    return new FunctionAction(() => this.addCreatedSceneToSlot(scene, initialPos, parent));
  }

  public removeCreatedSceneFromSlotAction(scene: SceneObject): Action {
    return new FunctionAction(() => this.removeCreatedSceneFromSlot(scene));
  }
}
