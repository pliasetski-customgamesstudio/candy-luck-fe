import { ISpinResponse, Line, ReelWinPosition, SpecialSymbolGroup } from '@cgs/common';
import {
  Container,
  Action,
  EmptyAction,
  FunctionAction,
  SequenceSimpleAction,
  IntervalAction,
  SequenceAction,
} from '@cgs/syd';
import { StopAction } from './actions/stop_action';
import { IGameStateMachineProvider } from './game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from './game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from './game_components_providers/i_slot_game_engine_provider';
import { AbstractSpinConfig } from './game_config/abstract_spin_config';
import { AnticipationConfig } from './game_config/game_config';
import { LongStoppingIconEnumerator } from './long_stopping_icons_enumerator';
import { ReelsEngine } from './reels_engine';
import { ReelsSoundModel } from './reels_sound_model';
import { SlotParams } from './slot_params';
import { FreeSpinsInfoConstants } from './state_machine/free_spins_info_constants';
import { GameStateMachine } from './state_machine/game_state_machine';
import { AnticipationAnimationProvider } from '../game/components/anticipation/anticipation_animation_provider';
import { ConditionAction } from '../game/components/win_lines/complex_win_line_actions/condition_action';
import {
  T_AnticipationAnimationProvider,
  T_IGameConfigProvider,
  T_IGameParams,
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
} from '../type_definitions';
import { IGameConfigProvider } from '../game/components/interfaces/i_game_config_provider';

export class SlotStopActionWithReplacedIcons extends StopAction {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _slotParams: SlotParams;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _anticipationConfig: AnticipationConfig;
  private _anticipationAnimationProvider: AnticipationAnimationProvider | null;
  private _uniqueReelsSymbols: number[];
  private _iconEnumerator: LongStoppingIconEnumerator;

  constructor(
    container: Container,
    engine: ReelsEngine,
    winTapes: number[][],
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean,
    uniqueReelsSymbols: number[]
  ) {
    super(
      engine,
      winTapes,
      winLines,
      winPositions,
      spinConfig,
      sounds,
      stopReelsSoundImmediately,
      useSounds
    );
    this._container = container;
    this._slotParams = container.forceResolve<SlotParams>(T_IGameParams);
    this._uniqueReelsSymbols = uniqueReelsSymbols;

    this._reelsEngine =
      this._container.forceResolve<IReelsEngineProvider>(T_ISlotGameEngineProvider).reelsEngine;
    this._anticipationConfig = this._container.forceResolve<IGameConfigProvider>(
      T_IGameConfigProvider
    )?.gameConfig.anticipationConfig as AnticipationConfig;
    this._anticipationAnimationProvider = this._container.resolve<AnticipationAnimationProvider>(
      T_AnticipationAnimationProvider
    );
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    )?.gameStateMachine;
    const reelsEngine =
      this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)?.reelsEngine;
    this._iconEnumerator = reelsEngine.iconsEnumerator as LongStoppingIconEnumerator;
    if (this._iconEnumerator) {
      this._gameStateMachine.stopping.entered.listen(() => {
        if (
          this._gameStateMachine.curResponse.isFreeSpins &&
          this._gameStateMachine.curResponse.freeSpinsInfo?.name ===
            FreeSpinsInfoConstants.FreeRespinSpinsGroupName &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event !==
            FreeSpinsInfoConstants.FreeSpinsStarted &&
          this._gameStateMachine.curResponse.freeSpinsInfo.event !==
            FreeSpinsInfoConstants.FreeSpinsGroupSwitched
        ) {
          return;
        }
        const replacedSymbols = this.reelsWithHighSymbols(
          this._gameStateMachine.curResponse.viewReels,
          this._iconEnumerator.iconIds,
          this._gameStateMachine.curResponse.specialSymbolGroups!
        );
        if (replacedSymbols && replacedSymbols.length > 0) {
          this._iconEnumerator.replaceOnReels = replacedSymbols;
        }
        this._iconEnumerator.isStopping = true;
      });
      this._gameStateMachine.accelerate.entered.listen(() => {
        this._iconEnumerator.isStopping = false;
        this._iconEnumerator.replaceOnReels = null;
      });
    }
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
          (highSymbols && (highSymbols.includes(topLine) || highSymbols.includes(bottomLine))) ||
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

  public buildAction(): Action {
    this._reelsEngine.slotsStoped.first.then((s) => this.slotStopped(s));
    const actions: Action[] = [];
    for (let reel = 0; reel < this.engine.internalConfig.reelCount; ++reel) {
      if (
        !this._gameStateMachine.curResponse.isFreeSpins ||
        this._gameStateMachine.curResponse.freeSpinsInfo?.event ===
          FreeSpinsInfoConstants.FreeSpinsStarted ||
        this._gameStateMachine.curResponse.freeSpinsInfo?.name !== 'freeRespin'
      ) {
        if (reel > 0) {
          actions.push(new EmptyAction().withDuration(this.spinConfig.spinStopDelay));
        }
      } else {
        if (reel > 0) {
          actions.push(new EmptyAction().withDuration(0.2));
        }
      }

      if (
        this._gameStateMachine.prevResponse.isFreeSpins &&
        this._gameStateMachine.prevResponse.freeSpinsInfo?.event !==
          FreeSpinsInfoConstants.FreeSpinsFinished &&
        this._gameStateMachine.prevResponse.freeSpinsInfo?.currentFreeSpinsGroup?.name ===
          'freeRespin' &&
        this._gameStateMachine.prevResponse.specialSymbolGroups &&
        this._gameStateMachine.prevResponse.specialSymbolGroups.some(
          (x) => x.type == 'RespinPositions'
        )
      ) {
        actions.push(this.stop(reel, this.winTapes[reel]));
        if (this._anticipationAnimationProvider) {
          actions.push(this._anticipationAnimationProvider.AnticipationAction(reel));
        }
        let fcCounter = 0;
        for (let i = 0; i <= reel; i++) {
          fcCounter += this.winTapes[i].filter((e) => e == 14 || e == 15).length;
        }
        if (fcCounter > 2) {
          actions.push(new EmptyAction().withDuration(0.5));
        }
      } else {
        actions.push(this.stop(reel, this.winTapes[reel]));
        if (this._anticipationAnimationProvider) {
          actions.push(this._anticipationAnimationProvider.AnticipationAction(reel));
          let fcCounter = 0;
          for (let i = 0; i <= reel; i++) {
            fcCounter += this.winTapes[i].filter((e) => e == 14 || e == 15).length;
          }
          if (fcCounter > 2 && fcCounter < 9) {
            const delay = fcCounter == 8 ? 1.6 : 0.5;
            if (fcCounter == 8 && reel < this._reelsEngine.ReelConfig.reelCount - 1) {
              actions.push(new ConditionAction(() => this.engine.isReelStopped(reel)));
              actions.push(this._anticipationAnimationProvider.AccelerateAction(reel + 1));
              actions.push(
                new FunctionAction(() => {
                  this._iconEnumerator.setFeatureReel([
                    14, 14, 14, 4, 5, 3, 5, 14, 14, 14, 7, 6, 4, 8, 9, 14, 14, 14, 9, 9, 6, 5, 14,
                    14, 14, 6, 5, 9, 14, 14, 14, 5, 6, 4, 14, 14, 14, 8, 7, 6, 14, 14, 14,
                  ]);
                  this._iconEnumerator.setCurrentFeatureReelIndexes([reel + 1]);
                })
              );
              if (fcCounter == 8) {
                actions.push(this._anticipationAnimationProvider.AccelerationSoundAction());
              } else {
                actions.push(
                  new FunctionAction(() => {
                    this._anticipationAnimationProvider?.stopAccelerationSound();
                  })
                );
              }
            }
            actions.push(new EmptyAction().withDuration(delay));
          }
        }
      }
    }

    actions.push(new ConditionAction(() => this.engine.isSlotStopped));
    /*if (this._gameStateMachine.PreviousResponse.IsFreeSpins && this._gameStateMachine.PreviousResponse.FreeSpinsInfo.Event != FreeSpinsInfoConstants.FreeSpinsFinished &&
                this._gameStateMachine.PreviousResponse.FreeSpinsInfo.CurrentFreeSpinsGroup.Name == "freeRespin" &&
                this._gameStateMachine.PreviousResponse.SpecialSymbolGroups &&
                this._gameStateMachine.PreviousResponse.SpecialSymbolGroups.Any(x => x.Type == "RespinPositions"))
            {
                actions.Add(new EmptyIntervalAction(1500));
            }*/

    return new SequenceSimpleAction(actions);
  }

  public stop(reel: number, winTapes: number[]): IntervalAction {
    if (
      this._gameStateMachine.prevResponse.isFreeSpins &&
      this._gameStateMachine.prevResponse.freeSpinsInfo?.event !=
        FreeSpinsInfoConstants.FreeSpinsFinished &&
      this._gameStateMachine.prevResponse.freeSpinsInfo?.currentFreeSpinsGroup?.name ==
        'freeRespin' &&
      this._gameStateMachine.prevResponse.specialSymbolGroups &&
      this._gameStateMachine.prevResponse.specialSymbolGroups.some(
        (x) => x.type == 'RespinPositions'
      )
    ) {
      const actions: IntervalAction[] = [];
      const group = this._gameStateMachine.prevResponse.specialSymbolGroups.find(
        (x) => x.type == 'RespinPositions'
      );
      const positions = group?.positions as number[];
      for (const pos of positions) {
        const reelIndex = pos % this.engine.ReelConfig.reelCount;
        const lineIndex = (pos / this.engine.ReelConfig.reelCount) | 0;
        if (reelIndex == reel) {
          actions.push(
            new FunctionAction(() =>
              this.engine.iconsEnumerator.setWinIndex(reelIndex, lineIndex, winTapes[lineIndex])
            )
          );
          actions.push(
            new FunctionAction(() =>
              this.engine.stopEntity(reelIndex, lineIndex, winTapes[lineIndex])
            )
          );
        }
      }

      actions.push(new EmptyAction());
      return new SequenceAction(actions);
    }

    return new FunctionAction(() => this.engine.stop(reel, winTapes));
  }

  public slotStopped(_param: any): void {
    if (this.useSounds) {
      if (
        this.stopReelsSoundImmediately ||
        this.winLines.length > 0 ||
        this.winPositions?.length > 0
      ) {
        this.sounds.startSpinSound.GoToState('stop_sound');
      } else {
        this.sounds.startSpinSound.GoToState('fade_out');
      }
    }
    if (this._anticipationAnimationProvider) {
      this._anticipationAnimationProvider.ClearSymbols();
      this._anticipationAnimationProvider.stopAccelerationSound();
    }
  }
}
