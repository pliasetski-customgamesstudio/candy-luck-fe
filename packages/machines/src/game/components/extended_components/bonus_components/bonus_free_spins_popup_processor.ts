import { ResponseDependentGameComponentProvider } from '../../response_dependent_game_component_provider';
import { IBonusExternalEventAsyncProcessor } from '../../mini_game/i_bonus_external_event_async_processor';
import { ExtendedStartFreeSpinsController } from '../free_spins_popups/extended_free_spins_controller';
import { Container } from '@cgs/syd';
import { T_StartFreeSpinsPopupComponent } from '../../../../type_definitions';
import { ExtendedStartFreeSpinsPopupProvider } from '../free_spins_popups/extended_start_free_spins_popup_provider';
import { IBonusResponse } from '@cgs/common';
import { StringUtils } from '@cgs/shared';

export class BonusFreeSpinsPopupProcessor
  extends ResponseDependentGameComponentProvider
  implements IBonusExternalEventAsyncProcessor
{
  private _startFreeSpinsPopupView: ExtendedStartFreeSpinsController;
  get startFreeSpinsPopupView(): ExtendedStartFreeSpinsController {
    return this._startFreeSpinsPopupView;
  }
  private _container: Container;
  get container(): Container {
    return this._container;
  }

  constructor(container: Container) {
    super(container);
    this._container = container;
    this._startFreeSpinsPopupView = container.forceResolve<ExtendedStartFreeSpinsPopupProvider>(
      T_StartFreeSpinsPopupComponent
    ).controller;
  }

  processActionsBeforeBonusClose(bonusResponse: IBonusResponse): Promise<void> {
    if (bonusResponse.freeSpinsInfo) {
      let prefix = '';
      switch (bonusResponse.freeSpinsInfo.event) {
        case 'started':
        case 'groupSwitched':
          prefix = 'freespins_';
          break;
        case 'added':
          prefix = 'freespins_add_';
          break;
        default:
          prefix = '';
          break;
      }
      if (StringUtils.isNullOrWhiteSpace(prefix)) {
        return Promise.resolve();
      }
      const showPopup = this._startFreeSpinsPopupView.showPopupAsync(
        bonusResponse.freeSpinsInfo.freeSpinsAdded ?? 0,
        prefix + bonusResponse.freeSpinsInfo.name
      );
      return showPopup;
    }
    return Promise.resolve();
  }

  processActionsBeforeBonusUpdate(_bonusResponse: IBonusResponse): Promise<void> {
    return Promise.resolve();
  }

  processActionsAfterBonusClose(_bonusResponse: IBonusResponse): Promise<void> {
    return Promise.resolve();
  }
}
