import { ISpinResponse } from '@cgs/common';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { IIconModel } from '../../reels_engine/i_icon_model';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { Container, EmptyAction, IntervalAction, Vector2 } from '@cgs/syd';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import {
  T_IconModelComponent,
  T_IconsSoundModelComponent,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IconModelComponent } from './icon_model_component';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { RemoveComponentsSystem } from '../../reels_engine/systems/remove_components_system';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { BounceWildSystem } from '../../reels_engine/systems/bounce_wild_system';
import {
  UpdateEntityCacheMode,
  UpdateEntityCacheSystem,
} from '../../reels_engine/systems/update_entity_cache_system';

export class BouncingWildComponent {
  private _drawableAnimationIndexes: number[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconModel: IIconModel;
  private _iconsSoundModel: IconsSoundModel;
  private _reelsEngine: ReelsEngine;
  private _iconAnimationHelper: any;

  constructor(container: Container, marker: string, drawableAnimationIndexes: number[]) {
    console.log('load ' + this.constructor.name);
    this._drawableAnimationIndexes = drawableAnimationIndexes;
    this._reelsEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent).iconModel;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;

    this._createSystems(marker);

    this._gameStateMachine.stopping.addLazyAnimationToBegin(() =>
      this.WildAction(this._gameStateMachine.curResponse, marker, true)
    );
    this._gameStateMachine.freeSpinsRecovery.addLazyAnimationToBegin(() =>
      this.WildAction(this._gameStateMachine.curResponse, marker, false)
    );

    this._gameStateMachine.endFreeSpins.leaved.listen((_) => {
      this._reelsEngine.RemoveEntitiesByFilter([marker]);
    });
  }

  private _createSystems(marker: string): void {
    const frozenWildSystem = new RemoveComponentsSystem(this._reelsEngine.entityEngine, marker, [
      ComponentNames.AccelerationInterpolate,
      ComponentNames.BrakingCalculationInfo,
    ]);
    frozenWildSystem.register();

    const bounceWildSystem = new BounceWildSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.internalConfig
    );
    bounceWildSystem.updateOrder = 2000;
    bounceWildSystem.register();

    const updateEntitySystem = new UpdateEntityCacheSystem(
      this._reelsEngine.entityEngine,
      this._reelsEngine.entityCacheHolder,
      [this._reelsEngine.entityEngine.getComponentIndex(marker)],
      UpdateEntityCacheMode.Replace,
      UpdateEntityCacheMode.Replace
    ).withInitialize();
    updateEntitySystem.updateOrder = 501;
    updateEntitySystem.register();
  }

  private WildAction(response: ISpinResponse, marker: string, animate: boolean): IntervalAction {
    const delay = new EmptyAction();
    const symbols = response.specialSymbolGroups;

    const symbol = symbols ? symbols.find((p) => p.type === marker) : null;

    if (symbol) {
      if (!symbol.previousPositions) {
        symbol.previousPositions = symbol.positions;
      }

      for (const index of this._drawableAnimationIndexes) {
        for (let i = 0; i < symbol.positions!.length; i++) {
          const drawableAnimationIndex = index;
          const pos = symbol.positions![i];
          const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);

          const prevPos = symbol.previousPositions![i] >= 0 ? symbol.previousPositions![i] : pos;
          const prevReelIndex = prevPos % this._reelsEngine.ReelConfig.reelCount;
          const prevLineIndex = Math.floor(prevPos / this._reelsEngine.ReelConfig.reelCount);

          const stateName = this.GetDirectionState(
            reelIndex,
            lineIndex,
            prevReelIndex,
            prevLineIndex
          );
          let entity = this._reelsEngine.GetEntity(
            prevReelIndex,
            prevLineIndex,
            drawableAnimationIndex,
            marker
          );

          if (!entity) {
            entity = this._reelsEngine.CreateEntity(
              prevReelIndex,
              prevLineIndex,
              drawableAnimationIndex,
              [marker]
            );
            entity.register();
          }

          if (animate) {
            this._iconsSoundModel.getIconSound(drawableAnimationIndex).stop();
            this._iconsSoundModel.getIconSound(drawableAnimationIndex).play();
            this._reelsEngine.startAnimation(entity, stateName);
            delay.withDuration(this._iconAnimationHelper.getEntityAnimDuration(entity, stateName));
            delay.done.listen((_) => {
              this._iconsSoundModel.getIconSound(drawableAnimationIndex).stop();
              this._reelsEngine.stopAnimation(entity!, stateName);
            });
          }

          entity.addComponent(
            ComponentNames.BouncingPosition,
            new Vector2(reelIndex - prevReelIndex, lineIndex - prevLineIndex)
          );
        }
      }
    }

    return delay;
  }

  private GetDirectionState(
    reelIndex: number,
    lineIndex: number,
    prevReelIndex: number,
    prevLineIndex: number
  ): string {
    let anim = 'show';
    if (reelIndex > prevReelIndex) {
      anim = 'right';
    } else if (prevReelIndex > reelIndex) {
      anim = 'left';
    } else if (lineIndex > prevLineIndex) {
      anim = 'bot';
    } else if (prevLineIndex > lineIndex) {
      anim = 'top';
    }

    return anim;
  }
}
