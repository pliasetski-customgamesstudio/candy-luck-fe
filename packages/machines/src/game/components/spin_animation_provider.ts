import {
  Container,
  SceneObject,
  EventDispatcher,
  IntervalAction,
  SequenceSimpleAction,
  FunctionAction,
  EmptyAction,
  SequenceAction,
  State,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ISlotGameEngine } from '../../reels_engine/i_slot_game_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_RegularSpinsSoundModelComponent,
  T_ResourcesComponent,
} from '../../type_definitions';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { WaitForAction } from './win_lines/complex_win_line_actions/wait_for_action';
import { ISpinResponse } from '@cgs/common';

export class SpinAnimationProvider {
  private _container: Container;
  private _root: SceneObject;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsSoundModel: ReelsSoundModel;
  private _gameEngine: ISlotGameEngine;
  private _targetStateEventDispatcher: EventDispatcher<State>;
  private _animHolder: SceneObject;
  private _startAnimName: string;
  private _stopAnimName: string;
  private _idleStateName: string;
  private _startAnimDuration: number;
  private _stopAnimDuration: number;

  constructor(
    container: Container,
    animHolderId: string,
    tergetStopStates: string[],
    startAnimName: string = 'start',
    stopAnimName: string = 'stop',
    idleStateName: string = 'idle',
    soundName: string = 'bg_anim_sound'
  ) {
    this._container = container;
    this._gameEngine =
      this._container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._reelsSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;

    this._animHolder = this.Root.findById(animHolderId) as SceneObject;

    if (this._animHolder && this._animHolder.stateMachine) {
      this._gameStateMachine.accelerate.appendLazyAnimation(() => this.spinAnimationAction());

      const startState = this._animHolder.stateMachine.findById(this._startAnimName);
      this._startAnimDuration = startState
        ? (startState.enterAction as IntervalAction).duration
        : 0.0;
      const stopState = this._animHolder.stateMachine.findById(this._stopAnimName);
      this._stopAnimDuration = stopState ? (stopState.enterAction as IntervalAction).duration : 0.0;

      for (const stateName of tergetStopStates) {
        const state = this._animHolder.stateMachine.findById(stateName);
        if (state) {
          state.entered.listen(() => this._targetStateEventDispatcher.dispatchEvent());
        }
      }

      this._gameStateMachine.stopping.addLazyAnimationToBegin(
        () =>
          new SequenceSimpleAction([
            new WaitForAction(this._targetStateEventDispatcher.eventStream),
            this.stopAnimationAction(),
          ])
      );

      this._gameStateMachine.immediatelyStop.appendLazyAnimation(
        () => new FunctionAction(() => this.stopSpinAnimation())
      );

      const sound = this._reelsSoundModel.getSoundByName(soundName);
      if (startState) {
        startState.entering.listen(() => {
          sound.stop();
          sound.play();
        });
      }
      const idleState = this._animHolder.stateMachine.findById(this._idleStateName);
      if (idleState) {
        idleState.entered.listen(() => sound.stop());
      }
    }
  }

  private get Root(): SceneObject {
    if (!this._root) {
      this._root = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
    }
    return this._root;
  }

  private stopSpinAnimation(): void {
    if (this._animHolder) {
      this._animHolder.stateMachine?.switchToState(this._idleStateName);
    }
  }

  private spinAnimationAction(): IntervalAction {
    if (!this._animHolder || !this._animHolder.stateMachine) {
      return new EmptyAction().withDuration(0.0);
    }

    return new FunctionAction(() =>
      this._animHolder.stateMachine!.switchToState(this._startAnimName)
    );
  }

  private stopAnimationAction(): IntervalAction {
    if (!this._animHolder || !this._animHolder.stateMachine) {
      return new EmptyAction().withDuration(0.0);
    }

    return new SequenceAction([
      new FunctionAction(() => this._animHolder.stateMachine!.switchToState(this._stopAnimName)),
      new EmptyAction().withDuration(this._stopAnimDuration),
    ]);
  }
}
