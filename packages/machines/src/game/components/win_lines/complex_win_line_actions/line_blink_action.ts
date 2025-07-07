import { BuildAction } from '@cgs/shared';
import { IntervalAction, RepeatAction, SequenceAction, InterpolateCopyAction } from '@cgs/syd';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { LinesSceneObject } from '../../../../reels_engine/lines_scene_object';

export class LineBlinkAction extends BuildAction {
  private _lineRenderer: LinesSceneObject;
  private _spinConfig: SpinConfig;
  private _blinkDuration: number;
  private _blinkIterations: number;
  private _action: IntervalAction;

  constructor(
    lineRenderer: LinesSceneObject,
    spinConfig: SpinConfig,
    blinkDuration: number = 0.0,
    blinkIterations: number = -1
  ) {
    super();
    this._lineRenderer = lineRenderer;
    this._spinConfig = spinConfig;
    this._blinkDuration = blinkDuration;
    this._blinkIterations = blinkIterations;
    if (this._blinkIterations === -1) {
      this._blinkIterations = Math.max(this._spinConfig.blinkIterations - 1, 1);
    }
    if (this._blinkDuration === 0.0) {
      this._blinkDuration = this._spinConfig.blinkDuration;
    }
    this._action = this.createAction();
    this.withDuration(this._action.duration);
  }

  buildAction(): IntervalAction {
    return this._action;
  }

  createAction(): IntervalAction {
    const iter = this._blinkIterations;
    return new RepeatAction(
      new SequenceAction([this._fadeAlpha(1.0, 0.0), this._fadeAlpha(0.0, 1.0)]),
      iter
    ).withDuration(this._blinkDuration * 2 * iter);
  }

  private _fadeAlpha(start: number, end: number): IntervalAction {
    const fade = new InterpolateCopyAction<number>();
    fade.withValues(start, end);
    fade.withDuration(this._blinkDuration);
    fade.withInterpolateFunction((v1, v2, amount) => v1 + (v2 - v1) * amount);
    fade.valueChange.listen((alpha) => this._onAlphaChanged(alpha));
    return fade;
  }

  private _onAlphaChanged(alpha: number): void {
    this._lineRenderer.color.a = alpha;
  }
}
