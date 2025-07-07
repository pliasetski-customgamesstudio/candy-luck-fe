import { Line, ReelWinPosition } from '@cgs/common';
import { Container } from '@cgs/syd';
import { WinlineLineDrawer } from './winline_line_drawer';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';

export interface IWinLinesAction {
  winLines: Line[];
}

export interface IExpandedWinlineOptions {
  container: Container;
  lineDrawer: WinlineLineDrawer | null;
  spinConfig: SpinConfig;
  winlines: Line[];
  winPositions: ReelWinPosition[];
}
