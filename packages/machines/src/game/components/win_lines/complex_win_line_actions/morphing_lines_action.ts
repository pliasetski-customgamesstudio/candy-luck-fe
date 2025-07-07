import { ShortWinLinesAction } from './short_win_lines_action';
import { IconsSoundModel } from '../../../../reels_engine/icons_sound_model';
import {
  Color4,
  Container,
  EmptyAction,
  FunctionAction,
  InterpolateCopyAction,
  IntervalAction,
  ParallelAction,
  PolylineData,
  PolylineDataItem,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { LinesSceneObject, SlotPolyLine } from '../../../../reels_engine/lines_scene_object';
import { LineModel, RegularLineIndex } from '../../../../reels_engine/line_model';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { Line, ReelWinPosition } from '@cgs/common';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { WinLineAction } from '../win_line_action';
import { WinLineActionProvider } from '../win_line_action_provider';

export class MorphingWinLineAction extends ShortWinLinesAction {
  private readonly _iconsSoundModel: IconsSoundModel;
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
    useSound: boolean
  ) {
    super(container, winLines, winPositions, lineNode, lineModel, spinConfig, reelsSoundModel);
    this._iconsSoundModel = iconSoundModel;
    this._useSound = useSound;
  }

  buildAction(): IntervalAction {
    if (!this.winLines.length && !this.winPositions.length) {
      return new EmptyAction();
    }
    const actions: IntervalAction[] = [];
    for (let i = 0; i < this.winLines.length; i++) {
      const isLineBeforePosition = i === this.winLines.length - 1 && this.winPositions.length !== 0;
      actions.push(this.processWinLine(this.winLines[i], !isLineBeforePosition));
    }
    actions.push(...this.winPositions.map(this.processWinPosition));
    return new SequenceAction(actions);
  }

  processWinPosition(winPosition: ReelWinPosition): IntervalAction {
    const line = new Line();
    line.iconsIndexes = winPosition.positions;

    return new SequenceAction([
      new FunctionAction(() => this.lineNode.clear()),
      new WinLineAction(this.container, line, this._useSound),
    ]);
  }

  processWinLine(line: Line, morphLine: boolean): IntervalAction {
    const lineAction = new WinLineAction(this.container, line, this._useSound);

    const res: IntervalAction[] = [];
    res.push(
      new FunctionAction(() =>
        WinLineActionProvider.processMultiplier(this.container, line.multiplier!)
      )
    );
    res.push(new FunctionAction(() => this.lineNode.clear()));
    res.push(new FunctionAction(() => this.lineNode.add(this.makeColoringLines(line))));
    res.push(lineAction);
    if (morphLine) {
      res.push(this.changeLineAction(line));
      res.push(new FunctionAction(() => this.lineNode.clear()));
    } else {
      res.push(new EmptyAction().withDuration(this.spinConfig.blinkDuration));
    }

    return new SequenceAction(res);
  }

  makeColoringLines(line: Line): SlotPolyLine {
    const data = this.lineModel.getLineData(new RegularLineIndex(line.lineIndex))!.clone();
    const width = this.lineModel.getLine(new RegularLineIndex(line.lineIndex))!.width;
    return new SlotPolyLine(data, width, line.lineIndex);
  }

  changeLineAction(line: Line): IntervalAction {
    let lineIndex = this.winLines.indexOf(line);
    lineIndex++;
    if (lineIndex === this.winLines.length) {
      if (this.winLines.length > 1) {
        lineIndex = 0;
      } else {
        return new EmptyAction().withDuration(this.spinConfig.blinkDuration);
      }
    }

    const nextLine = this.winLines[lineIndex];

    const interpolateLineDataActions = this.InterpolateLineDataAction(line, nextLine);

    return new ParallelAction(interpolateLineDataActions);
  }

  AddToItemsCollection(data: PolylineData, dataItem: PolylineDataItem): void {
    let i = 0;
    for (; i < data.length; i++) {
      if (data.get(i).point.x >= dataItem.point.x) {
        break;
      }
    }

    if (i < data.length) {
      let y = data.get(i).point.y;
      if (data.get(i).point.x !== dataItem.point.x) {
        if (i > 0) {
          const x1 = data.get(i - 1).point.x;
          const x2 = data.get(i).point.x;
          const expectedX = dataItem.point.x;

          const a = (x2 - x1) / (expectedX - x1);

          const y1 = data.get(i - 1).point.y;
          const y2 = data.get(i).point.y;

          y = (y2 - y1 + y1 * a) / a;
        }
      }

      data.insert(i, new PolylineDataItem(new Vector2(dataItem.point.x, y), data.get(i).color));
    } else {
      i--;

      data.insert(
        i,
        new PolylineDataItem(new Vector2(dataItem.point.x, dataItem.point.y), data.get(i).color)
      );
    }
  }

  InterpolateLineDataAction(line: Line, nextLine: Line): IntervalAction[] {
    const currentLineData = this.lineModel
      .getLineData(new RegularLineIndex(line.lineIndex))!
      .clone();
    const nexLineData = this.lineModel
      .getLineData(new RegularLineIndex(nextLine.lineIndex))!
      .clone();

    const currentItems: PolylineDataItem[] = [];
    for (let i = 0; i < currentLineData.length; i++) {
      currentItems.push(currentLineData.get(i));
    }

    if (currentLineData.length !== nexLineData.length) {
      const unionItems: PolylineDataItem[] = [];

      for (let i = 0; i < currentLineData.length; i++) {
        unionItems.push(currentLineData.get(i));
      }

      for (let i = 0; i < nexLineData.length; i++) {
        unionItems.push(nexLineData.get(i));
      }

      unionItems.sort((a, b) => a.point.x - b.point.x);

      for (const dataItem of unionItems) {
        if (currentItems.includes(dataItem)) {
          this.AddToItemsCollection(nexLineData, dataItem);
        } else {
          this.AddToItemsCollection(currentLineData, dataItem);
        }
      }
    }

    const interpolatePoinsActions: IntervalAction[] = [];

    // TODO: NEED investigate it after release. Why morphing works different in .NET
    const animationDuration = 0.5;

    for (let i = 0; i < currentLineData.length; i++) {
      const currentItem = currentLineData.get(i);
      const nextItem = nexLineData.get(i);

      const index = i;

      const action = new InterpolateCopyAction<Vector2>()
        .withInterpolateFunction(Vector2.lerp)
        .withDuration(animationDuration)
        .withValues(currentItem.point, nextItem.point);
      action.valueChange.listen((v) => {
        this.changeDataPosition(v, currentLineData, index, line.lineIndex);
      });

      const changeColorAction = new InterpolateCopyAction<Color4>()
        .withDuration(animationDuration)
        .withValues(currentItem.color, nextItem.color)
        .withInterpolateFunction(Color4.Lerp);

      changeColorAction.valueChange.listen((v) => {
        currentLineData.get(index).color = v;
      });

      // TODO: NEED investigate it after release. Why morphing works different in .NET
      interpolatePoinsActions.push(new SequenceAction([action]));
      interpolatePoinsActions.push(new SequenceAction([changeColorAction]));
    }

    return interpolatePoinsActions;
  }

  changeDataPosition(
    d: Vector2,
    currentLineData: PolylineData,
    currentIndex: number,
    lineIndex: number
  ): void {
    currentLineData.get(currentIndex).point = d;

    const l = this.lineNode.GetByIndex(lineIndex);
    if (l) {
      l.data = currentLineData;
    }
  }
}
