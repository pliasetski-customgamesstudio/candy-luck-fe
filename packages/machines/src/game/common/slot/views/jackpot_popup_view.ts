import { ISpinResponse, NumberFormatter } from '@cgs/common';
import {
  ActionActivator,
  Action,
  Container,
  SceneObject,
  EmptyAction,
  Button,
  SequenceAction,
  FunctionAction,
  Rect,
  Vector2,
  AbstractMouseEvent,
  MouseDownEvent,
  TextSceneObject,
  InterpolateCopyAction,
  lerp,
  ParallelSimpleAction,
  SequenceSimpleAction,
  SoundSceneObject,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider, T_ResourcesComponent } from '../../../../type_definitions';
import { JackPotWinPopupController } from '../controllers/jackpot_popup_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';
import { ResourcesComponent } from '../../../components/resources_component';
import { SoundInstance } from '../../../../reels_engine/sound_instance';

export class JackPotPopupView extends BaseSlotPopupView<JackPotWinPopupController> {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  public get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  private _textAnimDuration: number;
  private _incrementDuration: number;
  private _delayActivator: ActionActivator;
  private _popupAnimationAction: Action;

  constructor(
    container: Container,
    root: SceneObject,
    popup: SceneObject,
    textAnimDuration: number,
    incrementDuration: number,
    closeWithButton: boolean
  ) {
    super(root, popup, null, SlotPopups.Jackpot);

    this._textAnimDuration = textAnimDuration;
    this._incrementDuration = incrementDuration;

    this._delayActivator = ActionActivator.withAction(this.view, new EmptyAction());

    if (closeWithButton) {
      const closeButtons = this.view.findAllById<Button>('closeBtn');

      const resourcesComponent = container.resolve<ResourcesComponent>(T_ResourcesComponent);
      const buttonClickSoundScene = resourcesComponent?.sounds
        .findById<SoundSceneObject>('button_click')
        ?.findAllByType(SoundSceneObject)[0];
      const buttonClickSound = new SoundInstance(buttonClickSoundScene || null);

      for (const closeButton of closeButtons) {
        closeButton.clicked.listen(() => {
          buttonClickSound.stop();
          buttonClickSound.play();
          this._onBackToGameClicked();
        });
      }
    } else {
      this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ).gameStateMachine;
      this._gameStateMachine.init.entered.listen(() => {
        this.subscribeToSceneAnimationEvents();
        this.subscribeToTouchEvents();
      });
    }
  }

  private _onBackToGameClicked(): void {
    if (this._popupAnimationAction && !this._popupAnimationAction.isDone) {
      this._popupAnimationAction.end();
      this._delayActivator.action = new SequenceAction([
        new EmptyAction().withDuration(1.0),
        new FunctionAction(() => {
          this._delayActivator.stop();
          this.controller.onAnimCompleted();
        }),
      ]);
      this._delayActivator.start();
    } else {
      this.controller.onAnimCompleted();
    }
  }

  protected subscribeToSceneAnimationEvents() {
    this.view.stateMachine!.findById('anim')?.enterAction.done.listen(() => {
      this.controller.onAnimCompleted();
    });
  }

  private subscribeToTouchEvents() {
    this.view.touchable = true;
    this.view.touchArea = new Rect(new Vector2(-1000.0, -1000.0), new Vector2(1000.0, 1000.0));

    this.view.eventReceived.listen((e) => {
      if (e instanceof AbstractMouseEvent) {
        e.accept();
        if (e instanceof MouseDownEvent) {
          this.controller.onAnimCompleted();
        }
      }
    });
  }

  public postEvent(name: string) {
    this.view.stateMachine!.switchToState(name);
  }

  public setTotalWin(totalWin: number) {
    const texts = this.view.findAllById<TextSceneObject>('total_win_text');
    texts.forEach((e) => (e.text = NumberFormatter.formatMoney(totalWin)));
  }

  public getAnimationAction(totalWin: number): Action {
    const incrementWinAction = new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
    incrementWinAction
      .withDuration(this._incrementDuration)
      .withValues(0, totalWin)
      .valueChange.listen((win: number | undefined) => {
        this.setTotalWin(win as number);
      });

    const textAnimNode = this.view.findById('text');

    this._popupAnimationAction = new ParallelSimpleAction([
      new FunctionAction(() => {
        if (textAnimNode && textAnimNode.stateMachine) {
          textAnimNode.stateMachine.switchToState('default');
          textAnimNode.stateMachine.switchToState('textanim');
        }
      }),
      incrementWinAction,
      new SequenceSimpleAction([
        new EmptyAction().withDuration(this._textAnimDuration),
        new FunctionAction(() => {
          if (textAnimNode && textAnimNode.stateMachine) {
            textAnimNode.stateMachine.switchToState('endanim');
          }
        }),
      ]),
    ]);
    return this._popupAnimationAction;
  }
}
