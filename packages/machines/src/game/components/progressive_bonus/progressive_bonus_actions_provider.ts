import { ISpinResponse, SceneCommon } from '@cgs/common';
import { LazyAction } from '@cgs/shared';
import {
  SceneObject,
  Container,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  EmptyAction,
  IntervalAction,
  Vector2,
  InterpolateInplaceAction,
} from '@cgs/syd';
import { DrawOrderConstants } from '../../common/slot/views/base_popup_view';
import { PlaySoundAction } from '../../../reels_engine/actions/play_sound_action';
import { StopSoundAction } from '../../../reels_engine/actions/stop_sound_action';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconsSoundModel } from '../../../reels_engine/icons_sound_model';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { IconAnimationHelper } from '../../../reels_engine/utils/icon_animation_helper';
import { DynamicDrawOrdersProvider } from '../dynamic_draw_orders_provider';
import { FreeSpinsLogoComponent } from '../freeSpins_logo_component';
import { IconModelComponent } from '../icon_model_component';
import { IconsSoundModelComponent } from '../icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { ResourcesComponent } from '../resources_component';
import { IProgressiveBonusActionsProvider } from './i_progressive_bonus_actions_provider';
import { IProgressiveBonusDependencyProvider } from './i_progressive_bonus_dependency_provider';
import {
  T_DynamicDrawOrdersProvider,
  T_FreeSpinsLogoComponent,
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_IProgressiveBonusDependencyProvider,
  T_ISlotGameEngineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../../../type_definitions';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IIconModel } from '../../../reels_engine/i_icon_model';

export class ProgressiveBonusActionsProvider implements IProgressiveBonusActionsProvider {
  reelsEngine: ReelsEngine;
  resourceComponent: ResourcesComponent;
  progressiveBonusDependencyProvider: IProgressiveBonusDependencyProvider;
  iconsModel: IIconModel;
  reelsSoundModel: ReelsSoundModel;
  iconsSoundModel: IconsSoundModel;
  iconAnimationHelper: IconAnimationHelper;
  gameStateMachine: GameStateMachine<ISpinResponse>;
  movingScene: SceneObject | null;
  destinationHolder: SceneObject;
  progressiveScene: SceneObject;
  progressFinished: boolean;
  progressiveHolderId: string;
  moveAnimDuration: number;
  playIconSound: boolean;
  stepDurations: number[];
  currentStep: number;
  stepsCount: number;
  logoNode: SceneObject;
  hideLogo: boolean;
  dynamicDrawOrderProvider: DynamicDrawOrdersProvider | null;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    movingSceneName: string,
    progressiveSceneName: string,
    stepsCount: number,
    progressiveHolderId: string,
    destinationHolderName: string,
    {
      hideLogo = false,
      moveAnimDuration = 0.5,
      progressiveLogo = false,
      playIconSound = true,
    }: {
      hideLogo?: boolean;
      moveAnimDuration?: number;
      progressiveLogo?: boolean;
      playIconSound?: boolean;
    }
  ) {
    this.InitEngineDependentComponents(container);
    this.resourceComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
    this.progressiveBonusDependencyProvider = container.forceResolve(
      T_IProgressiveBonusDependencyProvider
    );
    this.iconsModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this.reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this.iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this.gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this.playIconSound = playIconSound;

    this.initProgressiveScene(container, progressiveSceneName, progressiveLogo, sceneCommon);

    this.destinationHolder = this.progressiveScene.findById(destinationHolderName)!;

    this.movingScene = sceneCommon.sceneFactory.build(movingSceneName);
    if (this.movingScene) {
      this.movingScene.z = 9999;

      if (this.movingScene.stateMachine) {
        this.movingScene.stateMachine.switchToState('default');
      }

      this.movingScene.visible = false;
      this.movingScene.active = true;
      this.movingScene.initialize();
      this.resourceComponent.root.addChild(this.movingScene);
      this.moveAnimDuration = moveAnimDuration;
    }

    this.hideLogo = hideLogo;
    this.logoNode =
      container.forceResolve<FreeSpinsLogoComponent>(T_FreeSpinsLogoComponent).controller.logoNode;
    this.dynamicDrawOrderProvider = container.resolve(T_DynamicDrawOrdersProvider);
    this.InitSteps(stepsCount);
  }

  initProgressiveScene(
    container: Container,
    progressiveSceneName: string,
    progressiveLogo: boolean,
    sceneCommon: SceneCommon
  ) {
    if (progressiveLogo) {
      this.progressiveScene =
        container.forceResolve<FreeSpinsLogoComponent>(
          T_FreeSpinsLogoComponent
        ).controller.logoNode;
    } else {
      if (progressiveSceneName) {
        this.progressiveScene = sceneCommon.sceneFactory.build(progressiveSceneName)!;
        this.progressiveScene.initialize();
        this.progressiveScene.z = DrawOrderConstants.ProgressiveBonusDrawOrder;
        this.resourceComponent.root.addChild(this.progressiveScene);
      } else {
        this.progressiveScene = this.resourceComponent.root;
      }
    }
  }

  IconAnimationAction(position: number): Action {
    const reelIndex = position % this.reelsEngine.ReelConfig.reelCount;
    const lineIndex = Math.floor(position / this.reelsEngine.ReelConfig.reelCount);

    const entity = this.reelsEngine.getStopedEntities(reelIndex, lineIndex)[0];
    const drawId = entity.get<number>(
      this.reelsEngine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
    );

    return new SequenceSimpleAction([
      new FunctionAction(() => this.iconAnimationHelper.startAnimOnEntity(entity, 'anim'), false),
      this.playIconSound
        ? new StopSoundAction(this.iconsSoundModel.getIconSound(drawId))
        : new EmptyAction(),
      this.playIconSound
        ? PlaySoundAction.withSound(this.iconsSoundModel.getIconSound(drawId))
        : new EmptyAction(),
      new EmptyAction().withDuration(
        this.iconAnimationHelper.getEntityAnimDuration(entity, 'anim') + 0.1
      ),
      new FunctionAction(() => this.iconAnimationHelper.stopAnimOnEntity(entity, 'anim'), false),
    ]);
  }

  MovingSceneAction(position: number): Action {
    const moveToAction = this.getMovingAction(
      position,
      this.moveAnimDuration,
      this.getStartPositionOffset()
    );

    return new SequenceSimpleAction([
      new FunctionAction(() => {
        this.showMovingScene();
        this.reelsSoundModel.getSoundByName('collect').stop();
        this.reelsSoundModel.getSoundByName('collect').play();
      }),
      moveToAction,
      new FunctionAction(() => {
        this.hideMovingScene();
      }),
    ]);
  }

  ProgressiveSceneAction(symbolId: number, symbolWin: number): Action {
    const actions: Action[] = [];

    const progressiveElement = this.progressiveScene.findById(this.progressiveHolderId)!;
    actions.push(new FunctionAction(() => progressiveElement.stateMachine!.switchToState('next')));

    let animationDuration = 0.0;
    for (
      let i = 0;
      i < this.progressiveBonusDependencyProvider.symbolProgressiveStepsCount.get(symbolId)!;
      i++
    ) {
      animationDuration += this.stepDurations[this.currentStep];
      this.currentStep++;

      if (this.currentStep === this.stepsCount) {
        this.currentStep = 0;
        this.progressFinished = true;
      }
    }

    const waitAction = new EmptyAction().withDuration(animationDuration);
    actions.push(waitAction);

    return new SequenceSimpleAction(actions);
  }

  ResetAction(): Action {
    const progressiveElement = this.progressiveScene.findById(this.progressiveHolderId)!;
    return new FunctionAction(() => progressiveElement.stateMachine!.switchToState('default'));
  }

  Reset(): void {
    this.progressFinished = false;
    const progressiveElement = this.progressiveScene.findById(this.progressiveHolderId)!;
    progressiveElement.stateMachine!.switchToState('default');
  }

  enableFeature(enable: boolean): void {
    if (!enable) {
      this.progressFinished = false;
    }
  }

  ProgressiveRecovery(
    step: number,
    currentWin: number,
    resetWhenCollectingComplete: boolean
  ): void {
    const progressiveElement = this.progressiveScene.findById(this.progressiveHolderId)!;
    progressiveElement.stateMachine!.restart();
    progressiveElement.stateMachine!.switchToState('default');

    if (
      this.gameStateMachine.curResponse.freeSpinsInfo &&
      this.gameStateMachine.curResponse.freeSpinsInfo.event !==
        FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      progressiveElement.stateMachine!.switchToState('fs');
    }

    if (step === this.stepsCount - 1 && resetWhenCollectingComplete) {
      step = 0;
    } else if (step === this.stepsCount - 1) {
      this.progressFinished = true;
      progressiveElement.stateMachine!.switchToState('step_' + step.toString());
    } else {
      progressiveElement.stateMachine!.switchToState('step_' + step.toString());
    }

    this.currentStep = step;
  }

  InitSteps(stepsCount: number): void {
    this.stepsCount = stepsCount;
    this.currentStep = 0;
    const progressiveElement =
      this.progressiveHolderId && this.progressiveHolderId.length > 0
        ? this.progressiveScene.findById(this.progressiveHolderId)
        : null;

    if (progressiveElement) {
      this.stepDurations = [];

      for (let i = 0; i < stepsCount; i++) {
        const progressiveState = progressiveElement.stateMachine!.findById('step_' + i.toString())!;
        this.stepDurations.push((progressiveState.enterAction as IntervalAction).duration);
      }
    }
  }

  showMovingScene(): void {
    if (this.dynamicDrawOrderProvider && this.hideLogo) {
      this.dynamicDrawOrderProvider.changeDrawOrder(this.progressiveScene, this.logoNode);
    }

    if (this.movingScene) {
      this.movingScene.visible = true;
      if (this.movingScene.stateMachine) {
        this.movingScene.stateMachine.switchToState('anim');
      }
    }
  }

  hideMovingScene(): void {
    if (this.movingScene) {
      this.movingScene.visible = false;
      if (this.movingScene.stateMachine) {
        this.movingScene.stateMachine.switchToState('default');
      }
    }
  }

  getStartMovingScenePosition(positionOnReels: number, offset: Vector2): Vector2 {
    const reelIndex = positionOnReels % this.reelsEngine.ReelConfig.reelCount;
    const lineIndex = Math.floor(positionOnReels / this.reelsEngine.ReelConfig.reelCount);
    const positionIndex = this.reelsEngine.entityEngine.getComponentIndex(ComponentNames.Position);

    const entity = this.reelsEngine.getStopedEntities(reelIndex, lineIndex)[0];
    const entityPosition = entity.get<Vector2>(positionIndex);

    const animIconsHolder = this.resourceComponent.slot.findById('anim_icons_holder')!;
    const animIconsHolderPosition = new Vector2(
      animIconsHolder.worldTransform.tx,
      animIconsHolder.worldTransform.ty
    );
    this.resourceComponent.root.inverseTransform.transformVectorInplace(animIconsHolderPosition);

    return animIconsHolderPosition.add(entityPosition).add(offset);
  }

  getDestinationMovingScenePosition(): Vector2 {
    const destination = new Vector2(
      this.destinationHolder.worldTransform.tx,
      this.destinationHolder.worldTransform.ty
    );
    this.movingScene!.parent!.inverseTransform.transformVectorInplace(destination);
    return destination;
  }

  getMovingAction(
    positionOnReels: number,
    duration: number,
    stratPositionOffset: Vector2
  ): LazyAction {
    return new LazyAction(() => {
      const from = this.getStartMovingScenePosition(positionOnReels, stratPositionOffset);
      const to = this.getDestinationMovingScenePosition();

      const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
        .withInterpolateFunction(Vector2.lerpInplace)
        .withValues(from, to)
        .withTimeFunction((time) => time)
        .withDuration(duration);

      interpolateAction.valueChange.listen((e) => {
        this.movingScene!.position = e;
      });

      return interpolateAction;
    });
  }

  InitEngineDependentComponents(container: Container): void {
    this.reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this.iconAnimationHelper = this.reelsEngine.iconAnimationHelper;
  }

  getStartPositionOffset(): Vector2 {
    return new Vector2(
      this.reelsEngine.internalConfig.symbolSize.x * 0.5,
      this.reelsEngine.internalConfig.symbolSize.y * 0.5
    );
  }

  StopAllAnimations(featureMarker: string): void {
    if (
      this.gameStateMachine.curResponse.specialSymbolGroups &&
      this.gameStateMachine.curResponse.specialSymbolGroups.length > 0
    ) {
      const progressiveBonusSymbols = this.gameStateMachine.curResponse.specialSymbolGroups.filter(
        (p) => p.type === featureMarker
      );
      for (const symbol of progressiveBonusSymbols) {
        for (const position of symbol.positions!) {
          const reelIndex = position % this.reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(position / this.reelsEngine.ReelConfig.reelCount);

          const entities = this.reelsEngine.getStopedEntities(reelIndex, lineIndex);
          if (entities && entities.length > 0) {
            for (const entity of entities) {
              this.iconAnimationHelper.stopAnimOnEntity(entity, null);
            }
          }

          const soundIconIds = this.reelsEngine.getSoundIconIds(position);
          if (soundIconIds && soundIconIds.length > 0) {
            for (const soundIconId of soundIconIds) {
              if (this.iconsSoundModel.hasSound(soundIconId)) {
                this.iconsSoundModel.getIconSound(soundIconId).stop();
              }
            }
          }
        }
      }
    }
  }
}
