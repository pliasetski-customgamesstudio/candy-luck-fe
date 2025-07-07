import { ShortFlyingFeatureWinLineAction } from './short_flying_feature_win_line_action';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  RepeatAction,
  SequenceAction,
} from '@cgs/syd';
import { LinesSceneObject } from '../../../../reels_engine/lines_scene_object';
import { LineModel } from '../../../../reels_engine/line_model';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { Line, ReelWinPosition, SceneCommon } from '@cgs/common';
import { IconsSoundModel } from '../../../../reels_engine/icons_sound_model';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { WinLineActionProvider } from '../win_line_action_provider';
import { LazyAction } from '@cgs/shared';
import { WinLineAction } from '../win_line_action';

export enum FlyingFeatureWinLineDirection {
  LeftToRight = 'LeftToRight',
  RightToLeft = 'RightToLeft',
  BothSides = 'BothSides',
}

export class FlyingFeatureWinLineAction extends ShortFlyingFeatureWinLineAction {
  private readonly _useSound: boolean;

  constructor(
    container: Container,
    lineNode: LinesSceneObject,
    lineModel: LineModel,
    spinConfig: SpinConfig,
    winLines: Line[],
    winPositions: ReelWinPosition[],
    iconSoundModel: IconsSoundModel,
    reelsSoundModel: ReelsSoundModel,
    sceneCommon: SceneCommon,
    featureSceneName: string,
    flyDuration: number,
    direction: string,
    useSound: boolean
  ) {
    super(
      container,
      lineNode,
      lineModel,
      spinConfig,
      winLines,
      winPositions,
      iconSoundModel,
      reelsSoundModel,
      sceneCommon,
      featureSceneName,
      flyDuration,
      direction
    );
    this._useSound = useSound;
  }

  buildAction(): IntervalAction {
    if (this.winLines.length > 0 || this.winPositions.length > 0) {
      const actions: IntervalAction[] = [];
      this.winLines.forEach((line) => actions.push(this.ProcessWinLine(line)));

      actions.push(...this.winPositions.map(this.processWinPositions));
      return new RepeatAction(new SequenceAction(actions));
    }

    return new EmptyAction();
  }

  ProcessWinLine(line: Line): IntervalAction {
    return new SequenceAction([
      new FunctionAction(() =>
        // TODO: multiplier может быть равен null?
        WinLineActionProvider.processMultiplier(this.container, line.multiplier!)
      ),
      new ParallelAction([
        new LazyAction(() => this.getMovingSceneLineAction(line)),
        new WinLineAction(this.container, line, this._useSound),
      ]),
    ]);
  }
}
