import {
  IBalanceUpdater,
  ISpinResponse,
  NumberFormatter,
  SceneCommon,
  T_IBalanceUpdater,
} from '@cgs/common';
import {
  TextSceneObject,
  SceneObject,
  EventDispatcher,
  ActionActivator,
  EmptyAction,
  Button,
  SequenceAction,
  FunctionAction,
  ActionFactory,
  EventStream,
  Container,
  SoundSceneObject,
  Compatibility,
  Vector2,
  IntervalAction,
  InterpolateInplaceAction,
  easeInOut,
  ParallelAction,
} from '@cgs/syd';
import { BaseSlotPopupView, SlotPopups } from '../../../common/slot/views/base_popup_view';
import { Game112EndFreeSpinsPopupController } from './game112_end_free_spins_popup_controller';
import { ResourcesComponent } from '../../resources_component';
import { T_IGameStateMachineProvider, T_ResourcesComponent } from '../../../../type_definitions';
import { SoundInstance } from '../../../../reels_engine/sound_instance';
import { NodeUtils } from '@cgs/shared';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';

export class Game112EndFreeSpinsPopupView extends BaseSlotPopupView<Game112EndFreeSpinsPopupController> {
  private _totalWin: TextSceneObject[] = [];
  private _totalLose: TextSceneObject;
  private _spinsCount: TextSceneObject[] = [];
  private _spinsLoseCount: TextSceneObject[] = [];
  private _page: SceneObject[] = [];
  private _popupView: SceneObject;
  private reBuySpinsDispatcher: EventDispatcher<string> = new EventDispatcher<string>();
  get reBuySpins(): EventStream<string> {
    return this.reBuySpinsDispatcher.eventStream;
  }
  private _closeOnAnimFinished: boolean = false;
  private _hasWin: boolean;
  private _activator: ActionActivator;
  private _delayActivator: ActionActivator;
  private _animateTotalWin: boolean;
  private readonly _sceneCommon: SceneCommon;
  private readonly _balanceUpdater: IBalanceUpdater;
  private readonly _gameStateMachine: GameStateMachine<ISpinResponse>;

  constructor(
    _root: SceneObject,
    popupView: SceneObject,
    closeOnAnimFinished: boolean,
    container: Container,
    sceneCommon: SceneCommon
  ) {
    super(_root, popupView, null, SlotPopups.EndFreeSpins);

    this._sceneCommon = sceneCommon;
    this._balanceUpdater = container.forceResolve<IBalanceUpdater>(T_IBalanceUpdater);

    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._popupView = popupView;
    this._activator = ActionActivator.withAction(this._popupView, new EmptyAction());
    this._delayActivator = ActionActivator.withAction(this._popupView, new EmptyAction());
    const closeButtons = this._popupView.findAllById<Button>('back_to_game');
    const rebuyButtons = this._popupView.findAllById<Button>('rebuy_btn');

    const resourcesComponent = container.resolve<ResourcesComponent>(T_ResourcesComponent);
    const buttonClickSoundScene = resourcesComponent?.sounds
      .findById<SoundSceneObject>('button_click')
      ?.findAllByType(SoundSceneObject)[0];
    const buttonClickSound = new SoundInstance(buttonClickSoundScene || null);

    closeButtons.forEach((closeButton) =>
      closeButton.clicked.listen(() => {
        buttonClickSound.stop();
        buttonClickSound.play();
        this.onBackToGameClicked();
      })
    );
    for (const rebuyButton of rebuyButtons) {
      if (rebuyButton) {
        rebuyButton.clicked.listen((_b) => this.reBuySpinsDispatcher.dispatchEvent());
      }
    }
    this._totalWin = this._popupView.findAllById<TextSceneObject>('total_win_text');
    this._totalLose = this._popupView.findById<TextSceneObject>('total_lose_text')!;
    this._spinsCount = this._popupView.findAllById<TextSceneObject>('spins_win_text');
    this._spinsLoseCount = this._popupView.findAllById<TextSceneObject>('spins_lose_text');

    this._page = this._popupView.findAllById('page');

    if (closeOnAnimFinished) {
      const winStateName = 'winClose';
      const loseStateName = 'loseClose';
      for (const page of this._page) {
        if (page && page.stateMachine) {
          const winState = page.stateMachine.findById(winStateName);
          const loseState = page.stateMachine.findById(loseStateName);
          if (winState && loseState) {
            winState.enterAction.done.listen((_e) => this.controller.onCloseClicked());
            loseState.enterAction.done.listen((_e) => this.controller.onCloseClicked());
          }
        }
      }
    }
  }

  private onBackToGameClicked(): void {
    const isDone = !this._activator.action || this._activator.action.isDone;
    if (this._activator) {
      this._activator.end();
    }

    if (this._animateTotalWin && !isDone) {
      this._delayActivator.action = new SequenceAction([
        new EmptyAction().withDuration(1.0),
        new FunctionAction(() => {
          this._delayActivator.stop();
          this.closePopup();
        }),
      ]);
      this._delayActivator.start();
    } else if (!this._delayActivator || this._delayActivator.action?.isDone) {
      this.closePopup();
    }
  }

  private closePopup(): void {
    this.controller.onCloseClicked();

    this.animateMoney(() => this._balanceUpdater.resumeUpdate(true));
  }

  private animateMoney(updateBalanceCallback: () => void): void {
    const balanceScene = this.root.findAllById('ShopBtn')[Compatibility.isPortrait ? 0 : 1];

    const winningScene = this._sceneCommon.sceneFactory.build(
      'slot/popups/end_freespins/screenNode.winningEndFS'
    )!;

    const moneyScene = winningScene.findById('winningEndFS')!;

    const textScenes = moneyScene.findAllById<TextSceneObject>('total_win_text');
    const win = this._gameStateMachine.curResponse.freeSpinsInfo?.totalWin || 0;
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

  public setSpins(spins: string): void {
    if (this._spinsCount) {
      for (const spinsCount of this._spinsCount) {
        spinsCount.text = spins;
      }
    }

    if (this._spinsLoseCount) {
      for (const spinsLoseCount of this._spinsLoseCount) {
        spinsLoseCount.text = spins;
      }
    }
  }

  public onShown(): void {
    this.controller.onEndFreeSpinShown();
  }

  public setMode(hasWin: boolean): void {
    this._hasWin = hasWin;
    for (const page of this._page) {
      if (page && page.stateMachine) {
        let state = 'win';
        if (!hasWin) {
          state = 'lose';
          console.log('end free spin: no win');
        } else {
          console.log('end free spin: congratulation');
        }

        page.stateMachine.switchToState(state);
      }
    }
  }

  public setTotalWin(totalWin: number, withAnim: boolean = false): void {
    this._animateTotalWin = withAnim;
    if (withAnim) {
      this.setTextByIdWithAnim(totalWin);
    } else {
      if (this._totalWin) {
        for (const totalWinNode of this._totalWin)
          totalWinNode.text = NumberFormatter.formatMoney(totalWin);
      }
      if (this._totalLose) this._totalLose.text = NumberFormatter.formatMoney(totalWin);
    }
  }

  public setRebuyState(isRebuy: boolean, price: number): void {
    const rebuyStates = this._popupView.findAllById('ButtonStates');
    const rebuyPrices = this._popupView.findAllById<TextSceneObject>('RebuyPrice');
    if (rebuyStates.length > 0 && rebuyPrices.length > 0) {
      if (isRebuy) {
        for (const rebuyPrice of rebuyPrices) {
          rebuyPrice.text = NumberFormatter.formatMoney(price);
        }
        for (const rebuyState of rebuyStates) {
          rebuyState.stateMachine!.switchToState('rebuy');
        }
      } else {
        for (const rebuyState of rebuyStates) {
          rebuyState.stateMachine!.switchToState('default');
        }
      }
    }
  }

  public setFreeSpinsMode(modePickerId: string | null, mode: string): void {
    if (this._popupView.stateMachine) {
      this._popupView.stateMachine.switchToState(mode);
    }
  }

  public displayBalance(value: number): void {
    if (this._totalWin) {
      for (const totalWinNode of this._totalWin)
        totalWinNode.text = NumberFormatter.formatMoney(value);
    }
    if (this._totalLose) this._totalLose.text = NumberFormatter.formatMoney(value);
  }

  public setTextByIdWithAnim(value: number): void {
    if (this._totalWin) {
      this._totalWin.forEach(
        (totalWinNode) => (totalWinNode.text = NumberFormatter.formatMoney(0))
      );
    }
    const duration = 4.0;
    const incrementWinAction = ActionFactory.CreateInterpolateDouble()
      .withValues(1.0, value)
      .withDuration(duration);
    incrementWinAction.valueChange.listen((value) => {
      this.displayBalance(value as number);
    });

    const action = new SequenceAction([
      new EmptyAction().withDuration(0.3),
      incrementWinAction,
      new FunctionAction(() => {
        this._activator.stop();
      }),
    ]);
    this._activator = ActionActivator.withAction(this._popupView, action);
    this._activator.start();
  }
}
