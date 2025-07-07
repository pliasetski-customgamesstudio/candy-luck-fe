import { ISpinResponse } from '@cgs/common';
import { Container, IntervalAction, EmptyAction } from '@cgs/syd';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { RemoveComponentsSystem } from '../../reels_engine/systems/remove_components_system';
import {
  UpdateEntityCacheSystem,
  UpdateEntityCacheMode,
} from '../../reels_engine/systems/update_entity_cache_system';
import { IconAnimationHelper } from '../../reels_engine/utils/icon_animation_helper';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_IconModelComponent,
  T_IconsSoundModelComponent,
} from '../../type_definitions';
import { IconModel } from './icon_model';
import { IconModelComponent } from './icon_model_component';
import { IconsSoundModelComponent } from './icons_sound_model_component';

export class FrozenWildComponent {
  private _drawableAnimationIndexes: number[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconModel: IconModel;
  private _iconsSoundModel: IconsSoundModel;
  private _reelsEngine: ReelsEngine;
  private _iconAnimationHelper: IconAnimationHelper;

  constructor(
    container: Container,
    marker: string,
    drawableAnimationIndexes: number[],
    animateIcon: boolean = true
  ) {
    console.log('load ' + this.constructor.name);
    this._reelsEngine = (
      container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._iconAnimationHelper = this._reelsEngine.iconAnimationHelper;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._iconModel = container.forceResolve<IconModelComponent>(T_IconModelComponent)
      .iconModel as IconModel;
    this._iconsSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;

    this._createSystems(marker);

    this._gameStateMachine.stop.appendLazyAnimation(() =>
      this.WildAction(this._gameStateMachine.curResponse, marker, animateIcon)
    );
    this._gameStateMachine.freeSpinsRecovery.appendLazyAnimation(() =>
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

  private WildAction(response: ISpinResponse, marker: string, animated: boolean): IntervalAction {
    const delay = new EmptyAction();
    const symbols = response.specialSymbolGroups;

    const symbol = symbols ? symbols.find((p) => p.type === marker) : null;

    if (symbol) {
      for (const index of this._drawableAnimationIndexes) {
        for (const pos of symbol.positions!) {
          const reelIndex = pos % this._reelsEngine.ReelConfig.reelCount;
          const lineIndex = Math.floor(pos / this._reelsEngine.ReelConfig.reelCount);
          const drawableAnimationIndex = index;

          if (
            this._reelsEngine.GetEntity(reelIndex, lineIndex, drawableAnimationIndex, marker) ==
            null
          ) {
            const entity = this._reelsEngine.CreateEntity(
              reelIndex,
              lineIndex,
              drawableAnimationIndex,
              [marker]
            );
            entity.register();
            if (animated) {
              this._reelsEngine.startAnimation(entity, 'anim');
              this._iconsSoundModel.getIconSound(drawableAnimationIndex).stop();
              this._iconsSoundModel.getIconSound(drawableAnimationIndex).play();

              delay.withDuration(this._iconAnimationHelper.getEntityAnimDuration(entity, 'anim'));
            }
          }
        }
      }
    }
    return delay;
  }
}
