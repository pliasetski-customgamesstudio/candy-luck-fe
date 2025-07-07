import { ISpinResponse, SceneCommon } from '@cgs/common';
import { Container } from '@cgs/syd';
import { ISomethingWentWrongShower } from '../../i_something_went_wrong_shower';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider } from '../../type_definitions';
import { BasePopupComponent } from './popups/base_popup_component';
import { NotEnoughBalanceView } from './not_enough_balance_view';
import { NotEnoughBalanceController } from './not_enough_balance_controller';

export class SomethingWentWrongProvider extends BasePopupComponent<NotEnoughBalanceView> {
  //TODO: implement  SomethingWentWrong View and Controller
  private _view: NotEnoughBalanceView;
  public get view(): NotEnoughBalanceView {
    return this._view;
  }

  private _container: Container;
  public get container(): Container {
    return this._container;
  }

  private _provider: ISomethingWentWrongShower;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  public get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  constructor(container: Container, sceneCommon: SceneCommon) {
    super(container, sceneCommon, 'bottom/errorPopup');
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._view = new NotEnoughBalanceView(this.rootScene, this.popupScene, container);
    this.popupController = new NotEnoughBalanceController(container, this.view);
  }
}
