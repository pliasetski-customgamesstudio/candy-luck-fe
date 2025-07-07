import { ISpinResponse, ContextMarshaller } from '@cgs/common';
import { Container, EventStreamSubscription } from '@cgs/syd';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { MultiSceneReelsEngineV2 } from '../../../../reels_engine/multi_scene_reels_engine_v2';
import { ResponseProvider } from '../../../../reels_engine/reel_net_api/response_provider';
import { SpinEvent } from '../../../../reels_engine/state_machine/events/spin_event';
import { StopEvent } from '../../../../reels_engine/state_machine/events/stop_event';
import { ExtendedGameStateMachine } from '../../../../reels_engine/state_machine/extended_game_state_machine';
import { T_ISlotGameEngineProvider } from '../../../../type_definitions';

export class Game112ExtendedGameStateMachine<
  TResponse extends ISpinResponse,
> extends ExtendedGameStateMachine<TResponse> {
  reelsEngine: MultiSceneReelsEngineV2;
  private _reelStopped: number[];
  private _firstEnter: boolean;
  private _streamSubscription: EventStreamSubscription<number>;

  constructor(
    container: Container,
    responseProvider: ResponseProvider<TResponse>,
    shortWinLinesGroupNames: string[]
  ) {
    super(container, responseProvider, shortWinLinesGroupNames);
    this._reelStopped = [];
  }

  doSpin(): void {
    if (this._firstEnter) {
      this.reelsEngine = this.container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ).gameEngine as MultiSceneReelsEngineV2;
      this._streamSubscription = this.reelsEngine.reelBraking.listen((d) =>
        this.addReel(d as number)
      );
      this._firstEnter = false;
    }

    ContextMarshaller.marshalAsync(() => this.rootState.dispatchEvent(new SpinEvent()));
  }

  addReel(reel: number): void {
    this._reelStopped.push(reel);
    if (reel === 4) this._reelStopped = [];
  }

  doStop(): void {
    if (!this.reelsEngine) {
      this.reelsEngine = this.container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ).gameEngine as MultiSceneReelsEngineV2;
      this._streamSubscription = this.reelsEngine.reelBraking.listen((d) =>
        this.addReel(d as number)
      );
      this._firstEnter = false;
    }

    // TODO: fix bug with stop scatter reels
    ContextMarshaller.marshalAsync(() => this.rootState.dispatchEvent(new StopEvent()));
    return;

    if (
      this.curResponse &&
      this.curResponse.viewReels &&
      this.curResponse.viewReels.length !== 0 &&
      this.curResponse.viewReels[1].includes(1) &&
      this.curResponse.viewReels[2].includes(1) &&
      !this.reelsEngine.isReelStopped(2)
    ) {
      if (!this._reelStopped.includes(0)) {
        this.reelsEngine.stop(0, this.curResponse.viewReels[0]);
        this._reelStopped.push(0);
      }
      if (!this._reelStopped.includes(1) && !this._reelStopped.includes(0)) {
        this.reelsEngine.stop(1, this.curResponse.viewReels[1]);
        this._reelStopped.push(1);
      }
      if (!this._reelStopped.includes(2) && !this._reelStopped.includes(1)) {
        this.reelsEngine.stop(2, this.curResponse.viewReels[2]);
        this._reelStopped.push(2);
      }
    } else {
      ContextMarshaller.marshalAsync(() => this.rootState.dispatchEvent(new StopEvent()));
    }
  }

  interrupt(): void {
    this._streamSubscription?.cancel();
    super.interrupt();
  }
}
