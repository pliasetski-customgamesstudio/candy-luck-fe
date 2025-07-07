import { GameComponentProvider } from '../game_component_provider';
import { MultiSceneIconResourceProvider } from '../multi_scene_icon_resource_provider';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { IconsSoundModel } from '../../../reels_engine/icons_sound_model';
import { MultiSceneReelsEngine } from '../../../reels_engine/multi_scene_reels_engine';
import { IconAnimationHelper } from '../../../reels_engine/utils/icon_animation_helper';
import { BaseSlotSoundController } from '../../common/base_slot_sound_controller';
import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  ParallelSimpleAction,
  SequenceSimpleAction,
} from '@cgs/syd';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import {
  T_AbstractIconResourceProvider,
  T_BaseSlotSoundController,
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
} from '../../../type_definitions';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IconModelComponent } from '../icon_model_component';
import { IconsSoundModelComponent } from '../icons_sound_model_component';
import { IIconModel } from '../../../reels_engine/i_icon_model';
import { RemoveComponentsSystem } from '../../../reels_engine/systems/remove_components_system';
import { ComponentNames } from '../../../reels_engine/entity_components/component_names';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../../reels_engine/systems/update_entity_cache_system';
import { UpdateEntityCacheAction } from '../../../reels_engine/actions/update_entity_cache_action';

export class MultiSceneFrozenWildAnimationProvider extends GameComponentProvider {
  private _iconResourceProvider: MultiSceneIconResourceProvider;
  private _marker: string;
  get marker(): string {
    return this._marker;
  }
  private _drawableAnimationIndexes: number[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _iconModel: IIconModel;
  private _iconsSoundModel: IconsSoundModel;
  private _reelsEngine: MultiSceneReelsEngine;
  get reelsEngine(): MultiSceneReelsEngine {
    return this._reelsEngine;
  }
  private _iconAnimationHelper: IconAnimationHelper;
  private _animateIcon: boolean;
  get animateIcon(): boolean {
    return this._animateIcon;
  }
  private _preFrozenActionDuration: number;
  private _iconShowState: string;
  private _pauseBgSound: boolean;
  private _slotSoundController: BaseSlotSoundController;
  private _container: Container;

  constructor(
    container: Container,
    marker: string,
    drawableAnimationIndexes: number[],
    {
      animateIcon = true,
      preFrozenActionDuration = 0.0,
      iconShowState = 'anim',
      pauseBgSound = false,
    }
  ) {
    super();
    console.log('load ' + this.constructor.name);
    this._container = container;
    this._pauseBgSound = pauseBgSound;
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine as MultiSceneReelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._iconResourceProvider = container.forceResolve(
      T_AbstractIconResourceProvider
    ) as MultiSceneIconResourceProvider;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._slotSoundController =
      container.forceResolve<BaseSlotSoundController>(T_BaseSlotSoundController);
    this._animateIcon = animateIcon;
    this._preFrozenActionDuration = preFrozenActionDuration;
    this._iconShowState = iconShowState;
    this._marker = marker;
    this._drawableAnimationIndexes = drawableAnimationIndexes;
  }

  public initialize(): void {
    this._createSystems(this._marker);
    this.attachActionsToGameStateMachine();
  }

  private _createSystems(marker: string): void {
    const frozenWildSystem = new RemoveComponentsSystem(this._reelsEngine.entityEngine, marker, [
      ComponentNames.AccelerationInterpolate,
      ComponentNames.BrakingCalculationInfo,
    ]);
    frozenWildSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      UpdateEntityCacheMode.AddAsForeground,
      UpdateEntityCacheMode.AddAsForeground
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();
  }

  private attachActionsToGameStateMachine(): void {
    this._gameStateMachine.stop.addLazyAnimationToBegin(
      () =>
        new ParallelSimpleAction([
          this.preFrozenAction(this._gameStateMachine.curResponse, this._marker),
          this.wildAction(this._gameStateMachine.curResponse, this._marker, this._animateIcon),
        ])
    );

    this._gameStateMachine.freeSpinsRecovery.appendLazyAnimation(() =>
      this.wildAction(this._gameStateMachine.curResponse, this._marker, false)
    );
    this._gameStateMachine.endFreeSpins.leaved.listen((_) => {
      this._reelsEngine.RemoveEntitiesByFilter([this._marker]);
    });
  }

  private preFrozenAction(_response: ISpinResponse, _marker: string): Action {
    return new EmptyAction();
  }

  private wildAction(response: ISpinResponse, marker: string, animated: boolean): Action {
    const symbols = this.getSpecSymbolGroupsByMarker(response, marker);

    if (symbols) {
      const animationActions: Action[] = [];
      const positions = symbols.flatMap((s) => s.positions);
      for (const index of this._drawableAnimationIndexes) {
        for (const pos of positions) {
          const reelIndex = pos! % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(pos! / this._reelsEngine.ReelConfig.reelCount);
          const drawableAnimationIndex = index;

          if (
            this._reelsEngine.GetEntity(reelIndex, lineIndex, drawableAnimationIndex, marker) ==
            null
          ) {
            const entity = this._reelsEngine.CreateSingleEntity(
              reelIndex,
              lineIndex,
              drawableAnimationIndex,
              this._iconResourceProvider,
              [marker]
            );

            animationActions.push(
              new SequenceSimpleAction([
                new FunctionAction(() => {
                  entity.register();
                  if (animated) {
                    this._reelsEngine.startAnimation(entity, this._iconShowState);
                    if (this._pauseBgSound) {
                      this._slotSoundController.pauseBackgroundSound();
                    }
                    this._iconsSoundModel.getIconSound(drawableAnimationIndex).stop();
                    this._iconsSoundModel.getIconSound(drawableAnimationIndex).play();
                  }
                }),
                new EmptyAction().withDuration(
                  animated
                    ? this._iconAnimationHelper.getEntityAnimDuration(entity, this._iconShowState)
                    : 0.0
                ),
                new FunctionAction(() => {
                  if (animated) {
                    this._reelsEngine.stopAnimation(entity, this._iconShowState);
                  }
                  if (this._pauseBgSound) {
                    this._slotSoundController.playBackgroundSound();
                  }
                }),
                new UpdateEntityCacheAction(
                  this._container,
                  entity,
                  UpdateEntityCacheMode.Replace,
                  UpdateEntityCacheMode.Replace
                ),
              ])
            );
          }
        }
      }

      if (animationActions.length > 0) {
        return new SequenceSimpleAction([
          new EmptyAction().withDuration(animated ? this._preFrozenActionDuration : 0.0),
          new ParallelSimpleAction(animationActions),
        ]);
      } else {
        return new EmptyAction();
      }
    } else {
      return new EmptyAction();
    }
  }
}
