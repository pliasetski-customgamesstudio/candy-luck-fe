import { IClientProperties, ISpinResponse, T_IClientProperties } from '@cgs/common';
import { Container } from '@cgs/syd';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { GameTimeAccelerationProvider } from './game_time_acceleration_provider';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider, T_GameTimeAccelerationProvider } from '../../type_definitions';

export class DisableBluredIconsComponent {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _clientProperties: IClientProperties;
  private _fastSpinProvider: GameTimeAccelerationProvider;
  private _reelsEngine: ReelsEngine;

  constructor(container: Container) {
    this._clientProperties = container.forceResolve<IClientProperties>(T_IClientProperties);
    const gameId =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession.GameId;
    this._fastSpinProvider = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
  }

  private disableBluredIconsOnRegularSpins(): void {
    for (let i = 0; i < this._reelsEngine.ReelConfig.reelCount; i++) {
      if (!this._fastSpinProvider.isFastSpinsEnabled) {
        this._reelsEngine.disableBlureIconsOnReel(i);
      } else {
        this._reelsEngine.disableBlureIconsOnReel(i, false);
      }
    }
  }
}
