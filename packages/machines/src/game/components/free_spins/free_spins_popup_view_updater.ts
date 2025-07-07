import { IFreeSpinsPopupViewUpdater } from './i_free_spins_popup_view_updater';
import { ISpinResponse } from '@cgs/common';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { Func2, VoidType } from '@cgs/shared';
import { Container, SceneObject } from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider } from '../../../type_definitions';

export class FreeSpinsPopupViewUpdater implements IFreeSpinsPopupViewUpdater {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _updateViewAction: Func2<SceneObject, ISpinResponse, VoidType>;

  constructor(container: Container, updateViewAction: Func2<SceneObject, ISpinResponse, VoidType>) {
    this._updateViewAction = updateViewAction;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
  }

  updateViewBeforeShowingPopup(view: SceneObject): void {
    if (this._updateViewAction) {
      this._updateViewAction(view, this._gameStateMachine.curResponse);
    }
  }
}
