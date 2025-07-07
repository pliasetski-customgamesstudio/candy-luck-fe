import { SubstituteIconComponent, SubstituteIconItem } from './substitute_icon_componenent';
import {
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { IReelsConfig } from '../../reels_engine/i_reels_config';
import { SceneCommon, SpecialSymbolGroup } from '@cgs/common';
import { Container, SceneObject } from '@cgs/syd';
import { ResourcesComponent } from './resources_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { NodeUtils } from '@cgs/shared';

export class MoveSceneOverLineProvider extends SubstituteIconComponent {
  private _startPositions: Vector2[];
  private _reelsConfig: IReelsConfig;
  private _movingSceneName: string;
  get movingSceneName(): string {
    return this._movingSceneName;
  }
  set movingSceneName(value: string) {
    this._movingSceneName = value;
  }

  private _sceneCommon: SceneCommon;
  get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }
  set sceneCommon(value: SceneCommon) {
    this._sceneCommon = value;
  }

  private _slotIconsHolder: SceneObject;
  private _gameResourceProvider: ResourcesComponent;
  private _scene: SceneObject;
  get scene(): SceneObject {
    return this._scene;
  }
  set scene(value: SceneObject) {
    this._scene = value;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    symbolMap: SubstituteIconItem[],
    movingSceneName: string,
    marker: string,
    substituteStateName: string
  ) {
    super(container, symbolMap, false, marker, substituteStateName);
    this._sceneCommon = sceneCommon;
    this._movingSceneName = movingSceneName;
    console.log('load ' + this.constructor.name);
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._reelsConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    this._startPositions = new Array<Vector2>(this.slotParams.linesCount);

    this._slotIconsHolder = this._gameResourceProvider.slot.findById('icons_holder')!;
    for (let i = 0; i < this._startPositions.length; i++) {
      const startReelNodePos = this._gameResourceProvider.findStartReelNode(i).position;
      this._startPositions[i] = NodeUtils.worldPosition(this._slotIconsHolder).add(
        new Vector2(0.0, startReelNodePos.y + this._reelsConfig.symbolSize.y * i)
      );
    }

    gameStateMachine.accelerate.entered.listen((_): void => {
      const nodesToRemove = this._gameResourceProvider.slot.findAllById(this._movingSceneName);
      nodesToRemove.forEach((e) => this._gameResourceProvider.slot.removeChild(e));
    });
  }

  substituteAction(marker: string, _substituteStateName: string): IntervalAction {
    const actions: IntervalAction[] = [];
    const symbols: SpecialSymbolGroup[] | null = this.currentResponse.specialSymbolGroups;
    const symbolGroups = symbols ? symbols.filter((p) => p.type === marker) : null;

    if (symbolGroups) {
      for (const symbolGroup of symbolGroups) {
        if (symbolGroup) {
          actions.push(this.preSubstituteAction(symbolGroup));
        }
      }
      return new ParallelAction(actions);
    }
    return new EmptyAction();
  }

  preSubstituteAction(symbol: SpecialSymbolGroup): IntervalAction {
    const actions: IntervalAction[] = [];
    const position = symbol.positions![0];
    const lineIndex = this.iconAnimationHelper.getLineIndex(position);

    this._scene = this._sceneCommon.sceneFactory.build(this._movingSceneName)!;
    this._scene.z = 999;
    this._scene.id = this._movingSceneName;
    this._scene.position = this._scene.position.add(this._startPositions[lineIndex]);
    this._scene.initialize();

    this._gameResourceProvider.slot.addChild(this._scene);
    const animState = this._scene.stateMachine!.findById('anim')!;
    actions.push(new FunctionAction(() => this._scene.stateMachine!.switchToState(animState.name)));

    return new SequenceAction(actions);
  }
}

export class ChangeIconProvider extends SubstituteIconComponent {
  private _reelsCount: number;
  private _preReelDelay: number;
  private _oneReelDelay: number;

  constructor(
    container: Container,
    symbolMap: SubstituteIconItem[],
    marker: string,
    substituteStateName: string,
    preReelDelay: number,
    oneReelDelay: number
  ) {
    super(container, symbolMap, false, marker, substituteStateName);
    this._preReelDelay = preReelDelay;
    this._oneReelDelay = oneReelDelay;
    this._reelsCount = this.slotParams.reelsCount;
  }

  preSubstituteAction(symbol: SpecialSymbolGroup): IntervalAction {
    const actions: IntervalAction[] = [];
    const position = symbol.positions![0];
    const reelIndex = this.iconAnimationHelper.getReelIndex(position);
    const duration = this._preReelDelay + this._oneReelDelay * (this._reelsCount - reelIndex);
    actions.push(new EmptyAction().withDuration(duration));
    return new SequenceAction(actions);
  }
}
