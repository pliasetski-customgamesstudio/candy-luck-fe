import { ISpinResponse } from '@cgs/common';
import {
  SceneObject,
  Container,
  Action,
  Platform,
  SequenceAction,
  EmptyAction,
  FunctionAction,
  MouseDownEvent,
  Vector2,
  CGSMouseEvent,
  T_Platform,
} from '@cgs/syd';
import { SlotSession } from '../common/slot_session';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGame } from '../../reels_engine/i_slot_game';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_GameTimeAccelerationProvider,
  T_ISlotGame,
  T_ISlotSessionProvider,
  T_IGameStateMachineProvider,
} from '../../type_definitions';
import { GameTimeAccelerationProvider } from './game_time_acceleration_provider';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';

export class FastSpinDoClickActionProvider {
  private _fastSpinsProvider: GameTimeAccelerationProvider;
  private _gameNode: SceneObject;
  private _slotSession: SlotSession;
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  constructor(container: Container) {
    this._fastSpinsProvider = container.forceResolve<GameTimeAccelerationProvider>(
      T_GameTimeAccelerationProvider
    );
    this._gameNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._container = container;
    this._gameStateMachine.animation.addParallelLazyAnimation(() => this.wrapWithSkipableAction());
    this._gameStateMachine.shortWinLines.addParallelLazyAnimation(() =>
      this.wrapWithSkipableAction()
    );
    this._gameStateMachine.stop.addParallelLazyAnimation(() => this.wrapWithSkipableAction());
  }

  private wrapWithSkipableAction(): Action {
    const platform = this._container.forceResolve<Platform>(T_Platform);
    const mouse = platform.inputSystem.mouse;
    return this._slotSession.GameId !== '48' &&
      this._slotSession.GameId !== '53' &&
      this._slotSession.GameId !== '58' &&
      this._slotSession.GameId !== '61' &&
      this._slotSession.GameId !== '88' &&
      this._slotSession.GameId !== '91' &&
      this._fastSpinsProvider.isFastSpinsActive &&
      (this._gameStateMachine.curResponse.isFreeSpins || this._gameStateMachine.isAutoSpins) &&
      ((this._gameStateMachine.curResponse.winLines &&
        this._gameStateMachine.curResponse.winLines.some((x) => !!x)) ||
        this._gameStateMachine.curResponse.specialSymbolGroups)
      ? new SequenceAction([
          new EmptyAction().withDuration(0.005),
          new FunctionAction(() => {
            const spin = this._gameNode.findById('coverSpinNode')!;
            spin.sendEvent(
              new MouseDownEvent(
                mouse,
                new CGSMouseEvent(new Vector2(spin.worldTransform.tx, spin.worldTransform.ty), 0)
              )
            );
          }),
          new EmptyAction().withDuration(0.02),
          new FunctionAction(() => {
            this._gameNode.sendEvent(
              new MouseDownEvent(mouse, new CGSMouseEvent(new Vector2(0.0, 0.0), 0))
            );
          }),
        ])
      : new SequenceAction([new EmptyAction()]);
  }
}
