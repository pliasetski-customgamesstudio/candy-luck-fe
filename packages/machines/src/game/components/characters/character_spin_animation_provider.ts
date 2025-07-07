import { BasePopupComponent } from '../popups/base_popup_component';
import {
  Action,
  Container,
  EmptyAction,
  FunctionAction,
  SceneObject,
  SequenceAction,
} from '@cgs/syd';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import { BaseSlotPopupView } from '../../common/slot/views/base_popup_view';
import { BaseSlotPopupController } from '../../common/slot/controllers/base_popup_controller';
import { BaseGameState } from '../../../reels_engine/state_machine/states/base_game_state';
import {
  GameStateMachine,
  GameStateMachineStates,
} from '../../../reels_engine/state_machine/game_state_machine';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';

export class CharacterSpinAnimationProvider extends BasePopupComponent<CharacterSpinPopupView> {
  constructor(container: Container, sceneCommon: SceneCommon, sceneName: string) {
    super(container, sceneCommon, sceneName, true);

    console.log('load CharacterSpinAnimationProvider');

    const view = new CharacterSpinPopupView(super.rootScene, super.popupScene);

    const controller = new CharacterSpinPopupController(view, container);

    this.controllers.push(controller);
  }
}

export class CharacterSpinPopupView extends BaseSlotPopupView<CharacterSpinPopupController> {
  constructor(parent: SceneObject, view: SceneObject) {
    super(parent, view, null, 'CharacterSpin');
  }

  Spin(): void {
    this.postEvent('spin');
  }

  Hide(): void {
    this.postEvent('hide');
  }

  Idle(): void {
    this.postEvent('idle');
  }

  Show(): void {
    this.postEvent('show');
  }
}

export class CharacterSpinPopupController extends BaseSlotPopupController<CharacterSpinPopupView> {
  private _stateMachineActionsMap: Map<BaseGameState<ISpinResponse>, Action> = new Map<
    BaseGameState<ISpinResponse>,
    Action
  >();

  constructor(view: CharacterSpinPopupView, container: Container) {
    super(container, view, false);
  }

  Hide(_stateMachine: GameStateMachine<ISpinResponse>): void {
    this.view.Hide();
    this._stateMachineActionsMap.forEach((action, state) => {
      state.animation = action;
    });
  }

  Show(stateMachine: GameStateMachine<ISpinResponse>): void {
    this._stateMachineActionsMap.clear();
    this._stateMachineActionsMap.set(stateMachine.accelerate, stateMachine.accelerate.animation);
    this._stateMachineActionsMap.set(stateMachine.stop, stateMachine.stop.animation);
    const spinAction = new SequenceAction([
      new FunctionAction(() => {
        this.view.Spin();
      }),
      new EmptyAction().withDuration(0.7),
    ]);
    const idleAction = new FunctionAction(() => {
      this.view.Idle();
    });

    this.view.Show();

    console.log('changing actions');

    stateMachine.accelerate.addLazyAnimationToBegin(() => spinAction);
    stateMachine.freeSpins.addLazyAnimationToBegin(() => idleAction);
    console.log('changed actions');
  }

  OnStateEntered(slotState: string): void {
    switch (slotState) {
      case GameStateMachineStates.BeginFreeSpinsPopup:
        console.log('characte showing');
        if (
          this.gameStateMachineNotifier.gameStateMachine.curResponse &&
          this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo &&
          this.gameStateMachineNotifier.gameStateMachine.curResponse.freeSpinsInfo.event ===
            FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          this.Show(this.gameStateMachineNotifier.gameStateMachine);
        }
        break;
      case GameStateMachineStates.FreeSpinRecovery:
        console.log('characte showing');
        this.Show(this.gameStateMachineNotifier.gameStateMachine);
        console.log('characte showed');
        break;
      case GameStateMachineStates.EndOfFreeSpinsPopup:
        this.Hide(this.gameStateMachineNotifier.gameStateMachine);
        break;
      default:
        break;
    }
  }
}
