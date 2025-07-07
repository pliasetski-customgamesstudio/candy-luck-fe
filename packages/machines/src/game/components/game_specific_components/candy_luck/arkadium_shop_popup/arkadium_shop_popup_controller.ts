import { BaseSlotPopupController } from '../../../../common/slot/controllers/base_popup_controller';
import { ArkadiumShopPopupView } from './arkadium_shop_popup_view';
import { Container } from '@cgs/syd';
import { ISlotSessionProvider } from '../../../interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider, T_LobbyFacade } from '../../../../../type_definitions';
import {
  ShopConfigItemDTO,
  ShopConfigItemType,
  SimpleDetailedUserInfoDTO,
  WatchAdsResponse,
} from '@cgs/network';
import {
  ArkadiumRequestData,
  ArkadiumSdk,
  EnvironmentConfig,
  IAlertManager,
  T_AlertManager,
} from '@cgs/shared';
import {
  IAppSettings,
  IBalanceUpdater,
  ISimpleLobbyService,
  ISimpleUserInfoHolder,
  T_IAppSettings,
  T_IBalanceUpdater,
  T_ISimpleLobbyService,
  T_ISimpleUserInfoHolder,
} from '@cgs/common';
import { LobbyFacade } from '../../../../../lobby_facade';
import { BuyCreditsError } from '@cgs/common';
import {
  BuyCreditsOption,
  CandyLuckCoinBuySelect,
  T_CandyLuckCoinBuySelect,
} from '../CandyLuckCoinBuySelect';
import { isAdsLimitError, ServerErrorCode } from '../helpers/CandyLuckErrorHelpers';

const SHOW_ITEMS_COUNT = 5;

export class ArkadiumShopPopupController extends BaseSlotPopupController<ArkadiumShopPopupView> {
  private readonly _appSettings: IAppSettings;
  private readonly _alertManager: IAlertManager;
  private readonly _lobbyService: ISimpleLobbyService;
  private readonly _coinBuySelect: CandyLuckCoinBuySelect;
  private readonly _userInfoHolder: ISimpleUserInfoHolder;

  private readonly _shopConfigMap: Record<BuyCreditsOption, ShopConfigItemDTO[]>;

  private _isOpening: boolean = false;
  private _isWaitingRequest: boolean = false;

  private _prevSound: number;

  private _adsResetTimerId: number | null = null;

  constructor(
    container: Container,
    view: ArkadiumShopPopupView,
    stopBackgroundSound: boolean = false
  ) {
    super(container, view, stopBackgroundSound);

    const lobbyFacade = container.forceResolve<LobbyFacade>(T_LobbyFacade);
    this._lobbyService =
      lobbyFacade.container.container.forceResolve<ISimpleLobbyService>(T_ISimpleLobbyService);
    this._alertManager =
      lobbyFacade.container.container.forceResolve<IAlertManager>(T_AlertManager);

    this._appSettings = lobbyFacade.resolve<IAppSettings>(T_IAppSettings)!;
    this._coinBuySelect = container.forceResolve<CandyLuckCoinBuySelect>(T_CandyLuckCoinBuySelect);

    const slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;

    this._userInfoHolder =
      this.container.forceResolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder);

    const { shopGemConfig, shopAdsConfig, shopGemAndAdsConfig } = slotSession.machineInfo;

    this._shopConfigMap = {
      [BuyCreditsOption.Gem]: shopGemConfig
        .slice(0, SHOW_ITEMS_COUNT)
        .sort((a, b) => b.count - a.count),
      [BuyCreditsOption.Ads]: shopAdsConfig
        .slice(0, SHOW_ITEMS_COUNT)
        .sort((a, b) => b.count - a.count),
      [BuyCreditsOption.GemsAndAds]: shopGemAndAdsConfig
        .slice(0, SHOW_ITEMS_COUNT)
        .sort((a, b) => b.count - a.count),
    };

    this.updateShopUI();

    this.view.onOpen.listen(() => this.handleOpen());
    this.view.onBuy.listen((index) => this.handleBuy(index));
    this.view.onClose.listen(() => this.handleClose());

    this._coinBuySelect.selectedShopOptionChanged.listen(() => this.updateShopUI());
  }

  private get _shopConfig(): ShopConfigItemDTO[] {
    return this._shopConfigMap[this._coinBuySelect.selectedShopOption];
  }

  private updateShopUI(): void {
    this._shopConfig.forEach((item, index) => {
      this.view.setCreditsValue(index, item.credits);

      if (item.type === ShopConfigItemType.Gem) {
        this.view.setGemValue(index, item.count);
        this.view.setGemButtonVisibility(index, true);
        this.view.setAdsButtonVisibility(index, false);
      } else {
        this.view.setGemButtonVisibility(index, false);
        this.view.setAdsButtonVisibility(index, true);
      }
      this.view.setTimerVisibility(index, false);
    });
  }

  private async handleOpen(): Promise<void> {
    if (this._isOpening) {
      return;
    }

    this._isOpening = true;

    this.checkAndShowTime();

    await this.view.show();

    this._isOpening = false;
  }

  private checkAndShowTime(): void {
    if (!this.isShowTimer()) {
      return;
    }

    const indexForTimer: number[] = [];

    this._shopConfig.forEach((item, index) => {
      if (item.type === ShopConfigItemType.Ads) {
        this.view.setAdsButtonVisibility(index, false);
        this.view.setTimerVisibility(index, true);
        indexForTimer.push(index);
      }
    });

    this.startAdsResetTimer((time: string) => {
      indexForTimer.forEach((index) => {
        this.view.setTimerValue(index, time);
      });
    });
  }

  private isShowTimer(): boolean {
    const resetTime = this._userInfoHolder.user.adsResetTime;
    return resetTime !== null && resetTime > Date.now();
  }

  private startAdsResetTimer(onTick: (time: string) => void): void {
    const endTime = this._userInfoHolder.user.adsResetTime!;

    const update = () => {
      const now = Date.now();
      let diff = Math.max(0, endTime - now);

      const hours = Math.floor(diff / 3600000);
      diff %= 3600000;
      const minutes = Math.floor(diff / 60000);
      diff %= 60000;
      const seconds = Math.floor(diff / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      onTick(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);

      if (endTime > now) {
        this._adsResetTimerId = window.setTimeout(update, 1000);
      } else {
        this.updateShopUI();
      }
    };

    if (this._adsResetTimerId) {
      clearTimeout(this._adsResetTimerId);
    }

    update();
  }

  private stopAdsResetTimer(): void {
    if (this._adsResetTimerId) {
      clearTimeout(this._adsResetTimerId);
      this._adsResetTimerId = null;
    }
  }

  private async handleBuy(index: number): Promise<void> {
    if (this._isWaitingRequest) {
      return;
    }

    this._isWaitingRequest = true;

    const arkadiumSdk = ArkadiumSdk.getInstance();
    const isAuthorized = EnvironmentConfig.simulateBuying || (await arkadiumSdk.isAuthorized());

    if (!isAuthorized) {
      await arkadiumSdk.openAuthForm();
      this._isWaitingRequest = false;
      return;
    }

    this.disabledButtons();

    const config = this._shopConfig[index];

    config.type === ShopConfigItemType.Gem
      ? await this.buyWithGems(config)
      : await this.buyWithAds(config);

    this.enableButtons();

    this._isWaitingRequest = false;
  }

  private async buyWithGems(config: ShopConfigItemDTO): Promise<void> {
    const requestData = await ArkadiumSdk.getInstance().getRequestData();

    if (
      (config && requestData.gameId && requestData.arenaName && requestData.token) ||
      EnvironmentConfig.simulateBuying
    ) {
      try {
        const response = await this.buyCreditsWithGemsRequest(config.count, requestData);

        const balanceUpdater = this.container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);

        await this._userInfoHolder.updateUserInfo(response);
        this.view.hideAnim(config.count, () => balanceUpdater.resumeUpdate(true));
      } catch (e: any) {
        const message = this.isNoMoneyError(e) ? 'Not enough gems.' : 'Failed to buy credits.';
        this._alertManager.show('Error', message);
      }
    } else {
      this._alertManager.show('Error', 'Something went wrong, please try again later.');
    }
  }

  private buyCreditsWithGemsRequest(
    count: number,
    requestData: ArkadiumRequestData
  ): Promise<SimpleDetailedUserInfoDTO> {
    if (EnvironmentConfig.simulateBuying) {
      const user = this._userInfoHolder.user.clone();
      user.balance += count * 10000;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new SimpleDetailedUserInfoDTO(user));
        }, 0);
      });
    }

    return this._lobbyService.buyCreditsWithGems({
      count,
      gameKey: requestData.gameId!,
      application: requestData.arenaName!,
      token: requestData.token!,
    });
  }

  private async buyWithAds(config: ShopConfigItemDTO): Promise<void> {
    const getTokenPromise = this.watchAdsRequest(config.count);

    this._prevSound = this._appSettings.sounds;
    this._appSettings.sounds = 0;

    try {
      await ArkadiumSdk.getInstance().showRewardAd();

      const token = (await getTokenPromise).token;

      const response = await this.buyCreditsWithAdsRequest(config.count, token);

      const balanceUpdater = this.container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);

      await this._userInfoHolder.updateUserInfo(response);
      this.view.hideAnim(config.count, () => balanceUpdater.resumeUpdate(true));
    } catch (e: any) {
      const message = isAdsLimitError(e)
        ? 'Ads watch limit exceeded. Please wait some time and try again.'
        : 'Something went wrong, please try again later.';

      this._alertManager.show('Error', message);
    }

    this._appSettings.sounds = this._prevSound;
  }

  private watchAdsRequest(count: number): Promise<WatchAdsResponse> {
    if (EnvironmentConfig.simulateBuying) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new WatchAdsResponse({ token: 'test-token' }));
        }, 0);
      });
    }

    return this._lobbyService.watchAds({ count });
  }

  private buyCreditsWithAdsRequest(
    count: number,
    token: string
  ): Promise<SimpleDetailedUserInfoDTO> {
    if (EnvironmentConfig.simulateBuying) {
      const user = this._userInfoHolder.user.clone();
      user.balance += count * 10000;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new SimpleDetailedUserInfoDTO(user));
        }, 0);
      });
    }

    return this._lobbyService.buyCreditsWithAds({
      count,
      token,
    });
  }

  private disabledButtons(): void {
    this._shopConfig.forEach((_, index) => {
      this.view.disabledButton(index);
    });
  }

  private enableButtons(): void {
    this._shopConfig.forEach((_, index) => {
      this.view.enableButton(index);
    });
  }

  private handleClose(): void {
    this.view.hide();
    this.enableButtons();
    this.stopAdsResetTimer();
  }

  private isNoMoneyError(error: Error): boolean {
    return (
      error instanceof BuyCreditsError &&
      error.innerException.data?.data?.details?.some(
        (detail: any) =>
          detail.errorCode === ServerErrorCode.InsufficientFunds ||
          detail?.data.some((item: any) => item.errorCode === ServerErrorCode.InsufficientFunds)
      )
    );
  }
}
