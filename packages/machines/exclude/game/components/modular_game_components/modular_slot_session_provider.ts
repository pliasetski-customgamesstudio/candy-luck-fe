import { ISlotSessionProvider } from 'machines';
import { SlotSession } from 'syd';
import { ModularSlotSession, IModularSlotMachineInfo } from 'machines/src/reels_engine_library';
import { Container } from 'common';

class ModularSlotSessionProvider implements ISlotSessionProvider {
  private _slotSession: ModularSlotSession;
  public get slotSession(): SlotSession {
    return this._slotSession;
  }
  private stateMachine: GameStateMachine;
  private _gameView: View;

  constructor(
    container: Container,
    machineInfo: IModularSlotMachineInfo,
    sceneCommon: SceneCommon,
    gameView: View,
    gameId: string
  ) {
    console.log('load ' + this.constructor.name);
    this._slotSession = new ModularSlotSession(container, machineInfo, gameView, gameId);
  }

  public dispose(): void {
    if (this._slotSession) {
      this._slotSession.dispose();
      this._slotSession = null;
    }
  }
}
