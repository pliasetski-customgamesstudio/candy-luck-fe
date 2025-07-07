import { Line, ReelWinPosition } from '@cgs/common';
import { BuildAction, Logger } from '@cgs/shared';
import {
  Action,
  Container,
  EmptyAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
} from '@cgs/syd';
import { ILogoAnimationProvider } from '../../i_logo_animation_provider';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { T_ILogoAnimationProvider } from '../../../../type_definitions';
import { AllWinLinesAction } from './all_win_lines_action';
import { IExpandedWinlineOptions, IWinLinesAction } from './i_win_lines_action';
import { WinlineLineDrawer } from './winline_line_drawer';

export class ExpandedShortWinlinesActions extends BuildAction implements IWinLinesAction {
  protected readonly _options: IExpandedWinlineOptions;

  constructor(options: IExpandedWinlineOptions) {
    super();

    this._options = options;
    Logger.Debug('load ' + this.constructor.name);
  }

  //-------- PUBLIC -------
  public get winLines(): Line[] {
    return this._options.winlines;
  }

  public buildAction(): Action {
    if (this.winLines.length === 0 && this.winPositions.length === 0)
      return new EmptyAction().withDuration(this.spinConfig.noWinDelay);

    const delayAction = new EmptyAction().withDuration(0.2);

    return new SequenceAction([
      new ParallelAction([
        new AllWinLinesAction(this.container, this.winLines),
        this.getLogoAnimationProviderAction(),
        this.getLinesAnimation(this.winLines),
      ]),
      this.getHideLinesAnimation(),
      delayAction,
    ]);
  }

  //------ PROTECTED ------
  protected get container(): Container {
    return this._options.container;
  }

  protected get winPositions(): ReelWinPosition[] {
    return this._options.winPositions;
  }

  protected get spinConfig(): SpinConfig {
    return this._options.spinConfig;
  }

  protected get lineDrawer(): WinlineLineDrawer | null {
    return this._options.lineDrawer;
  }

  protected getLogoAnimationProviderAction(): IntervalAction {
    const logoAnimationProvider = this.container.resolve<ILogoAnimationProvider>(
      T_ILogoAnimationProvider,
      { optional: true }
    );

    return logoAnimationProvider
      ? logoAnimationProvider.getShortWinLineAction()
      : new EmptyAction();
  }

  protected getLinesAnimation(winLines: Line[]): IntervalAction {
    return this.lineDrawer
      ? this.lineDrawer.drawWinlinesAction(winLines.map((x) => x.lineIndex))
      : new EmptyAction();
  }

  protected getLineAnimation(winLine: Line): IntervalAction {
    return this.lineDrawer
      ? this.lineDrawer.drawWinlineAction(winLine.lineIndex)
      : new EmptyAction();
  }

  protected getHideLinesAnimation(): IntervalAction {
    return this.lineDrawer ? this.lineDrawer.hideWinlinesAction() : new EmptyAction();
  }

  protected getHideLineAnimation(): IntervalAction {
    return this.lineDrawer ? this.lineDrawer.hideWinlinesAction() : new EmptyAction();
  }
}
