import {
  SceneObject,
  EventDispatcher,
  EventStream,
  Vector2,
  Compatibility,
  debounce,
} from '@cgs/syd';
import { BaseSlotView, ISlotPopupView } from '../../base_slot_view';

export class DrawOrderConstants {
  static readonly ProgressiveBonusDrawOrder: number = 600;
  static readonly MiniGameViewDrawOrder: number = 700;
  static readonly SlotLogoViewDrawOrder: number = 800;
  static readonly CharacterUnderContestPanelDrawOrder: number = 840;
  static readonly SlotHudViewDrawOrder: number = 850;
  static readonly ContestPanelDrawOrder: number = 850;
  static readonly IndicatorsDrawOrder: number = 970;
  static readonly TurboWinPanelDrawOrder: number = 850;
  static readonly Top: number = 100000;
  static readonly KingOfGame: number = 100010;
  static readonly BasePopupViewDrawOrder: number = 1100;
  static readonly TutorialDrawOrder: number = 12000;
  static readonly AutoSpinDrawOrder: number = 15000;
  static readonly BackGroundDrawOrder: number = -1200;
}

export enum SlotPopups {
  StartFreeSpins = 'StartFreeSpins',
  EndFreeSpins = 'EndFreeSpins',
  Paytable = 'Paytable',
  BonusRecovery = 'BonusRecovery',
  EpicWin = 'EpicWin',
  Jackpot = 'Jackpot',
  Gift = 'Gift',
  MaxBetExceeded = 'MaxBetExceeded',
  SlotIntro = 'SlotIntro',
  SomethingWentWrong = 'SomethingWentWrong',
  NotEnoughBalance = 'NotEnoughBalance',
  Shop = 'Shop',
}

const RESIZE_DELAY = 100;

export class BaseSlotPopupView<T> extends BaseSlotView<T> implements ISlotPopupView {
  private _popupId: string;
  private readonly _popup: SceneObject;
  protected _soundNode: SceneObject | null;
  private readonly _closedDispatcher: EventDispatcher<void>;
  private readonly _closingDispatcher: EventDispatcher<void>;
  private readonly _shownDispatcher: EventDispatcher<void>;
  private readonly _showingDispatcher: EventDispatcher<void>;

  constructor(
    root: SceneObject,
    popup: SceneObject,
    soundNode: SceneObject | null,
    popupId: string
  ) {
    super(root);
    if (!root || !popup) {
      throw new Error('_root and _popupView cannot be null');
    }
    this._popupId = popupId;
    this._popup = popup;
    this._soundNode = soundNode;
    this._closedDispatcher = new EventDispatcher();
    this._closingDispatcher = new EventDispatcher();
    this._shownDispatcher = new EventDispatcher();
    this._showingDispatcher = new EventDispatcher();

    const debounceResize = debounce(() => this.resize(), RESIZE_DELAY);

    window.addEventListener('resize', debounceResize);
    window.addEventListener('orientationchange', debounceResize);
    document.addEventListener('fullscreenchange', debounceResize);
    document.addEventListener('mozfullscreenchange', debounceResize);
    document.addEventListener('msfullscreenchange', debounceResize);
    document.addEventListener('webkitfullscreenchange', debounceResize);
    this.resize();
  }

  protected resize(): void {
    if (Compatibility.isPortrait) {
      const initialSizeX = this._popup.findById('sizeFrame')?.size.x;
      const initialPosX = this._popup.position.x;
      const initialPosY = this._popup.position.y;
      let windowWidth = window.innerWidth;

      const originalRatio = 1657 / 768;
      const windowRatio = window.innerHeight / window.innerWidth;
      if (windowRatio > originalRatio) {
        windowWidth = 768;
        const scale = initialSizeX !== undefined ? windowWidth / initialSizeX : 1;
        const offsetX = initialPosX * (1 - scale);
        const offsetY = initialPosY * (1 - scale);
        this._popup.position.addVector(new Vector2(offsetX, offsetY));
        this._popup.scale = new Vector2(scale, scale);
      } else {
        const newWindowWidth = windowWidth * (1657 / window.innerHeight);
        const scale = initialSizeX !== undefined ? newWindowWidth / initialSizeX : 1;
        const offsetX = initialPosX * (1 - scale);
        const offsetY = initialPosY * (1 - scale);
        this._popup.position.addVector(new Vector2(offsetX, offsetY));
        this._popup.scale = new Vector2(scale, scale);
      }
    } else {
      this._popup.position = new Vector2(0.0, 0.0);
      this._popup.scale = new Vector2(1.0, 1.0);
    }
  }

  get popupId(): string {
    return this._popupId;
  }

  get closed(): EventStream<void> {
    return this._closedDispatcher.eventStream;
  }

  get closing(): EventStream<void> {
    return this._closingDispatcher.eventStream;
  }

  get shown(): EventStream<void> {
    return this._shownDispatcher.eventStream;
  }

  get showing(): EventStream<void> {
    return this._showingDispatcher.eventStream;
  }

  get view(): SceneObject {
    return this._popup;
  }

  private _isShowing(): boolean {
    return this.root.childs.includes(this._popup);
  }

  restartStateMachine(): void {
    this.view.restartStateMachine();
  }

  show(): Promise<void> {
    if (!this._isShowing()) {
      const completer = new Promise<void>((resolve) => {
        const subscription = this.closed.listen(() => {
          resolve();
          subscription.cancel();
        });
      });

      this.onShowing();
      this._showingDispatcher.dispatchEvent();
      if (this._soundNode) {
        if (!this._soundNode.parent) {
          this._popup.addChild(this._soundNode);
        }
      }
      this.root.addChild(this._popup);

      this._popup.initialize();
      this._popup.z = DrawOrderConstants.BasePopupViewDrawOrder;
      this._popup.active = true;

      this.onShown();
      this._shownDispatcher.dispatchEvent();
      return completer;
    }
    return Promise.resolve();
  }

  hide(): void {
    if (this._isShowing()) {
      this.onClosing();
      this._closingDispatcher.dispatchEvent();
      this._popup.z = 0;
      this._popup.active = false;
      this.root.removeChild(this._popup);
      this.onClosed();
      this._closedDispatcher.dispatchEvent();
      requestAnimationFrame(() => {
        this._popup.deinitialize();
      });
    }
  }

  postEvent(state: string): void {
    console.log('going to state: ' + state);
    this._popup.stateMachine!.switchToState(state);
  }

  onShowing(): void {}

  onShown(): void {}

  onClosing(): void {}

  onClosed(): void {}
}
