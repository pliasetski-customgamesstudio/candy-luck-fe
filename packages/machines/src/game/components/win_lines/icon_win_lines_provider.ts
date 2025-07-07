import { CgsEvent, Container, IComponent, SpriteBatch } from '@cgs/syd';
import { LineModel, RegularLineIndex } from '../../../reels_engine/line_model';
import { LinesSceneObject, SlotPolyLine } from '../../../reels_engine/lines_scene_object';
import { SlotSession } from '../../common/slot_session';
import { GameTimer } from '@cgs/common';
import {
  T_BaseSlotGame,
  T_LineModel,
  T_LinesSceneObject,
  T_SlotSession,
} from '../../../type_definitions';
import { BaseSlotGame } from '../../base_slot_game';

export class IconWinLinesProvider implements IComponent {
  private _container: Container;
  private _lineModel: LineModel;
  private _lineNode: LinesSceneObject;
  private _session: SlotSession;
  private _winLinesConfig: any;

  private _addLineTimer: GameTimer | null;
  private _iconWinLines: number[];
  private _showingLines: number[];
  private _lastShowingLineIndex: number;
  private _showingWinLinesMaxCount: number;

  constructor(container: Container) {
    this._container = container;
    this._lineModel = this._container.forceResolve<LineModel>(T_LineModel);
    this._lineNode = this._container.forceResolve<LinesSceneObject>(T_LinesSceneObject);
    this._session = this._container.forceResolve<SlotSession>(T_SlotSession);
    const slotGame = this._container.forceResolve<BaseSlotGame>(T_BaseSlotGame);
    this._winLinesConfig = slotGame.winLinesConfig;
  }

  public showWinLines(reel: number, line: number): void {
    if (this._winLinesConfig) {
      this._lineNode.clear();
      this._showingLines = [];
      this._iconWinLines = this.winLineIndexes(reel, line);
      this._showingWinLinesMaxCount =
        this._winLinesConfig['maxIconWinLines'] > 0
          ? this._winLinesConfig['maxIconWinLines']
          : this._winLinesConfig['lines'].length;
      this._lastShowingLineIndex = 0;

      this.setAddLineTimer(this._winLinesConfig['speedIconWinLines'] / 1000);
    }
  }

  public showLineByNumber(lineNumber: number): void {
    if (this._winLinesConfig) {
      this._lineNode.clear();
      this._showingLines = [];
      this._iconWinLines = [];
      this._iconWinLines.push(lineNumber - 1);
      this._showingWinLinesMaxCount =
        this._winLinesConfig['maxIconWinLines'] > 0
          ? this._winLinesConfig['maxIconWinLines']
          : this._winLinesConfig['lines'].length;
      this._lastShowingLineIndex = 0;

      this.setAddLineTimer(this._winLinesConfig['speedIconWinLines'] / 1000);
    }
  }

  public showAllLines(): void {
    if (this._winLinesConfig) {
      this._lineNode.clear();
      this._showingLines = [];
      this._iconWinLines = [];
      for (let i = 0; i < this._session.lines; i++) {
        this._iconWinLines.push(i);
      }
      this._showingWinLinesMaxCount =
        this._winLinesConfig['maxPaytableWinLines'] > 0
          ? this._winLinesConfig['maxPaytableWinLines']
          : this._winLinesConfig['lines'].length;
      this._lastShowingLineIndex = 0;

      this.setAddLineTimer(this._winLinesConfig['speedPaytableWinLines'] / 1000);
    }
  }

  private addNewLine(): void {
    if (this._addLineTimer) {
      if (
        this._showingLines.length === this._showingWinLinesMaxCount &&
        this._showingLines.length < this._iconWinLines.length
      ) {
        const hideWinLine = this._showingLines[0];
        const hideColoringLine = this._lineNode.GetByIndex(hideWinLine);
        this._lineNode.remove(hideColoringLine!);
      }

      if (this._showingLines.length < this._iconWinLines.length) {
        const winLineIndex = this._iconWinLines[this._lastShowingLineIndex];
        this._showingLines.push(winLineIndex);
        this._lineNode.add(this.makeColoringLines(winLineIndex));
        this._lastShowingLineIndex++;
      }

      if (this._lastShowingLineIndex >= this._iconWinLines.length) {
        this._lastShowingLineIndex = 0;
      }
    }
  }

  public hideWinLines(): void {
    this._addLineTimer = null;
    this._lineNode.clear();
  }

  private makeColoringLines(lineIndex: number): SlotPolyLine {
    const data = this._lineModel.getLineData(new RegularLineIndex(lineIndex))!.clone();
    const width = this._lineModel.getLine(new RegularLineIndex(lineIndex))!.width;
    return new SlotPolyLine(data, width, lineIndex);
  }

  private winLineIndexes(reel: number, line: number): number[] {
    const winLineIndexes: number[] = [];
    for (let i = 0; i < this._session.lines; i++) {
      if (this._winLinesConfig['lines'][i][reel] == line) {
        winLineIndexes.push(i);
      }
    }

    return winLineIndexes;
  }

  private setAddLineTimer(speed: number): void {
    this._addLineTimer = new GameTimer(speed);
    this._addLineTimer.elapsed.listen(() => this.addNewLine());
  }

  public dispatchEvent(_event: CgsEvent): void {}

  public draw(_spriteBatch: SpriteBatch): void {}

  public update(_dt: number): void {}
}
