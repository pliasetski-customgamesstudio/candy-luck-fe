import { LazyAction } from '@cgs/shared';
import {
  SceneObject,
  Action,
  Container,
  EmptyAction,
  ParallelAction,
  FunctionAction,
  SequenceSimpleAction,
  IntervalAction,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_FreeSpinsLogoComponent,
  T_IGameStateMachineProvider,
  T_IProgressiveBonusDependencyProvider,
} from '../../type_definitions';
import { FreeSpinsLogoComponent } from './freeSpins_logo_component';
import { IBreakeable } from './node_tap_action/progressive_breaker/ibreakeable';
import { ISpinResponse } from '@cgs/common';
import { IProgressiveBonusDependencyProvider } from './progressive_bonus/i_progressive_bonus_dependency_provider';

export class FreeSpinsToDefaultLogoSwitcherProvider implements IBreakeable {
  private _logoNode: SceneObject;
  private _collectIcons: number[];
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _goToFSagainDuration: number;
  private _goToDefaultLogoDuration: number;
  private _finalAction: Action;

  constructor(
    container: Container,
    {
      goToFSagainDuration = 1.8,
      goToDefaultLogoDuration = 1.4,
    }: { goToFSagainDuration?: number; goToDefaultLogoDuration?: number }
  ) {
    this._logoNode =
      container.forceResolve<FreeSpinsLogoComponent>(T_FreeSpinsLogoComponent).controller.logoTable;
    this._goToFSagainDuration = goToFSagainDuration;
    this._goToDefaultLogoDuration = goToDefaultLogoDuration;

    this._collectIcons = [];
    const collectMap: Map<number, number> =
      container.forceResolve<IProgressiveBonusDependencyProvider>(
        T_IProgressiveBonusDependencyProvider
      ).symbolProgressiveStepsCount;
    collectMap.forEach((value, key) => {
      this._collectIcons.push(key);
    });

    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    let stopAction = this._gameStateMachine.stop.animation;
    if (!stopAction) {
      stopAction = new EmptyAction();
    }

    this._finalAction = new ParallelAction([
      new LazyAction(() => this._switchToDefault()),
      new LazyAction(() => this._otherActions(stopAction)),
    ]);

    this._gameStateMachine.stop.setLazyAnimation(() => {
      return this._finalAction;
    });
  }

  public doBreak(): void {
    this._finalAction.end();
  }

  private _otherActions(stopAction: Action): Action {
    const defaultAction = stopAction || new EmptyAction();
    if (this._collectPresent()) {
      const preAction = new EmptyAction().withDuration(this._goToDefaultLogoDuration);
      const postAction = new EmptyAction().withDuration(this._goToFSagainDuration);
      const goToFsAction = new FunctionAction(() =>
        this._logoNode.stateMachine!.switchToState('fs')
      );
      return new SequenceSimpleAction([preAction, defaultAction, postAction, goToFsAction]);
    }

    return defaultAction;
  }

  private _switchToDefault(): IntervalAction {
    if (this._collectPresent()) {
      return new FunctionAction(() => this._logoNode.stateMachine!.switchToState('default'));
    }
    return new EmptyAction();
  }

  private _collectPresent(): boolean {
    const curResp = this._gameStateMachine.curResponse;
    if (
      curResp &&
      curResp.freeSpinsInfo &&
      curResp.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      const iconMatrix = this._gameStateMachine.curResponse.viewReels;
      if (iconMatrix.some((list) => list.some((icon) => this._collectIcons.includes(icon)))) {
        return true;
      }
    }
    return false;
  }
}
