import { Action, Container, EmptyAction } from '@cgs/syd';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import {
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_LobbyFacade,
} from '../../../../type_definitions';
import { LoginFormConfigDTO, LoginFormConfigTrigger } from '@cgs/network';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { RefreshExternalUserService, T_RefreshExternalUserService } from '@cgs/features';
import { LobbyFacade } from '../../../../lobby_facade';
import { PromiseAction } from './promise_action/PromiseAction';
import { ArkadiumSdk } from '@cgs/shared';
import { FreeSpinsInfoConstants } from '../../../../reels_engine/state_machine/free_spins_info_constants';

export const T_CandyLuckLoginFormComponent = Symbol('CandyLuckLoginFormComponent');

export class CandyLuckLoginFormComponent {
  private readonly _config: LoginFormConfigDTO | null;
  private readonly _gameStateMachine: GameStateMachine<ISpinResponse>;
  private readonly _externalUserService: RefreshExternalUserService;
  private readonly _arkadiumSdk: ArkadiumSdk = ArkadiumSdk.getInstance();

  private _showTime: number;

  constructor(container: Container) {
    const slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._config = slotSession.machineInfo.loginFormConfig;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    const lobbyFacade = container.forceResolve<LobbyFacade>(T_LobbyFacade);
    this._externalUserService =
      lobbyFacade.container.container.forceResolve<RefreshExternalUserService>(
        T_RefreshExternalUserService
      );

    this.initialize();
  }

  private async initialize(): Promise<void> {
    const isSdkInited = await this._arkadiumSdk.isInited();

    if (!this._config || !isSdkInited) {
      return;
    }

    this.updateShowTime(true);

    const triggers = this._config.triggers;

    if (triggers.includes(LoginFormConfigTrigger.AfterSpin)) {
      this._gameStateMachine.stop.appendLazyAnimation(() => this.showLoginFormAction());
    }

    if (triggers.includes(LoginFormConfigTrigger.AfterWin)) {
      this._gameStateMachine.stop.appendLazyAnimation(() => {
        if (!this._gameStateMachine.curResponse?.totalWin) {
          return new EmptyAction();
        }

        return this.showLoginFormAction();
      });
    }

    if (triggers.includes(LoginFormConfigTrigger.AfterBigWin)) {
      this._gameStateMachine.animation.appendLazyAnimation(() => {
        if (!this._gameStateMachine.curResponse?.bigWinName) {
          return new EmptyAction();
        }

        return this.showLoginFormAction();
      });
    }

    if (triggers.includes(LoginFormConfigTrigger.AfterJackPot)) {
      this._gameStateMachine.stop.appendLazyAnimation(() => {
        if (
          !this._gameStateMachine.curResponse?.specialSymbolGroups?.some(
            (x) => x.type == 'JackPotWin'
          )
        ) {
          return new EmptyAction();
        }

        return this.showLoginFormAction();
      });
    }

    if (triggers.includes(LoginFormConfigTrigger.BeforeBonus)) {
      this._gameStateMachine.beginBonus.appendLazyAnimation(() => {
        return this.showLoginFormAction();
      });
    }

    if (triggers.includes(LoginFormConfigTrigger.FreeSpinsStart)) {
      this._gameStateMachine.beginFreeSpins.appendLazyAnimation(() => {
        if (
          this._gameStateMachine.curResponse.freeSpinsInfo?.event !==
          FreeSpinsInfoConstants.FreeSpinsStarted
        ) {
          return new EmptyAction();
        }

        return this.showLoginFormAction();
      });
    }

    if (triggers.includes(LoginFormConfigTrigger.FreeSpinsEnd)) {
      this._gameStateMachine.reBuyFreeSpinsPopup.appendLazyAnimation(() => {
        return this.showLoginFormAction();
      });
    }
  }

  private showLoginFormAction(): Action {
    if (!this.canShowLoginForm()) {
      return new EmptyAction();
    }

    const promise = new Promise((resolve) => {
      const unsubscribePromise = this._arkadiumSdk.onOpenAuthForm((isOpened: boolean) => {
        if (!isOpened) {
          unsubscribePromise.then((callback) => callback());

          this.updateShowTime();

          // TODO: remove set timeout
          setTimeout(resolve, 2000);
        }
      });
    });

    this._arkadiumSdk.openAuthForm();

    return new PromiseAction(promise);
  }

  private canShowLoginForm(): boolean {
    return !this._externalUserService.isAuthorized && Date.now() >= this._showTime;
  }

  private updateShowTime(isFirst: boolean = false): void {
    const timeout = isFirst ? this._config!.firstShowTimeout : this._config!.showTimeout;
    this._showTime = Date.now() + timeout * 1000;
  }
}
