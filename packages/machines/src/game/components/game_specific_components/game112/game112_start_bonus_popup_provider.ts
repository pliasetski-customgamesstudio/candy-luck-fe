import { ISpinResponse } from '@cgs/common';
import {
  SceneObject,
  Container,
  IntervalAction,
  FunctionAction,
  EmptyAction,
  SequenceAction,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider, T_ISlotGame } from '../../../../type_definitions';

export class Game112StartBonusPopupProvider {
  private _popupScene: SceneObject;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(container: Container) {
    const gameNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._popupScene = gameNode.findById('floatingPopups') as SceneObject;
    this._gameStateMachine.beginBonus.appendLazyAnimation(() =>this.FloatingPopupAction());
  }

  private FloatingPopupAction(): IntervalAction {
    const currentResponse = this._gameStateMachine.curResponse;
    let scene = '';
    switch (currentResponse.bonusInfo?.type) {
      case '0':
        scene = 'popup_1';
        break;
      case '1':
        scene = 'popup_2';
        break;
      case '2':
        scene = 'popup_3';
        break;
    }

    const actions: IntervalAction[] = [];
    const duration = (this._popupScene.stateMachine!.findById(scene)?.enterAction as IntervalAction)
      .duration;
    const action = new FunctionAction(() => {
      this._popupScene.stateMachine!.switchToState(scene);
    });
    actions.push(action);
    actions.push(new EmptyAction().withDuration(duration));
    return new SequenceAction(actions);
  }
}
