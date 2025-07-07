import { Line, ReelWinPosition } from '@cgs/common';
import { Container } from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { StopWithAnticipationAction } from './anticipation/stop_with_anticipation_action';
import { StoppingIconEnumerator } from './stopping_icon_enumerator';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class StopWithReplacedIconsAction extends StopWithAnticipationAction {
  private _skipFsTypes: string[];
  private _customReplaceFsTypes: string[];
  private _customReplaceId: number;

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
    skipFsTypes: string[],
    customFsReplace: string[],
    customReplaceId: number
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
    this._customReplaceFsTypes = customFsReplace;
    this._customReplaceId = customReplaceId;
    const gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const iconEnumerator = engine.iconsEnumerator as StoppingIconEnumerator;
    if (iconEnumerator) {
      gameStateMachine.stopping.entered.listen((e) => {
        if (
          !gameStateMachine.curResponse.isFreeSpins ||
          !this._skipFsTypes ||
          !this._skipFsTypes.includes(gameStateMachine.curResponse!.freeSpinsInfo!.name)
        ) {
          if (
            !gameStateMachine.prevResponse ||
            !gameStateMachine.prevResponse.isFreeSpins ||
            !gameStateMachine.curResponse.isFreeSpins ||
            gameStateMachine.curResponse!.freeSpinsInfo!.event !=
              FreeSpinsInfoConstants.FreeSpinsGroupSwitched ||
            !this._skipFsTypes ||
            !this._skipFsTypes.includes(gameStateMachine.prevResponse!.freeSpinsInfo!.name)
          ) {
            iconEnumerator.replaceId = iconEnumerator.defaultReplaceId;
            if (
              gameStateMachine.prevResponse &&
              gameStateMachine.prevResponse.freeSpinsInfo &&
              gameStateMachine.prevResponse.freeSpinsInfo.currentFreeSpinsGroup
            ) {
              const group = gameStateMachine.prevResponse.freeSpinsInfo.currentFreeSpinsGroup;
              if (
                gameStateMachine.prevResponse.isFreeSpins &&
                this._customReplaceFsTypes &&
                this._customReplaceFsTypes.includes(group.name!)
              ) {
                iconEnumerator.replaceId = this._customReplaceId;
              }
            }
            iconEnumerator.isStopping = true;
          }
        }
      });
      gameStateMachine.accelerate.entered.listen((e) => {
        iconEnumerator.replaceId = iconEnumerator.defaultReplaceId;
        iconEnumerator.isStopping = false;
      });
    }
  }
}
