import { ISimpleUserInfoHolder, ISpinResponse, T_ISimpleUserInfoHolder } from '@cgs/common';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { Compatibility, Container, IDisposable, State } from '@cgs/syd';
import { EnvironmentConfig, Translations } from '@cgs/shared';
import { BaseGameState } from '../../../reels_engine/state_machine/states/base_game_state';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider, T_ISlotSessionProvider } from '../../../type_definitions';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { ISlotSessionProvider } from '../interfaces/i_slot_session_provider';
import { SlotSession, SlotSessionProperties } from '../../common/slot_session';

const SESSION_INFO_ELEMENT_ID = 'sessionInfo';

enum GameStateMachineEvent {
  Accelerate = 'accelerate',
  BeginFreeSpinsPopup = 'beginFreeSpinsPopup',
  EndFreeSpinsPopup = 'endFreeSpinsPopup',
  Init = 'init',
  Stop = 'stop',
}

export class SessionInfoHandler implements IDisposable {
  private _subscriptions: (() => void)[] = [];
  private _sessionInfoElement: HTMLElement | null;
  private _userInfoHolder: ISimpleUserInfoHolder | null = null;
  private _gameStateMachine: GameStateMachine<ISpinResponse> | null = null;
  private _session: SlotSession | null = null;
  private _translations: Translations | null = null;

  constructor(
    private container: Container,
    private resourceUrl: string
  ) {
    if (EnvironmentConfig.showSessionInfo) {
      this.initialize();
    }
  }

  public dispose(): void {
    this._subscriptions.forEach((unsubscribe) => unsubscribe());
    this._subscriptions = [];
  }

  private initialize(): void {
    this._translations = new Translations(this.resourceUrl, 'session_info/translations.json');

    this._userInfoHolder = this.container.resolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder);
    this._gameStateMachine =
      this.container.resolve<IGameStateMachineProvider>(T_IGameStateMachineProvider)
        ?.gameStateMachine || null;
    this._session =
      this.container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;

    this._sessionInfoElement = document.getElementById(SESSION_INFO_ELEMENT_ID);

    if (Compatibility.IsMobileBrowser) {
      this._sessionInfoElement?.classList.add('is-mobile');
    }

    this.handleGameStateMachineStateChange();
    this.handleTotalBetChange();

    this.handleWindowResize();
  }

  private handleGameStateMachineStateChange(): void {
    if (!this._gameStateMachine || !this._userInfoHolder) {
      return;
    }

    const accelerateSub = this._gameStateMachine.accelerate.entered.listen((data) =>
      this.updateInfo(data, GameStateMachineEvent.Accelerate)
    );
    const stopSub = this._gameStateMachine.stop.entered.listen((data) =>
      this.updateInfo(data, GameStateMachineEvent.Stop)
    );
    const beginFreeSpinsPopupSub = this._gameStateMachine.beginFreeSpinsPopup.entered.listen(
      (data) => this.updateInfo(data, GameStateMachineEvent.BeginFreeSpinsPopup)
    );
    const endFreeSpinsPopupSub = this._gameStateMachine.endFreeSpinsPopup.leaved.listen((data) =>
      this.updateInfo(data, GameStateMachineEvent.EndFreeSpinsPopup)
    );
    const initSub = this._gameStateMachine.init.entered.listen((data) =>
      this.updateInfo(data, GameStateMachineEvent.Init)
    );

    this._subscriptions = [
      ...this._subscriptions,
      () => this._gameStateMachine?.accelerate.entered.cancel(accelerateSub),
      () => this._gameStateMachine?.stop.entered.cancel(stopSub),
      () => this._gameStateMachine?.beginFreeSpinsPopup.entered.cancel(beginFreeSpinsPopupSub),
      () => this._gameStateMachine?.endFreeSpinsPopup.leaved.cancel(endFreeSpinsPopupSub),
      () => this._gameStateMachine?.init.entered.cancel(initSub),
    ];
  }

  private handleTotalBetChange(): void {
    const propertyChangedSub = this._session?.propertyChanged.listen((property) => {
      if (property === SlotSessionProperties.TotalBet) {
        this.updateText('');
      }
    });

    this._subscriptions = [
      ...this._subscriptions,
      () => this._session?.propertyChanged.cancel(propertyChangedSub!),
    ];
  }

  private updateInfo(data: State, event: GameStateMachineEvent): void {
    const curResponse = (data as BaseGameState<ISpinResponse>).responseHolder.curResponse;

    const gameNumber = this._userInfoHolder?.user.gameNumber || '';

    if (this._sessionInfoElement && gameNumber) {
      const fsCount = Math.max(
        (curResponse.freeSpinsInfo?.currentFreeSpinsGroup?.count || 0) - 1,
        0
      );
      const totalFsCount =
        (curResponse.freeSpinsInfo?.currentFreeSpinsGroup?.count || 0) +
        (curResponse.freeSpinsInfo?.currentFreeSpinsGroup?.usedCount || 0);

      const isFreeSpinsFinished =
        curResponse.freeSpinsInfo?.event === FreeSpinsInfoConstants.FreeSpinsFinished;

      const postfix = totalFsCount && !isFreeSpinsFinished ? ` (${fsCount}/${totalFsCount})` : '';

      if (event === GameStateMachineEvent.Stop && postfix) {
        return;
      }

      this.updateText(gameNumber + postfix);
    }
  }

  private async updateText(text: string): Promise<void> {
    const prefixText = await this._translations!.getAsync('game-number');
    this._sessionInfoElement!.innerText = text ? `${prefixText}: ${text}` : '';
  }

  private handleWindowResize(): void {
    this.onResize();

    const onResize = () => this.onResize();

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('fullscreenchange', onResize);

    this._subscriptions = [
      ...this._subscriptions,
      () => window.removeEventListener('resize', onResize),
      () => window.removeEventListener('orientationchange', onResize),
      () => document.removeEventListener('fullscreenchange', onResize),
    ];
  }

  private onResize(): void {
    if (Compatibility.IsMobileBrowser && Compatibility.isPortrait) {
      this._sessionInfoElement?.classList.add('is-portrait');
    } else {
      this._sessionInfoElement?.classList.remove('is-portrait');
    }
  }
}
