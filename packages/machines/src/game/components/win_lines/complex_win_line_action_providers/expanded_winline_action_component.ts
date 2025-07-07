import { Line, ReelWinPosition } from '@cgs/common';
import { Container, Platform, SceneObject, SequenceAction, T_Platform } from '@cgs/syd';

import { ResourcesComponent } from '../../resources_component';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { T_ResourcesComponent } from '../../../../type_definitions';
import { ExpandedShortWinlinesActions } from '../complex_win_line_actions/expanded_short_winlines_action';
import { ExpandedWinlinesActions } from '../complex_win_line_actions/expanded_winlines_action';
import { IExpandedWinlineOptions } from '../complex_win_line_actions/i_win_lines_action';
import { SpecialNWaysAction } from '../complex_win_line_actions/special_nways_action';
import { ILineOptions, WinlineLineDrawer } from '../complex_win_line_actions/winline_line_drawer';
import { WinLineActionComponent } from './win_line_action_component';

const PAY_LINES = [
  [1, 1, 1, 1, 1], // [5, 6, 7, 8, 9],
  [0, 0, 0, 0, 0], // [0, 1, 2, 3, 4],
  [2, 2, 2, 2, 2], // [10, 11, 12, 13, 14],
  [0, 1, 2, 1, 0], // [0, 6, 12, 8, 4],
  [2, 1, 0, 1, 2], // [10, 6, 2, 8, 14],
  [1, 0, 0, 0, 1], // [5, 1, 2, 3, 9],
  [1, 2, 2, 2, 1], // [5, 11, 12, 13, 9],
  [0, 0, 1, 2, 2], // [0, 1, 7, 13, 14],
  [2, 2, 1, 0, 0], // [10, 11, 7, 3, 4],
  [1, 0, 1, 2, 1], // [5, 1, 7, 13, 9],
  [1, 2, 1, 0, 1], // [5, 11, 7, 3, 9],
  [0, 1, 1, 1, 0], // [0, 6, 7, 8, 4],
  [2, 1, 1, 1, 2], // [10, 6, 7, 8, 14],
  [0, 1, 0, 1, 0], // [0, 6, 2, 8, 4],
  [2, 1, 2, 1, 2], // [10, 6, 12, 8, 14],
  [1, 1, 0, 1, 1], // [5, 6, 2, 8, 9],
  [1, 1, 2, 1, 1], // [5, 6, 12, 8, 9],
  [0, 0, 2, 0, 0], // [0, 1, 12, 3, 4],
  [2, 2, 0, 2, 2], // [10, 11, 2, 13, 14],
  [0, 2, 2, 2, 0], // [0, 11, 12, 13, 4],
  [2, 0, 0, 0, 2], // [10, 1, 2, 3, 14],
  [1, 0, 2, 0, 1], // [5, 1, 12, 3, 9],
  [1, 2, 0, 2, 1], // [5, 11, 2, 13, 9],
  [0, 2, 0, 2, 0], // [0, 11, 2, 13, 4],
  [2, 0, 2, 0, 2], // [10, 1, 12, 3, 14],
  [0, 2, 1, 0, 2], // [0, 11, 7, 3, 14],
  [2, 0, 1, 2, 0], // [10, 1, 7, 13, 4],
  [1, 0, 2, 1, 2], // [5, 1, 12, 8, 14],
  [0, 2, 1, 2, 0], // [0, 11, 7, 13, 4],
  [2, 1, 0, 0, 1], // [10, 6, 2, 3, 9]
];

export class ExpandedWinLineActionComponent extends WinLineActionComponent {
  private readonly _fadeSceneObject: SceneObject;
  private readonly _lineDrawer: WinlineLineDrawer | null;

  constructor(
    container: Container,
    {
      repeatWinLineSound = true,
      winlineHolderId = undefined,
      lineOptions = undefined,
    }: {
      repeatWinLineSound?: boolean;
      lineOptions?: ILineOptions;
      winlineHolderId?: string;
    } = {}
  ) {
    super(container, repeatWinLineSound);

    const slot = this.container.forceResolve<ResourcesComponent>(T_ResourcesComponent).slot;
    const platform = this.container.forceResolve<Platform>(T_Platform);
    this._fadeSceneObject = slot.findById('fade_static_icons')!;

    if (lineOptions && winlineHolderId) {
      this._lineDrawer = new WinlineLineDrawer(
        lineOptions,
        platform.videoSystem.renderDevice!,
        PAY_LINES
      );
      const holder = container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .slot.findById(winlineHolderId);
      holder?.addChild(this._lineDrawer);
    }
  }

  public Update(
    reelsSoundModel: ReelsSoundModel,
    winLines: Line[],
    viewReels: number[][],
    spinConfig: SpinConfig,
    winPositions: ReelWinPosition[]
  ): void {
    // super.Update(reelsSoundModel, winLines, viewReels, spinConfig, winPositions);

    const lineOption: IExpandedWinlineOptions = {
      container: this.container,
      lineDrawer: this._lineDrawer,
      spinConfig: spinConfig,
      winlines: winLines,
      winPositions: winPositions,
    };

    const shortWinLineAction = new SequenceAction([new ExpandedShortWinlinesActions(lineOption)]);

    const winLineAction = new ExpandedWinlinesActions(lineOption, this.repeatWinLineSound);

    const specialLineAction = new SpecialNWaysAction(
      this.container,
      winLines,
      this._fadeSceneObject,
      spinConfig,
      winPositions
    );

    this.WinLineAction = new SequenceAction([shortWinLineAction, winLineAction]);
    this.ShortWinLineAction = shortWinLineAction;
    this.SpecialLineAction = specialLineAction;

    this.enableFade(winLines, winPositions);
  }
}
