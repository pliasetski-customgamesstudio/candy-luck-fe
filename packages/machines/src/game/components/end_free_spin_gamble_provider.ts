import { Container, Button } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_EndFreeSpinsPopupComponent, T_IGameStateMachineProvider } from '../../type_definitions';
import { EndFreeSpinsPopupComponent } from './popups/end_freeSpins_popup_component';
import { ISpinResponse } from '@cgs/common';

export class EndFreeSpinGambleProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _freeSpinsPopupProvider: EndFreeSpinsPopupComponent;

  constructor(container: Container) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._freeSpinsPopupProvider = container.forceResolve<EndFreeSpinsPopupComponent>(
      T_EndFreeSpinsPopupComponent
    );
    const button: Button = this._freeSpinsPopupProvider.holder.findById('gambleBtn') as Button;
    button.clicked.listen((e) => this.ButtonOnClicked());
  }

  private ButtonOnClicked(): void {
    throw new Error('Method not implemented.');
    // this._gameStateMachine.curResponse.freeSpinsInfo = null;
    // this._gameStateMachine.doStartGamble();
    // this._freeSpinsPopupProvider.view.hide();
  }
}
