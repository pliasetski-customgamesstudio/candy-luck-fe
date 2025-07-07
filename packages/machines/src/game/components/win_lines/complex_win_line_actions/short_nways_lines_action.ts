import {
  Container,
  EmptyAction,
  IntervalAction,
  ParallelAction,
  SceneObject,
  SequenceAction,
} from '@cgs/syd';
import { BuildAction } from '@cgs/shared';
import { IWinLinesAction } from './i_win_lines_action';
import { Line, ReelWinPosition } from '@cgs/common';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { ILogoAnimationProvider } from '../../i_logo_animation_provider';
import { SlotSession } from '../../../common/slot_session';
import { T_ILogoAnimationProvider, T_ISlotSessionProvider } from '../../../../type_definitions';
import { ISlotSessionProvider } from '../../interfaces/i_slot_session_provider';
import { AllWinLinesAction } from './all_win_lines_action';

export class ShortNWaysLinesAction extends BuildAction implements IWinLinesAction {
  protected _winPositions: ReelWinPosition[];
  protected _action: IntervalAction;
  protected _container: Container;
  private readonly _fadeSceneObject: SceneObject;
  private readonly _winLines: Line[] = [];
  private readonly _spinConfig: SpinConfig;
  private readonly _animName: string;
  private readonly _logoAnimationProvider: ILogoAnimationProvider | null;
  private readonly _machineId: string;
  private readonly _slotSession: SlotSession;

  constructor(
    container: Container,
    winLines: Line[],
    winPositions: ReelWinPosition[],
    spinConfig: SpinConfig,
    fadeSceneObject: SceneObject,
    animName: string = 'anim'
  ) {
    super();
    this._container = container;
    this._fadeSceneObject = fadeSceneObject;
    this._winLines = winLines;
    this._winPositions = winPositions;
    this._spinConfig = spinConfig;
    this._animName = animName;
    this._logoAnimationProvider =
      this._container.resolve<ILogoAnimationProvider>(T_ILogoAnimationProvider);
    this._machineId =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession.GameId;
    this._slotSession =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._action = this.CreateAction(this._container, this._winLines);
    this.withDuration(this._action.duration);
  }

  get container(): Container {
    return this._container;
  }

  set container(value: Container) {
    this._container = value;
  }

  get winLines(): Line[] {
    return this._winLines;
  }

  get winPositions(): ReelWinPosition[] {
    return this._winPositions;
  }

  get animName(): string {
    return this._animName;
  }

  get slotSession(): SlotSession {
    return this._slotSession;
  }

  buildAction(): IntervalAction {
    return this._action;
  }

  private CreateAction(container: Container, _winLines: Line[]): IntervalAction {
    const sortedWinLines = this.getSortedWinLinesWithWinPositions();
    if (!sortedWinLines || sortedWinLines.length === 0) {
      return new EmptyAction().withDuration(this._spinConfig.noWinDelay);
    }

    const delayAction = new EmptyAction();
    delayAction.withDuration(0.2);
    return new SequenceAction([
      new ParallelAction([
        new AllWinLinesAction(container, sortedWinLines),
        this._logoAnimationProvider
          ? this._logoAnimationProvider.getShortWinLineAction()
          : new EmptyAction(),
      ]),
      delayAction,
    ]);
  }

  public getSortedWinLinesWithWinPositions(): Line[] {
    const winLines = this._winLines.slice();
    for (const winLine of winLines) {
      // TODO: multiplier может быть равен null?
      winLine.winAmount = Math.floor(
        winLine.winAmount * winLine.multiplier! * this._slotSession.currentBet.bet
      );
    }

    if (this._winPositions?.length > 0) {
      for (const winPos of this._winPositions) {
        const newWinLine = new Line();
        newWinLine.iconsIndexes = winPos.positions;
        newWinLine.symbolId = winPos.symbol;
        newWinLine.winAmount = Math.floor(winPos.win);
        winLines.push(newWinLine);
      }
    }
    winLines.sort((a, b) => {
      const win = b.winAmount - a.winAmount;
      if (win === 0) {
        // TODO: symbolId может быть равен null?
        return a.symbolId! - b.symbolId!;
      }
      return win;
    });
    return winLines;
  }
}
