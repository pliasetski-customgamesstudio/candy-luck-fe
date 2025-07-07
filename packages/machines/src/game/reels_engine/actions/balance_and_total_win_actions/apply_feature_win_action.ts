import { Container, Action, FunctionAction, SequenceSimpleAction } from '@cgs/syd';
import { BuildAction } from '@cgs/shared';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { IFeatureWinHolder } from '../../../components/extended_components/dynamic_win_component/i_feature_win_holder';
import { SlotSession } from '../../../common/slot_session';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import {
  T_IFeatureWinHolder,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class ApplyFeatureWinAction extends BuildAction {
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _featureWinHolder: IFeatureWinHolder;
  private readonly _featureWin: number;

  private _totalWinController: SlotSession;

  get totalWinController(): SlotSession {
    if (!this._totalWinController) {
      this._totalWinController =
        this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    }
    return this._totalWinController;
  }

  constructor(container: Container, featureWin: number) {
    super();
    this._container = container;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._featureWinHolder = this._container.forceResolve<IFeatureWinHolder>(T_IFeatureWinHolder);

    if (!this._featureWinHolder) {
      throw new Error('Please use DynamicWinExtension or register IFeatureWinHolder');
    }

    this._featureWin = featureWin;
  }

  buildAction(): Action {
    const actions: Action[] = [];

    actions.push(
      new FunctionAction(() => {
        this._featureWinHolder.reduceRemainingFeatureWin(this._featureWin);
      })
    );
    actions.push(
      new FunctionAction(() => {
        const currentResponse = this._gameStateMachine.curResponse;
        if (
          currentResponse.isFreeSpins &&
          currentResponse.freeSpinsInfo &&
          currentResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          this.totalWinController.AddCurrentWin(
            currentResponse.freeSpinsInfo.totalWin - currentResponse.totalWin,
            currentResponse.totalWin - this._featureWinHolder.getCurrentFeatureWin()
          );
        } else {
          this.totalWinController.AddTotalWin(
            currentResponse.totalWin - this._featureWinHolder.getCurrentFeatureWin(),
            currentResponse.totalWin - this._featureWinHolder.getCurrentFeatureWin()
          );
        }
      })
    );

    return new SequenceSimpleAction(actions);
  }
}
