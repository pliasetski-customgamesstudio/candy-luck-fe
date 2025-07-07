import { Container } from '@cgs/syd';
import { StopAfterRespinAction } from './stop_after_respin_action';
import { ReelsEngine } from '../reels_engine';
import { GameStateMachine } from '../state_machine/game_state_machine';
import { ISpinResponse, SpecialSymbolGroup } from '@cgs/common';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { ReelsSoundModel } from '../reels_sound_model';
import { T_IGameStateMachineProvider, T_ISlotGameEngineProvider } from '../../type_definitions';
import { IReelsEngineProvider } from '../game_components_providers/i_reels_engine_provider';
import { IGameStateMachineProvider } from '../game_components_providers/i_game_state_machine_provider';
import { LongStoppingIconEnumerator } from '../long_stopping_icons_enumerator';

export class StopAfterSpinActionWithIconReplacment extends StopAfterRespinAction {
  private _uniqueReelsSymbols: number[] | null;
  private _reelsEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(
    container: Container,
    engine: ReelsEngine,
    spinConfig: AbstractSpinConfig,
    response: ISpinResponse,
    sounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean,
    uniqueReelsSymbols: number[] | null = null
  ) {
    super(container, engine, spinConfig, response, sounds, stopReelsSoundImmediately, useSounds);
    this._uniqueReelsSymbols = uniqueReelsSymbols;
    this._reelsEngine =
      container.forceResolve<IReelsEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const iconEnumerator = this._reelsEngine.iconsEnumerator as LongStoppingIconEnumerator;
    if (iconEnumerator) {
      this._gameStateMachine.stopping.entered.listen(() => {
        const replacedSymbols = this.reelsWithHighSymbols(
          this._gameStateMachine.curResponse.viewReels,
          iconEnumerator.iconIds,
          this._gameStateMachine.curResponse.specialSymbolGroups!
        );
        if (replacedSymbols && replacedSymbols.length > 0) {
          iconEnumerator.replaceOnReels = replacedSymbols;
        }
        iconEnumerator.isStopping = true;
      });
    }
    this._gameStateMachine.accelerate.entered.listen(() => {
      iconEnumerator.isStopping = false;
      iconEnumerator.replaceOnReels = null;
    });
  }

  private reelsWithHighSymbols(
    viewReels: number[][],
    highSymbols: number[],
    _specialSymbolGroups: SpecialSymbolGroup[]
  ): number[] | null {
    try {
      const reelsWithHighSymbols: number[] = [];
      for (let i = 0; i < viewReels.length; i++) {
        const topLine = viewReels[i][0];
        const bottomLine = viewReels[i][this._reelsEngine.ReelConfig.lineCount - 1];
        if (
          highSymbols.includes(topLine) ||
          highSymbols.includes(bottomLine) ||
          (this._uniqueReelsSymbols &&
            this._uniqueReelsSymbols.length > 0 &&
            this._uniqueReelsSymbols.some((arg) => viewReels[i].includes(arg))) ||
          viewReels[i].some((arg) => arg >= 400)
        ) {
          reelsWithHighSymbols.push(i);
        }
      }
      return reelsWithHighSymbols.length > 0 ? reelsWithHighSymbols : null;
    } catch (e) {
      return null;
    }
  }
}
