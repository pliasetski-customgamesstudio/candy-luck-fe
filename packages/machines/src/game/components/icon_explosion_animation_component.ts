import { SubstituteIconComponent, SubstituteIconItem } from './substitute_icon_componenent';
import {
  Container,
  EmptyAction,
  FunctionAction,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { IReelsConfig } from '../../reels_engine/i_reels_config';
import { SceneCommon, SpecialSymbolGroup } from '@cgs/common';
import { ResourcesComponent } from './resources_component';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_IReelsConfigProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IReelsConfigProvider } from './interfaces/i_reels_config_provider';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';

export class IconExplosionAnimationComponent extends SubstituteIconComponent {
  private _startPositions: Vector2[];
  private _reelsConfig: IReelsConfig;
  private _movingSceneName: string;
  private _sceneCommon: SceneCommon;
  private _gameResourceProvider: ResourcesComponent;
  private _moveSpeed: number = 1000.0;
  private _animIconsHolderPosition: Vector2;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    symbolMap: SubstituteIconItem[],
    movingSceneName: string,
    marker: string,
    substituteStateName: string
  ) {
    super(container, symbolMap, false, marker, substituteStateName);
    console.log('load ' + this.constructor.name);
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._container = container;

    this._gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this._reelsConfig =
      container.forceResolve<IReelsConfigProvider>(T_IReelsConfigProvider).reelsConfig;
    this._startPositions = new Array<Vector2>(this.slotParams.reelsCount);

    const animIconsHolder = this._gameResourceProvider.slot.findById('anim_icons_holder')!;
    this._animIconsHolderPosition = new Vector2(
      animIconsHolder.worldTransform.tx,
      animIconsHolder.worldTransform.ty
    );
    this._gameResourceProvider.root.inverseTransform.transformVectorInplace(
      this._animIconsHolderPosition
    );

    for (let i = 0; i < this._startPositions.length; i++) {
      const startReelNodePos = this._gameResourceProvider.findStartReelNode(i).position;
      this._startPositions[i] = this._animIconsHolderPosition.add(
        new Vector2(startReelNodePos.x, startReelNodePos.y - 5 * this._reelsConfig.symbolSize.y)
      );
    }

    gameStateMachine.accelerate.entered.listen((_) => {
      const nodesToRemove = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.findAllById(this._movingSceneName);
      nodesToRemove.forEach((e) =>
        this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root.removeChild(e)
      );
    });
  }

  preSubstituteAction(symbol: SpecialSymbolGroup): IntervalAction {
    const actions: IntervalAction[] = [];
    const position = symbol.positions![0];
    const drawId = this.iconAnimationHelper.getDrawIndexes(position)[0];
    const stoppedEntity = this.iconAnimationHelper.getEntities(position)[0];
    const reelIndex = this.iconAnimationHelper.getReelIndex(position);
    const entityPosition = stoppedEntity.get<Vector2>(
      this.reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position)
    );
    const longIcon = this.slotParams.longIcons.find((p) => p.iconIndex == drawId / 100) || null;
    const iconLength = longIcon ? longIcon.length : 1;

    const scene = this._sceneCommon.sceneFactory.build(this._movingSceneName)!;
    scene.z = 999;
    scene.id = this._movingSceneName;
    scene.initialize();
    this._gameResourceProvider.root.addChild(scene);

    const moveAnimDuration =
      entityPosition.add(this._animIconsHolderPosition).subtract(this._startPositions[reelIndex])
        .length / this._moveSpeed;

    const moveToObject = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(
        this._startPositions[reelIndex],
        entityPosition.add(this._animIconsHolderPosition)
      )
      .withTimeFunction((time, _start, _dx) => time)
      .withDuration(moveAnimDuration);

    moveToObject.valueChange.listen((e) => {
      scene.position = e;
    });

    const animState = scene.stateMachine!.findById('anim')!;
    const boomState = scene.stateMachine!.findById('boom_' + iconLength)!;
    actions.push(new FunctionAction(() => scene.stateMachine!.switchToState(animState.name)));
    actions.push(moveToObject);
    actions.push(new FunctionAction(() => scene.stateMachine!.switchToState(boomState.name)));

    return new ParallelAction([
      new SequenceAction(actions),
      new EmptyAction().withDuration(moveAnimDuration),
    ]);
  }
}
