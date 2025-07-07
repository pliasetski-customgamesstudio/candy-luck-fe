import { Container, Action, FunctionAction, SequenceSimpleAction } from '@cgs/syd';
import { BuildAction, Lazy } from '@cgs/shared';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { IBalanceUpdater, ISpinResponse, T_IBalanceUpdater } from '@cgs/common';
import { IFeatureWinHolder } from '../../../components/extended_components/dynamic_win_component/i_feature_win_holder';
import { SlotSession } from '../../../common/slot_session';
import { FastSpinsController } from '../../../common/footer/controllers/fast_spins_controller';
import {
  T_FastSpinsController,
  T_IFeatureWinHolder,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
} from '../../../../type_definitions';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export class ApplyTotalWinAction extends BuildAction {
  private _container: Container;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _featureWinHolder: IFeatureWinHolder;
  private _totalWin: number = 0.0;
  private _balanceUpdater: IBalanceUpdater;

  private _totalWinController: SlotSession;
  private _fastSpinsController: Lazy<FastSpinsController>;

  constructor(container: Container, totalWin: number) {
    super();
    this._container = container;
    this._totalWin = totalWin;
    this._balanceUpdater = container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);
    this._fastSpinsController = new Lazy<FastSpinsController>(() =>
      container.forceResolve<FastSpinsController>(T_FastSpinsController)
    );
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._featureWinHolder = container.forceResolve<IFeatureWinHolder>(T_IFeatureWinHolder);
  }

  get totalWinController(): SlotSession {
    if (!this._totalWinController) {
      this._totalWinController =
        this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    }
    return this._totalWinController;
  }

  buildAction(): Action {
    const actions: Action[] = [];
    actions.push(
      new FunctionAction(() => {
        const currentResponse = this._gameStateMachine.curResponse;

        if (
          currentResponse.isFreeSpins &&
          currentResponse.freeSpinsInfo?.event !== FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          this.totalWinController.SetTotalWin(this._totalWin);
        } else {
          this._balanceUpdater.resumeUpdate(!this._fastSpinsController.call().isFastSpinsEnable);
          this.totalWinController.SetTotalWin(this._totalWin);
        }
      })
    );

    return new SequenceSimpleAction(actions);
  }
}
