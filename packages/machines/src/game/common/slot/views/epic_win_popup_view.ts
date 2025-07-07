import { NumberFormatter } from '@cgs/common';
import {
  SceneObject,
  Action,
  CheckBox,
  Button,
  Container,
  Rect,
  Vector2,
  AbstractMouseEvent,
  MouseDownEvent,
  TextSceneObject,
  ParallelSimpleAction,
  FunctionAction,
  EmptyAction,
  SequenceSimpleAction,
  InterpolateCopyAction,
  lerp,
  easeOutCubicInterpolate,
  SoundSceneObject,
} from '@cgs/syd';
import { SlotSession } from '../../slot_session';
import { EpicWinConfiguration } from '../../../components/epic_win/epic_win_configuration';
import { EpicWinStep } from '../../../components/epic_win/epic_win_step';
import { ISlotSessionProvider } from '../../../components/interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider, T_ResourcesComponent } from '../../../../type_definitions';
import { EpicWinPopupController } from '../controllers/epic_win_popup_controller';
import { BaseSlotPopupView, SlotPopups } from './base_popup_view';
import { ResourcesComponent } from '../../../components/resources_component';

export class EpicWinPopupView extends BaseSlotPopupView<EpicWinPopupController> {
  protected _popupNode: SceneObject;
  protected _configuration: EpicWinConfiguration;
  private _textNodes: SceneObject[];
  private _shareChb: CheckBox;
  private _closeBtn: Button;
  protected _winActionsOneByOne: Action[];
  protected _allwinAction: Action;
  protected _currentStep: number;
  protected _slotSession: SlotSession;
  protected _cashLoopSoundScene: SoundSceneObject | null;

  protected _textScenes: TextSceneObject[];

  get isShareChecked(): boolean {
    return this._shareChb.checked;
  }

  constructor(
    container: Container,
    root: SceneObject,
    popup: SceneObject,
    soundNode: SceneObject | null,
    configuration: EpicWinConfiguration
  ) {
    super(root, popup, soundNode, SlotPopups.EpicWin);

    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._popupNode = this.view.findById<SceneObject>('popup')!;
    this._popupNode.touchable = false;
    this._closeBtn = this.view.findById<Button>('closeBtn')!;
    this._closeBtn.touchable = false;
    this._shareChb = this.view.findById<CheckBox>('ShareChb')!;
    this._winActionsOneByOne = new Array<Action>();
    this._currentStep = 0;
    //TODO: remove hard-code (config haven't got size!)
    this._popupNode.touchArea = new Rect(
      new Vector2(-1000.0, -1000.0),
      new Vector2(10000.0, 10000.0)
    );
    if (!this._closeBtn) {
      this._popupNode.eventReceived.listen((e) => {
        if (e instanceof AbstractMouseEvent) {
          e.accept();
          if (e instanceof MouseDownEvent) {
            this.hide();
          }
        }
      });
    } else {
      this._closeBtn.clicked.listen(() => {
        this.hide();
      });
    }

    this._soundNode = soundNode;
    this._configuration = configuration;
    this._textNodes = this._popupNode.findAllById('text');

    this._textScenes = this.view.findAllById<TextSceneObject>('result');
    this._textScenes.forEach((textScene) => {
      textScene.pivot = new Vector2(textScene.size.x * 0.5, textScene.size.y * 0.5);
      textScene.position = textScene.position.add(textScene.pivot);
      textScene.text = '0';
    });

    const resourceComponent: ResourcesComponent =
      container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    this._cashLoopSoundScene = resourceComponent.sounds.findById('big_win_cash_loop');
  }

  public hide(): void {
    if (this._winActionsOneByOne.length > this._currentStep) {
      this._allwinAction.end();

      this._winActionsOneByOne.length = 0;
    } else {
      this._winActionsOneByOne.length = 0;
      if (this._popupNode.stateMachine) {
        this._popupNode.stateMachine.switchToState('empty');
      }
      this._textScenes.forEach((e) => (e.text = '0'));
      super.hide();
    }
  }

  public showShareChbx(): void {
    this._shareChb.stateMachine!.switchToState('up');
  }

  public hideShareChbx(): void {
    this._shareChb.stateMachine!.switchToState('hide');
  }

  public resetShare(): void {
    this._shareChb.checked = false;
  }

  public setWinAmount(winAmount: number): void {
    this._textScenes.forEach((e) => (e.text = NumberFormatter.formatMoney(winAmount)));
  }

  public showWinAction(winName: string, totalWin: number): Action {
    this._popupNode.touchable = false;
    this._closeBtn.touchable = false;

    const epicWinStep = this._configuration.steps.find((s) => s.winName == winName)!;

    const animationActions = new Array<Action>();
    this._currentStep = 0;
    this.addActions(epicWinStep, winName, animationActions, totalWin);

    animationActions.push(
      new ParallelSimpleAction([
        new FunctionAction(() => this.endTextAnimation()),
        new EmptyAction().withDuration(
          this._configuration.finishTextAnimationDelay + this._configuration.showCounterDelay
        ),
      ])
    );
    animationActions.push(
      new ParallelSimpleAction([
        new FunctionAction(() => this.hideWin(winName)),
        new EmptyAction().withDuration(this._configuration.closePopupDelay),
      ])
    );
    animationActions.push(new FunctionAction(() => new Promise(() => this.hide())));

    const sequence = new SequenceSimpleAction(animationActions);

    return new ParallelSimpleAction([
      new SequenceSimpleAction([
        new EmptyAction().withDuration(2.0),
        new FunctionAction(() => {
          this._popupNode.touchable = true;
          this._closeBtn.touchable = true;
        }),
      ]),
      sequence,
      new SequenceSimpleAction([
        new EmptyAction().withDuration(this._configuration.showCounterDelay),
        new FunctionAction(() => this._soundNode?.stateMachine!.switchToState('coins')),
        new FunctionAction(() => this._soundNode?.stateMachine!.switchToState('coins')),
        new FunctionAction(() => this._soundNode?.stateMachine!.switchToState('empty')),
      ]),
    ]);
  }

  protected addActions(
    step: EpicWinStep,
    winName: string,
    actions: Action[],
    totalWin: number
  ): void {
    if (step.priority == 1) {
      actions.push(new FunctionAction(() => this.startTextAnimation()));
    }
    const stepCount = winName == 'epicwin' ? 2 : winName == 'megawin' ? 1 : 0;
    if (step.priority <= this._configuration.steps.find((s) => s.winName == winName)!.priority) {
      const incrementFirstWinAction = this.interpolateTextAction(
        0.000001,
        Math.min(
          totalWin,
          this._slotSession.totalBet * this._configuration.steps[0].finishesWithTotalBetCount
        )
      );
      this._winActionsOneByOne.push(
        new ParallelSimpleAction([
          incrementFirstWinAction,
          new SequenceSimpleAction([
            new FunctionAction(() => {
              this._popupNode.stateMachine!.switchToState('step_0');
            }),
            new EmptyAction().withDuration(this._configuration.steps[0].animationDuration + 0.2),
            new FunctionAction(() => {
              this._currentStep++;
            }),
          ]),
        ])
      );
      for (let i = 0; i < stepCount; i++) {
        const incrementWinAction = this.interpolateTextAction(
          this._slotSession.totalBet * this._configuration.steps[i + 1].startFromTotalBetCount,
          Math.min(
            totalWin,
            this._slotSession.totalBet * this._configuration.steps[i + 1].finishesWithTotalBetCount
          )
        );

        this._winActionsOneByOne.push(
          new ParallelSimpleAction([
            new FunctionAction(() => {
              this._popupNode.stateMachine!.switchToState('next');
            }),
            incrementWinAction,
            new SequenceSimpleAction([
              new EmptyAction().withDuration(
                this._configuration.steps[i + 1].animationDuration + 0.2
              ),
              new FunctionAction(() => {
                this._currentStep++;
              }),
            ]),
          ])
        );
      }
      this._allwinAction = new SequenceSimpleAction(this._winActionsOneByOne);
      actions.push(this._allwinAction);
      actions.push(
        new ParallelSimpleAction([
          new FunctionAction(() => {
            if (this._currentStep - 1 == 0) this._popupNode.stateMachine!.switchToState('static');
            else
              this._popupNode.stateMachine!.switchToState(
                'step_' + (this._currentStep - 1).toString() + '_static'
              );
          }),
        ])
      );
      actions.push(new EmptyAction().withDuration(1.5));
      actions.push(
        new ParallelSimpleAction([
          new FunctionAction(() => {
            this._popupNode.stateMachine!.switchToState('hide');
          }),
        ])
      );
    }
  }

  private switchWinType(winName: string): void {
    this._soundNode?.stateMachine!.switchToState(winName);
    this._popupNode.stateMachine!.switchToState(winName + '_show');
  }

  private hideWin(winName: string): void {
    this._popupNode.stateMachine!.switchToState(winName + '_hide');
  }

  protected startTextAnimation(): void {
    for (const textNode of this._textNodes) {
      textNode.stateMachine!.switchToState('textanim');
    }
  }

  private endTextAnimation(): void {
    for (const textNode of this._textNodes) {
      textNode.stateMachine!.switchToState('endanim');
    }
  }

  protected interpolateTextAction(startValue: number, totalWin: number): Action {
    const start0 = startValue;
    const start1 = 0.1 * (totalWin - startValue) + startValue;
    const start2 = 0.85 * (totalWin - startValue) + startValue;

    // Функция для корректировки значения, избегающая цифру 1 в последних двух разрядах
    const adjustValue = (value: number): number => {
      const rounded = Math.round(value);
      const remaining = totalWin - rounded;

      // Применяем корректировку только если до конца осталось больше 110
      if (remaining <= 110) {
        return rounded;
      }

      const lastTwoDigits = rounded % 100;
      const tensDigit = Math.floor(lastTwoDigits / 10);
      const unitsDigit = lastTwoDigits % 10;

      // Если в разряде десятков стоит 1, увеличиваем на 1
      if (tensDigit === 1) {
        return rounded + 10;
      }

      // Если в разряде единиц стоит 1, увеличиваем на 1
      if (unitsDigit === 1) {
        return rounded + 1;
      }

      return rounded;
    };

    const firstAction = new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
    firstAction.withDuration(1.0).withValues(start0, start1);
    firstAction.valueChange.listen((win) => {
      const adjustedWin = adjustValue(win);
      this.setWinAmount(adjustedWin);
    });

    firstAction.beginning.listen(() => {
      this._cashLoopSoundScene?.stateMachine?.switchToState('stop');
      this._cashLoopSoundScene?.stateMachine?.switchToState('play');
    });

    const secondAction = new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
    secondAction.withDuration(2.0).withValues(start1, start2);
    secondAction.valueChange.listen((win) => {
      const adjustedWin = adjustValue(win);
      this.setWinAmount(adjustedWin);
    });

    const thirdAction = new InterpolateCopyAction<number>().withInterpolateFunction(
      easeOutCubicInterpolate
    );
    thirdAction.withDuration(2.0).withValues(start2, totalWin);
    thirdAction.valueChange.listen((win) => {
      const adjustedWin = adjustValue(win);
      this.setWinAmount(adjustedWin);
    });

    thirdAction.done.listen(() => {
      this._cashLoopSoundScene?.stateMachine?.switchToState('stop');
    });

    return new SequenceSimpleAction([firstAction, secondAction, thirdAction]);
  }
}
