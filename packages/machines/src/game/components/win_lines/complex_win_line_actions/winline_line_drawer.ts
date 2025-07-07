import { LazyAction } from '@cgs/shared';
import {
  EmptyAction,
  FunctionAction,
  ILiveCanvasOptions,
  IntervalAction,
  LineDrawerSceneObject,
  ParallelAction,
  RenderDevice,
  SceneObject,
  Vector2,
} from '@cgs/syd';

export interface ILineOptions {
  lineWidth: number;
  lineColor: string;
  offset: Vector2;
  glowSize?: number; // Optional glow size parameter
  glowIntensity?: number; // Optional glow intensity parameter
}

export class WinlineLineDrawer extends SceneObject {
  private readonly _options: ILineOptions;
  private readonly _renderDevice: RenderDevice;
  private readonly _createdWinlines: Map<number, LineDrawerSceneObject>;
  private readonly _paylines: number[][];

  constructor(options: ILineOptions, renderDevice: RenderDevice, paylines: number[][]) {
    super();

    this._options = options;
    this._renderDevice = renderDevice;

    this._createdWinlines = new Map<number, LineDrawerSceneObject>();
    this._paylines = paylines;
  }

  public drawWinlinesAction(winlines: number[]): IntervalAction {
    if (!winlines.length) {
      return new EmptyAction();
    }

    return new ParallelAction(winlines.map((lineIndex) => this.drawWinlineAction(lineIndex)));
  }

  public drawWinlineAction(lineIndex: number): FunctionAction {
    return new FunctionAction(() => {
      const winline = this._createdWinlines.get(lineIndex);

      if (winline) {
        winline.visible = true;
      } else {
        this._createLineObject(lineIndex);
      }
    });
  }

  public hideWinlinesAction(): IntervalAction {
    return new FunctionAction(() => {
      this._createdWinlines.forEach((lineObject) => {
        lineObject.visible = false;
      });
    });
  }

  private _createLineObject(lineIndex: number) {
    const lineOption: ILiveCanvasOptions = {
      lineColor: this._options.lineColor,
      linePoints: this._calculatePoints(lineIndex),
      lineWidth: this._options.lineWidth,
      glowIntensity: this._options.glowIntensity,
      glowSize: this._options.glowSize,
    };

    const lineObject = new LineDrawerSceneObject(lineOption, this._renderDevice);
    this._createdWinlines.set(lineIndex, lineObject);
    this.addChild(lineObject);
  }

  private _calculatePoints(lineIndex: number): Vector2[] {
    const points: Vector2[] = [];
    const payline = this._paylines[lineIndex] || [];

    const halfX = new Vector2(this._options.offset.x * 0.5, 0);
    points.push(this._getIconPosition(0, payline[0]).subtract(halfX));

    for (let i = 0; i < payline.length; i++) {
      const rowIndex = payline[i];
      points.push(this._getIconPosition(i, rowIndex));
    }

    const lastIndex = payline.length - 1;
    points.push(this._getIconPosition(lastIndex, payline[lastIndex]).add(halfX));

    return points;
  }

  private _getIconPosition(reelIndex: number, rowIndex: number): Vector2 {
    return new Vector2(reelIndex * this._options.offset.x, rowIndex * this._options.offset.y).add(
      this._options.offset.clone().mulNum(0.5)
    );
  }
}
