import { NumberFormatter } from '@cgs/common';
import {
  SceneObject,
  BitmapTextSceneObject,
  ActionActivator,
  TextSceneObject,
  InterpolateCopyAction,
  lerp,
  Log,
  SequenceSimpleAction,
  FunctionAction,
} from '@cgs/syd';
import { BaseSlotView } from '../../base_slot_view';
import { WinTextController } from '../controllers/win_text_controller';

export class WinTextView extends BaseSlotView<WinTextController> {
  private _totalWin: TextSceneObject[];
  private _totalWinStates: SceneObject;
  private _linesCount: BitmapTextSceneObject;
  private _waysCount: BitmapTextSceneObject;
  private _addWinText: BitmapTextSceneObject;
  private _totalFeatureText: BitmapTextSceneObject;
  private _activators: ActionActivator[];

  private _totalWinState: string;
  private _previousWin: number;
  private _previousCurrentWin: number;

  constructor(parent: SceneObject) {
    super(parent);
    this._totalWin = parent.parent!.findAllById<TextSceneObject>('WinText');
    this._totalWinStates = parent.parent!.findById('TotalWinStates')!;
    this._linesCount = parent.parent!.findById<BitmapTextSceneObject>('LinesCountText')!;
    this._waysCount = parent.parent!.findById<BitmapTextSceneObject>('WaysCountText')!;
    this._addWinText = parent.parent!.findById<BitmapTextSceneObject>('AddWinText')!;
    this._totalFeatureText = parent.parent!.findById<BitmapTextSceneObject>('TotalFeatureText')!;
    this._previousCurrentWin = 0;
    this._previousWin = 0;
  }

  public SetTotalWin(totalWin: number): void {
    if (this._totalWinStates) {
      if (totalWin == 0) {
        for (let i = 0; i < this._totalWin.length; i++) {
          this._totalWin[i].text = '';
        }
        this._totalWinStates.stateMachine!.switchToState(this._totalWinState);
      } else {
        this._totalWinStates.stateMachine!.switchToState('total_win');

        const incrementWinAction = new InterpolateCopyAction<number>()
          .withInterpolateFunction(lerp)
          .withDuration(0.6)
          .withValues(this._previousWin, totalWin);

        incrementWinAction.valueChange.listen((value: number) => {
          for (let i = 0; i < this._totalWin.length; i++) {
            this._totalWin[i].text = NumberFormatter.formatMoney(value);
          }
        });

        incrementWinAction.done.listen(() =>
          Log.Trace('Win text update finished: ' + totalWin.toString())
        );

        let activator: ActionActivator | null = null;
        activator = ActionActivator.withAction(
          this.root,
          new SequenceSimpleAction([
            incrementWinAction,
            new FunctionAction(() => {
              if (activator) {
                activator.end();
                const index = this._activators.indexOf(activator);
                if (index !== -1) {
                  this._activators.splice(index, 1);
                }
                activator = null;
              }
            }),
          ])
        );
        activator.start();

        this._activators.push(activator);
      }
    } else {
      for (let i = 0; i < this._totalWin.length; i++) {
        this._totalWin[i].text = NumberFormatter.formatMoney(totalWin);
      }
    }
    this._previousCurrentWin = 0;
    this._previousWin = totalWin;
  }

  public ResetWinState(): void {
    this._previousCurrentWin = 0;
  }

  public StopActionsOnAccelerate(): void {
    if (this._activators && this._activators.length > 0) {
      for (const act of this._activators) {
        act.end();
      }
      this._activators.length = 0;
    }
  }

  public AddCurrentWin(totalWin: number, currentWin: number): void {
    if (this._totalWinStates) {
      if (currentWin == 0) {
        for (let i = 0; i < this._totalWin.length; i++) {
          this._addWinText.text = '';
        }
        this._totalWinStates.stateMachine!.switchToState('total_win_fs');
      } else {
        this._totalWinStates.stateMachine!.switchToState('add_win');

        const incrementWinAction = new InterpolateCopyAction<number>()
          .withInterpolateFunction(lerp)
          .withDuration(0.6)
          .withValues(this._previousCurrentWin, currentWin);
        incrementWinAction.valueChange.listen((value: number) => {
          for (let i = 0; i < this._totalWin.length; i++) {
            this._addWinText.text = NumberFormatter.formatMoney(value);
          }
        });
        let activator: ActionActivator | null = null;
        activator = ActionActivator.withAction(
          this.root,
          new SequenceSimpleAction([
            incrementWinAction,
            new FunctionAction(() => {
              if (activator) {
                activator.end();
                const index = this._activators.indexOf(activator);
                if (index !== -1) {
                  this._activators.splice(index, 1);
                }
                activator = null;
              }
            }),
          ])
        );
        activator.start();

        this._activators.push(activator);
      }
    } else {
      for (let i = 0; i < this._totalWin.length; i++) {
        (this._totalWin[i] as TextSceneObject).text = NumberFormatter.formatMoney(totalWin);
      }
    }
    this._previousCurrentWin = currentWin;
  }

  public AddTotalWin(totalWin: number, currentWin: number): void {
    if (this._totalWinStates) {
      if (currentWin == 0) {
        for (let i = 0; i < this._totalWin.length; i++) {
          this._addWinText.text = '';
        }
        this._totalWinStates.stateMachine!.switchToState('total_win_fs');
      } else {
        this._totalWinStates.stateMachine!.switchToState('add_win');
        this._addWinText.text = NumberFormatter.formatMoney(currentWin);

        const incrementWinAction = new InterpolateCopyAction<number>()
          .withInterpolateFunction(lerp)
          .withDuration(0.6)
          .withValues(this._previousWin, totalWin);
        incrementWinAction.valueChange.listen((value: number) => {
          for (let i = 0; i < this._totalWin.length; i++) {
            (this._totalWin[i] as TextSceneObject).text = NumberFormatter.formatMoney(value);
          }
        });
        let activator: ActionActivator | null = null;
        activator = ActionActivator.withAction(
          this.root,
          new SequenceSimpleAction([
            incrementWinAction,
            new FunctionAction(() => {
              if (activator) {
                activator.end();
                const index = this._activators.indexOf(activator);
                if (index !== -1) {
                  this._activators.splice(index, 1);
                }
                activator = null;
              }
            }),
          ])
        );
        activator.start();

        this._activators.push(activator);
      }
    } else {
      for (let i = 0; i < this._totalWin.length; i++) {
        (this._totalWin[i] as TextSceneObject).text = NumberFormatter.formatMoney(totalWin);
      }
    }
    this._previousCurrentWin = currentWin;
    this._previousWin = totalWin;
  }

  public setLinesWays(count: number, totalWinState: string): void {
    this._totalWinState = totalWinState;
    if (this._totalWinStates) {
      this._linesCount.text = count.toString();
      this._waysCount.text = count.toString();
      this._totalWinStates.stateMachine!.switchToState(this._totalWinState);
    }
  }

  public SetLinesWaysWithoutState(count: number): void {
    this._linesCount.text = count.toString();
    this._waysCount.text = count.toString();
  }

  public SetFeatureText(feateureText: string, featureWinState: string = 'feature'): void {
    this._totalWinState = featureWinState;
    if (this._totalFeatureText) {
      this._totalFeatureText.text = feateureText;
      this._totalWinStates.stateMachine!.switchToState(featureWinState ?? 'feature');
    }
  }
}
