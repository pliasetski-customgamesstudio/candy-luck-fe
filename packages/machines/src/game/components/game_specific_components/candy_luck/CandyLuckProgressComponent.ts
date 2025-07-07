import {
  ActionActivator,
  Button,
  Compatibility,
  Container,
  easeInOut,
  FunctionAction,
  InterpolateCopyAction,
  InterpolateInplaceAction,
  IntervalAction,
  lerp,
  ParallelAction,
  ProgressBar,
  SceneObject,
  SequenceAction,
  TextSceneObject,
  Vector2,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import {
  T_IGameStateMachineProvider,
  T_IHudCoordinator,
  T_LobbyFacade,
  T_ResourcesComponent,
} from '../../../../type_definitions';
import { RefreshExternalUserService, T_RefreshExternalUserService } from '@cgs/features';
import { LobbyFacade } from '../../../../lobby_facade';
import {
  IBalanceUpdater,
  ISimpleLobbyService,
  ISimpleUserInfoHolder,
  ISpinResponse,
  NumberFormatter,
  SceneCommon,
  T_IBalanceUpdater,
  T_ISimpleLobbyService,
  T_ISimpleUserInfoHolder,
} from '@cgs/common';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { SimpleDetailedUserInfoDTO, SimpleUserDTO, WatchAdsResponse } from '@cgs/network';
import { ResourcesComponent } from '../../resources_component';
import { DrawOrderConstants } from '../../../common/slot/views/base_popup_view';
import { IHudCoordinator } from '../../../common/footer/i_hud_coordinator';
import {
  BuyCreditsOption,
  CandyLuckCoinBuySelect,
  T_CandyLuckCoinBuySelect,
} from './CandyLuckCoinBuySelect';
import { ArkadiumSdk, IAlertManager, NodeUtils, T_AlertManager } from '@cgs/shared';
import { isAdsLimitError } from './helpers/CandyLuckErrorHelpers';

export const T_CandyLuckProgressComponent = Symbol('CandyLuckProgressComponent');

const MAX_PROGRESS = 20;

const enum SceneId {
  DailyTaskLand = 'dailyTaskLand',
  DailyTaskPort = 'dailyTaskPort',
  DailyTaskText = 'dailyTaskText',
  PopupTaskCompleted = 'popupTaskCompleted',
  CollectButton = 'okBtn',
  Collect2Button = 'okBtnBottom',
  CloseButton = 'closeBTN',
  PublicityButton = 'publicityBtn',
  ShowLoginFormBtn = 'showLoginFormBtn',
}

const enum DailyTaskState {
  DailyTaskShow = 'dailyTaskShow',
  DailyTaskEmpty = 'dailyTaskEmpty',
  DailyTaskStatic = 'dailyTaskStatic',
  DailyTaskHide = 'dailyTaskHide',
  UnregisteredUser = 'unregisteredUser',
}

const enum PopupStats {
  Show = 'show',
  Hide = 'hide',
}

const POPUP_SCENE_NAME = 'slot/popupTC';

const ADS_WATCH_MULTIPLIER = 2;

export class CandyLuckProgressComponent {
  private readonly _resourcesComponent: ResourcesComponent;
  private readonly _externalUserService: RefreshExternalUserService;
  private readonly _userInfoHolder: ISimpleUserInfoHolder;
  private readonly _gameStateMachine: GameStateMachine<ISpinResponse>;
  private readonly _balanceUpdater: IBalanceUpdater;
  private readonly _hudCoordinator: IHudCoordinator;
  private readonly _coinBuySelect: CandyLuckCoinBuySelect;
  private readonly _lobbyService: ISimpleLobbyService;
  private readonly _alertManager: IAlertManager;
  private readonly _sceneCommon: SceneCommon;
  private readonly _rootScene: SceneObject;

  private readonly _dailyTaskScene: SceneObject[];

  private readonly _popupScene: SceneObject | null = null;

  private readonly _testMode: boolean = false;

  private _canWatchAdsPromise: Promise<WatchAdsResponse | null> | null = null;

  constructor(container: Container, sceneCommon: SceneCommon) {
    this._sceneCommon = sceneCommon;
    this._popupScene = sceneCommon.sceneFactory.build(POPUP_SCENE_NAME);

    this._rootScene = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;

    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    this._dailyTaskScene = [
      ...this._resourcesComponent.root.findAllById(SceneId.DailyTaskLand),
      ...this._resourcesComponent.root.findAllById(SceneId.DailyTaskPort),
    ];

    this._userInfoHolder = container.resolve<ISimpleUserInfoHolder>(T_ISimpleUserInfoHolder)!;
    this._balanceUpdater = container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);

    this._hudCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);

    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._gameStateMachine.reBuyFreeSpinsPopup.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          setTimeout(() => {
            this.showProgressWinPopup();
          }, 1500);
        })
    );
    this._gameStateMachine.endFreeSpins.appendLazyAnimation(
      () => new FunctionAction(() => this.getWatchAdsToken())
    );

    const lobbyFacade = container.forceResolve<LobbyFacade>(T_LobbyFacade);
    this._externalUserService =
      lobbyFacade.container.container.forceResolve<RefreshExternalUserService>(
        T_RefreshExternalUserService
      );

    this._lobbyService =
      lobbyFacade.container.container.forceResolve<ISimpleLobbyService>(T_ISimpleLobbyService);

    this._coinBuySelect = container.forceResolve<CandyLuckCoinBuySelect>(T_CandyLuckCoinBuySelect);

    this._alertManager =
      lobbyFacade.container.container.forceResolve<IAlertManager>(T_AlertManager);

    this._externalUserService.userRefreshed.listen(() => {
      this.onAuthStatusChange();
    });

    this.onAuthStatusChange();

    this.handleShowLoginForm();

    if (this._testMode) {
      this.addTestShowPopupButton();
    }
  }

  private onAuthStatusChange(): void {
    if (this.isAuthorized) {
      this.showProgressBar();
      this.updateProgressBar(this._userInfoHolder.user.progress);
    } else {
      this.showUnregisteredUserProgressBar();
    }
  }

  private showProgressBar(): void {
    this._dailyTaskScene.forEach((scene) => {
      scene.stateMachine?.switchToState(DailyTaskState.DailyTaskShow);
    });
  }

  private showUnregisteredUserProgressBar(): void {
    this._dailyTaskScene.forEach((scene) => {
      scene.stateMachine?.switchToState(DailyTaskState.UnregisteredUser);
    });
  }

  private handleShowLoginForm(): void {
    this._dailyTaskScene.forEach((scene) => {
      scene
        .findById<Button>(SceneId.ShowLoginFormBtn)
        ?.clicked.listen(() => ArkadiumSdk.getInstance().openAuthForm());
    });
  }

  private updateProgressBar(progress: number): void {
    this.updateProgressText(progress);

    const progressBar = this._dailyTaskScene.map((scene) => scene.findAllByType(ProgressBar)[0]);

    const updateProgressAction = new InterpolateCopyAction<number>()
      .withValues(progressBar[0].progress * MAX_PROGRESS, progress)
      .withInterpolateFunction(lerp)
      .withDuration(Math.max(Math.log2(progress) / 4, 0.5));

    updateProgressAction.valueChange.listen((value: number) =>
      progressBar.map((bar) => (bar.progress = value / MAX_PROGRESS))
    );

    const activator = new ActionActivator(this._resourcesComponent.root);

    activator.action = updateProgressAction;
    activator.start();
  }

  private updateProgressText(progress: number): void {
    this._dailyTaskScene.forEach((scene) => {
      scene.findAllById<TextSceneObject>(SceneId.DailyTaskText).forEach((textScene) => {
        textScene.text = `${progress}/${MAX_PROGRESS}`;
      });
    });
  }

  private async showProgressWinPopup(): Promise<void> {
    const progressWin = this._gameStateMachine.curResponse.progressWin;

    if (!this.isAuthorized || !progressWin) {
      return;
    }

    const progress = this._userInfoHolder.user.progress;

    const newProgressWin = await this.shopPopup(progress, progressWin);
    this.updateProgressBar(progress);

    this.animateMoney(newProgressWin, async () => await this.updateBalance(newProgressWin));
  }

  private async shopPopup(progress: number, progressWin: number): Promise<number> {
    if (!this._popupScene) {
      alert(`Your progress is ${progress} and you have won ${progressWin}`);
      return progressWin;
    }

    if (!this._canWatchAdsPromise) {
      this._canWatchAdsPromise = this.getWatchAdsToken();
    }

    const token = this._canWatchAdsPromise ? (await this._canWatchAdsPromise)?.token : null;

    this._resourcesComponent.root.addChild(this._popupScene);

    this._popupScene.initialize();
    this._popupScene.z = DrawOrderConstants.BasePopupViewDrawOrder;
    this._popupScene.active = true;

    const popupNodeScene = this._popupScene.findById(SceneId.PopupTaskCompleted);
    popupNodeScene?.stateMachine?.switchToState(PopupStats.Show);

    this.showPopupWin(progressWin);

    const collectButton = popupNodeScene?.findById<Button>(SceneId.CollectButton);
    const collect2Button = popupNodeScene?.findById<Button>(SceneId.Collect2Button);
    const closeButton = popupNodeScene?.findById<Button>(SceneId.CloseButton);
    const publicityButton = popupNodeScene?.findById<Button>(SceneId.PublicityButton);

    if (this._coinBuySelect.selectedShopOption === BuyCreditsOption.Ads && token) {
      if (collectButton) {
        collectButton.visible = false;
      }
      if (publicityButton) {
        publicityButton.visible = true;
      }
      if (collect2Button) {
        collect2Button.visible = true;
      }
    } else {
      if (publicityButton) {
        publicityButton.visible = false;
      }
      if (collect2Button) {
        collect2Button.visible = false;
      }
      if (collectButton) {
        collectButton.visible = true;
      }
    }

    this._hudCoordinator.disableHud();

    const closePopup = () => {
      this._popupScene!.z = 0;
      this._popupScene!.active = false;
      this._resourcesComponent.root.removeChild(this._popupScene!);
      this._hudCoordinator.enableHud();
      this._canWatchAdsPromise = null;
    };

    return new Promise((resolve) => {
      const subscriptions = [closeButton, collectButton, collect2Button].map((button) => {
        const subscription = button?.clicked.listen(() => {
          closePopup();
          subscriptions.forEach((unsubscribe) => unsubscribe());
          resolve(progressWin);
        });
        return () => subscription?.cancel();
      });

      const publicitySubscription = publicityButton?.clicked.listen(async () => {
        try {
          const newTokenPromise = this.getWatchAdsToken();
          await ArkadiumSdk.getInstance().showRewardAd();
          const newToken = (await newTokenPromise)!.token;
          this._lobbyService.getTaskCompletedCreditsWithAds({ token: newToken });
          this.showPopupWin(progressWin * ADS_WATCH_MULTIPLIER, progressWin);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e: any) {
          const message = isAdsLimitError(e)
            ? 'Ads watch limit exceeded. Please wait some time and try again.'
            : 'Something went wrong, please try again later.';

          this._alertManager.show('Error', message);
        }

        closePopup();
        subscriptions.forEach((unsubscribe) => unsubscribe());
        resolve(progressWin * ADS_WATCH_MULTIPLIER);
      });

      subscriptions.push(() => publicitySubscription?.cancel());
    });
  }

  private showPopupWin(progressWin: number, startValue: number = 0): void {
    const textScene = this._popupScene?.findById<TextSceneObject>(SceneId.DailyTaskText);

    const updateProgressAction = new InterpolateCopyAction<number>()
      .withValues(startValue, progressWin)
      .withInterpolateFunction(lerp)
      .withDuration(0.5);

    updateProgressAction.valueChange.listen((value: number) => {
      if (textScene) {
        textScene.text = NumberFormatter.formatMoney(value);
      }
    });

    const activator = new ActionActivator(this._resourcesComponent.root);

    activator.action = updateProgressAction;
    activator.start();
  }

  private async updateBalance(progressWin: number): Promise<void> {
    await this._userInfoHolder.updateUserInfo(
      new SimpleDetailedUserInfoDTO(
        new SimpleUserDTO({
          ...this._userInfoHolder.user,
          balance: this._userInfoHolder.user.balance + progressWin,
        })
      )
    );
    this._balanceUpdater.resumeUpdate(true);
  }

  private get isAuthorized(): boolean {
    return this._externalUserService.isAuthorized || this._testMode;
  }

  private getWatchAdsToken(): Promise<WatchAdsResponse | null> | null {
    if (this._coinBuySelect.selectedShopOption === BuyCreditsOption.Ads) {
      this._canWatchAdsPromise = this._lobbyService.watchAds({ count: 1 }).catch(() => null);
    } else {
      this._canWatchAdsPromise = null;
    }

    return this._canWatchAdsPromise;
  }

  private addTestShowPopupButton(): void {
    const button = document.createElement('button');
    button.textContent = 'Open Popup';
    button.style.position = 'fixed';
    button.style.top = '16px';
    button.style.right = '16px';
    button.style.zIndex = '1000';
    button.style.padding = '8px 16px';
    button.style.background = '#1976d2';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => {
      this.shopPopup(5, 100);
    });

    document.body.appendChild(button);
  }

  public get dailyTaskPortScene(): SceneObject {
    return this._dailyTaskScene[1];
  }

  private animateMoney(win: number, updateBalanceCallback: () => void): void {
    const balanceScene = this._rootScene.findAllById('ShopBtn')[Compatibility.isPortrait ? 0 : 1];

    const winningScene = this._sceneCommon.sceneFactory.build(
      'slot/popups/end_freespins/screenNode.winningEndFS'
    )!;

    const moneyScene = winningScene.findById('winningEndFS')!;

    const textScenes = moneyScene.findAllById<TextSceneObject>('total_win_text');
    textScenes.forEach((textScene) => (textScene.text = NumberFormatter.formatMoney(win)));

    moneyScene.parent?.removeChild(moneyScene);
    moneyScene.initialize();
    moneyScene.z = balanceScene.z + 1;

    moneyScene.stateMachine?.switchToState('show');

    const newPosition = NodeUtils.getLocalPositionFromPoint(
      winningScene,
      balanceScene,
      moneyScene.position
    );

    const moneyChildScene = moneyScene.childs[0];
    const targetPosition = moneyScene.position.add(new Vector2(0, moneyChildScene.position.y / 2));
    moneyScene.position = newPosition;
    balanceScene.addChild(moneyScene);

    const animState = moneyScene.stateMachine!.findById('anim')!;
    const animAction = animState.enterAction as IntervalAction;
    const animActionDuration = animAction?.duration || 0;

    const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(newPosition, targetPosition)
      .withTimeFunction(easeInOut)
      .withDuration(animActionDuration);

    interpolateAction.valueChange.listen((position) => {
      moneyScene.position = position;
    });

    interpolateAction.done.listen(() => {
      moneyScene.parent?.removeChild(moneyScene);
      updateBalanceCallback();
    });

    const actions = [];
    actions.push(new ParallelAction([animAction, interpolateAction]));
    actions.push(new FunctionAction(() => (animState.enterAction = animAction)));

    animState.enterAction = new SequenceAction(actions);

    moneyScene?.stateMachine?.switchToState('anim');
  }
}
