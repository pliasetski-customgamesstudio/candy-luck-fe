import { StopWithAnticipationAction } from './anticipation/stop_with_anticipation_action';
import { Container } from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { Line, ReelWinPosition } from '@cgs/common';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { LongStoppingIconEnumerator } from '../../reels_engine/long_stopping_icons_enumerator';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class LongStopWithReplacedIconsAction extends StopWithAnticipationAction {
  private _skipFsTypes: string[];

  constructor(
    container: Container,
    engine: ReelsEngine,
    winTapes: number[][],
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinStopDelay: number,
    reelSounds: ReelsSoundModel,
    useSounds: boolean,
    stopReelsSoundImmediately: boolean,
    skipFsTypes: string[]
  ) {
    super(
      container,
      winTapes,
      winLines,
      winPositions,
      spinStopDelay,
      reelSounds,
      useSounds,
      stopReelsSoundImmediately
    );
    this._skipFsTypes = skipFsTypes;
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const iconEnumerator = engine.iconsEnumerator as LongStoppingIconEnumerator;
    if (iconEnumerator) {
      gameStateMachine.stopping.entered.listen((e) => {
        if (
          !gameStateMachine.curResponse.isFreeSpins ||
          !this._skipFsTypes ||
          !this._skipFsTypes.includes(gameStateMachine.curResponse.freeSpinsInfo!.name)
        ) {
          if (
            !gameStateMachine.prevResponse ||
            !gameStateMachine.prevResponse.isFreeSpins ||
            !gameStateMachine.curResponse.isFreeSpins ||
            gameStateMachine.curResponse.freeSpinsInfo!.event !=
              FreeSpinsInfoConstants.FreeSpinsGroupSwitched ||
            !this._skipFsTypes ||
            !this._skipFsTypes.includes(gameStateMachine.prevResponse.freeSpinsInfo!.name)
          ) {
            iconEnumerator.isStopping = true;
          }
        }
      });
      gameStateMachine.accelerate.entered.listen((e) => {
        iconEnumerator.isStopping = false;
      });
    }
  }
}
