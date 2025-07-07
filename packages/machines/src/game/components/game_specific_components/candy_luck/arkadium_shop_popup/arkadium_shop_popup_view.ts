import { BaseSlotPopupView, SlotPopups } from '../../../../common/slot/views/base_popup_view';
import { ArkadiumShopPopupController } from './arkadium_shop_popup_controller';
import {
  Button,
  Compatibility,
  Container,
  easeInOut,
  EventDispatcher,
  EventStream,
  FunctionAction,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelAction,
  SceneObject,
  SequenceAction,
  SoundSceneObject,
  TextSceneObject,
  Vector2,
} from '@cgs/syd';
import { ResourcesComponent } from '../../../resources_component';
import { SoundInstance } from '../../../../../reels_engine/sound_instance';
import { SceneCommon } from '@cgs/common';
import { NodeUtils } from '@cgs/shared';
import { IHudCoordinator } from '../../../../common/footer/i_hud_coordinator';
import { T_IHudCoordinator } from '../../../../../type_definitions';

enum ShopPopupState {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  HideHorizontal = 'hide_horizontal',
  HideVertical = 'hide_vertical',
}

// Utility to format number in US style with commas and no decimals
function formatNumberUS(value: number): string {
  return Math.trunc(value).toLocaleString('en-US');
}

const ASPECT_RATION_SCALE_FPR_PORT_CONFIG: { aspect: number; scale: number }[] = [
  { aspect: 1.1, scale: 0.7 },
  { aspect: 1.7, scale: 0.6 },
];

export class ArkadiumShopPopupView extends BaseSlotPopupView<ArkadiumShopPopupController> {
  private readonly _openDispatcher: EventDispatcher<void> = new EventDispatcher();
  private readonly _closeDispatcher: EventDispatcher<void> = new EventDispatcher();
  private readonly _buyDispatcher: EventDispatcher<number> = new EventDispatcher();

  private readonly _buttonClickSound: SoundInstance;
  private readonly _sceneCommon: SceneCommon;

  private readonly _openButtonScenes: Button[];

  private isShown: boolean = false;

  constructor(
    container: Container,
    rootScene: SceneObject,
    popupView: SceneObject,
    resourcesComponent: ResourcesComponent,
    sceneCommon: SceneCommon
  ) {
    super(rootScene, popupView, null, SlotPopups.Shop);

    this._sceneCommon = sceneCommon;

    const buttonClickSoundScene = resourcesComponent.sounds
      .findById<SoundSceneObject>('button_click')
      ?.findAllByType(SoundSceneObject)[0];
    this._buttonClickSound = new SoundInstance(buttonClickSoundScene || null);

    this._openButtonScenes = this._root.findAllById<Button>('ShopBtn');

    this.handleOpenButtonClicked();
    this.handleCloseButtonClicked();
    this.handleBuyButtonClicked();

    const hudCoordinator = container.forceResolve<IHudCoordinator>(T_IHudCoordinator);
    hudCoordinator.available.listen(() => this.enableOpen());
    hudCoordinator.unavailable.listen(() => this.disableOpen());
    hudCoordinator.hudEnable.listen(() => this.enableOpen());
    hudCoordinator.hudDisable.listen(() => this.disableOpen());
  }

  public setGemValue(index: number, value: number): void {
    const gemText = this.getGemButton(index)?.findById<TextSceneObject>('price_text');

    if (gemText) {
      gemText.text = formatNumberUS(value);
    }
  }

  public setGemButtonVisibility(index: number, visible: boolean): void {
    const gemButton = this.getGemButton(index);
    if (gemButton) {
      gemButton.visible = visible;
    }
  }

  public setAdsButtonVisibility(index: number, visible: boolean): void {
    const adsButton = this.getAdsButton(index);
    if (adsButton) {
      adsButton.visible = visible;
    }
  }

  public setTimerVisibility(index: number, visible: boolean): void {
    const timerTextScene = this.getTimerTextScene(index);
    const timerValueScene = this.getTimerValueScene(index);
    const lockButton = this.getLockButton(index);
    const iconScene = this.getIconScene(index);
    if (timerTextScene && timerValueScene && lockButton && iconScene) {
      timerTextScene.forEach((textScene) => (textScene.visible = visible));
      timerValueScene.visible = visible;
      lockButton.visible = visible;
      iconScene.visible = !visible;
    }
  }

  public setTimerValue(index: number, value: string): void {
    const timerValueScene = this.getTimerValueScene(index);
    if (timerValueScene) {
      timerValueScene.text = value;
    }
  }

  public disabledButton(index: number): void {
    [this.getGemButton(index), this.getAdsButton(index)].forEach((button) => {
      if (button) {
        button.active = false;
        button.stateMachine?.switchToState('disabled');
      }
    });
  }

  public enableButton(index: number): void {
    [this.getGemButton(index), this.getAdsButton(index)].forEach((button) => {
      if (button) {
        button.active = true;
        button.stateMachine?.switchToState('up');
      }
    });
  }

  public setCreditsValue(index: number, value: number): void {
    const creditsText = this.view.findById<TextSceneObject>(`credits_text_${index}`);

    if (creditsText) {
      creditsText.text = formatNumberUS(value);
    }
  }

  public get onOpen(): EventStream<void> {
    return this._openDispatcher.eventStream;
  }

  public get onClose(): EventStream<void> {
    return this._closeDispatcher.eventStream;
  }

  public get onBuy(): EventStream<number> {
    return this._buyDispatcher.eventStream;
  }

  private getGemButton(index: number): Button | null {
    return this.view.findById<Button>(`buyBtn_${index}`);
  }

  private getAdsButton(index: number): Button | null {
    return this.view.findById<Button>(`publicityBtn_${index}`);
  }

  private getTimerTextScene(index: number): SceneObject[] {
    return this.view.findAllById(`taimer_text_${index}`);
  }

  private getTimerValueScene(index: number): TextSceneObject | null {
    return this.view.findById<TextSceneObject>(`taimer_${index}`);
  }

  private getLockButton(index: number): SceneObject | null {
    return this.view.findById(`lockBtn_${index}`);
  }

  private getIconScene(index: number): SceneObject | null {
    return this.view.findById(`img_coin_${index}`);
  }

  private handleBuyButtonClicked(): void {
    let gemButton, adsButton: Button | null;
    let index = 0;

    while ((gemButton = this.getGemButton(index)) && (adsButton = this.getAdsButton(index))) {
      const buttonIndex = index;
      gemButton.clicked.listen(() => {
        this.onButtonClick();
        this._buyDispatcher.dispatchEvent(buttonIndex);
      });
      adsButton.clicked.listen(() => {
        this.onButtonClick();
        this._buyDispatcher.dispatchEvent(buttonIndex);
      });
      index++;
    }
  }

  private handleOpenButtonClicked(): void {
    this._openButtonScenes.forEach((btn) =>
      btn.clicked.listen(() => {
        this.onButtonClick();
        this._openDispatcher.dispatchEvent();
      })
    );
  }

  private handleCloseButtonClicked(): void {
    this.view.findById<Button>('closeBtn')?.clicked.listen(() => {
      this.onButtonClick();
      this._closeDispatcher.dispatchEvent();
    });
  }

  public show(): Promise<void> {
    this.updateMode();
    return super.show();
  }

  protected resize() {
    if (this.isShown) {
      this.updateMode();
    }
    super.resize();
    this.scalePopup();
  }

  private updateMode(): void {
    const mode = this.view.findById('Modes');
    mode?.initialize();
    mode?.stateMachine?.switchToState(
      Compatibility.isPortrait ? ShopPopupState.Vertical : ShopPopupState.Horizontal
    );
  }

  private onButtonClick(): void {
    this._buttonClickSound.stop();
    this._buttonClickSound.play();
  }

  public hideAnim(gems: number, updateBalanceCallback: () => void): void {
    const mode = this.view.findById('Modes');
    const state = Compatibility.isPortrait
      ? ShopPopupState.HideVertical
      : ShopPopupState.HideHorizontal;
    const hideAction = mode?.stateMachine?.findById(state)?.enterAction as IntervalAction;
    const hideActionDuration = hideAction?.duration || 0;
    mode?.stateMachine?.switchToState(state);

    setTimeout(() => {
      super.hide();
      this.animateMoney(gems, updateBalanceCallback);
    }, hideActionDuration * 1000);
  }

  private animateMoney(gems: number, updateBalanceCallback: () => void): void {
    const balanceScene = this.root.findAllById('ShopBtn')[Compatibility.isPortrait ? 0 : 1];

    const winningShopScene = this._sceneCommon.sceneFactory.build(
      'slot/shop/screenNode.winningShop'
    )!;

    const moneyScene = winningShopScene.findById('winning_shop')!;
    moneyScene.parent?.removeChild(moneyScene);
    moneyScene.initialize();
    moneyScene.z = balanceScene.z + 1;

    moneyScene.stateMachine?.switchToState(`show_item${gems}`);

    const newPosition = NodeUtils.getLocalPositionFromPoint(
      winningShopScene,
      balanceScene,
      moneyScene.position
    );

    const moneyChildScene = moneyScene.childs[0];
    const targetPosition = moneyScene.position.add(new Vector2(0, moneyChildScene.position.y / 2));
    moneyScene.position = newPosition;
    balanceScene.addChild(moneyScene);

    const animState = moneyScene.stateMachine!.findById(`anim_item${gems}`)!;
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

    moneyScene?.stateMachine?.switchToState(`anim_item${gems}`);
  }

  public onShown(): void {
    super.onShown();
    this.isShown = true;
  }

  public onClosed(): void {
    super.onClosed();
    this.isShown = false;
  }

  private disableOpen(): void {
    this._openButtonScenes.forEach((btn) => (btn.touchable = false));
  }

  private enableOpen(): void {
    this._openButtonScenes.forEach((btn) => (btn.touchable = true));
  }

  private initialScale: Vector2;
  private scalePopup(): void {
    if (!this.initialScale) {
      this.initialScale = this.view.scale.clone();
    }

    const windowRatio = window.innerHeight / window.innerWidth;

    const config =
      windowRatio >= 1
        ? ASPECT_RATION_SCALE_FPR_PORT_CONFIG.find((item) => item.aspect >= windowRatio)
        : null;

    if (config) {
      this.view.scale = new Vector2(config.scale, config.scale);
    }
  }
}
