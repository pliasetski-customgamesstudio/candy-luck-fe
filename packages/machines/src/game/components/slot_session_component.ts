import { ISlotMachineInfo, ISpinResponse, SceneCommon } from '@cgs/common';
import { View, Container } from '@cgs/syd';
import { SlotSession } from '../common/slot_session';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class SlotSessionComponent implements ISlotSessionProvider {
  private _slotSession: SlotSession;
  public get slotSession(): SlotSession {
    return this._slotSession;
  }
  private stateMachine: GameStateMachine<ISpinResponse>;
  private _gameView: View;

  constructor(
    container: Container,
    machineInfo: ISlotMachineInfo,
    sceneCommon: SceneCommon,
    gameView: View,
    gameId: string
  ) {
    console.log('load ' + this.constructor.name);
    this._slotSession = new SlotSession(container, machineInfo, gameView, gameId);
  }

  public dispose(): void {
    if (this._slotSession) {
      this._slotSession.dispose();
    }
  }
}
