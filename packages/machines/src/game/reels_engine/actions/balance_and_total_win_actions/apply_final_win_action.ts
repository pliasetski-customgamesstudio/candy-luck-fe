import { Container, Action, FunctionAction, SequenceSimpleAction } from '@cgs/syd';
import { BuildAction, Lazy } from '@cgs/shared';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { IBalanceUpdater, ISpinResponse, T_IBalanceUpdater } from '@cgs/common';
import { IFeatureWinHolder } from '../../../components/extended_components/dynamic_win_component/i_feature_win_holder';
import { SlotSession } from '../../../common/slot_session';
import { FastSpinsController } from '../../../common/footer/controllers/fast_spins_controller';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import {
  T_FastSpinsController,
  T_IFeatureWinHolder,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class ApplyFinalWinAction extends BuildAction {
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _featureWinHolder: IFeatureWinHolder;
  private _balanceUpdater: IBalanceUpdater;
  private readonly _featureWin: number = 0.0;

  private _totalWinController: SlotSession;
  private _fastSpinsController: Lazy<FastSpinsController>;

  get totalWinController(): SlotSession {
    if (!this._totalWinController) {
      this._totalWinController =
        this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    }
    return this._totalWinController;
  }

  constructor(container: Container) {
    super();
    this._container = container;
    this._fastSpinsController = new Lazy<FastSpinsController>(() =>
      container.forceResolve<FastSpinsController>(T_FastSpinsController)
    );
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._featureWinHolder = container.forceResolve<IFeatureWinHolder>(T_IFeatureWinHolder);
    this._balanceUpdater = container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);
  }

  buildAction(): Action {
    const actions: Action[] = [];

    actions.push(
      new FunctionAction(() => {
        this._featureWinHolder?.resetSavedWin();
      })
    );
    actions.push(
      new FunctionAction(() => {
        const currentResponse = this._gameStateMachine.curResponse;

        const totalCurrentWin = currentResponse.totalWin;

        if (totalCurrentWin === 0.0) return;

        if (
          currentResponse.isFreeSpins &&
          currentResponse.freeSpinsInfo &&
          currentResponse.freeSpinsInfo.event !== FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          this.totalWinController.AddTotalWin(
            currentResponse.freeSpinsInfo.totalWin,
            totalCurrentWin
          );
        } else {
          this._balanceUpdater.resumeUpdate(!this._fastSpinsController.call().isFastSpinsEnable);
          this.totalWinController.SetTotalWin(totalCurrentWin);
        }
      })
    );

    return new SequenceSimpleAction(actions);
  }
}
