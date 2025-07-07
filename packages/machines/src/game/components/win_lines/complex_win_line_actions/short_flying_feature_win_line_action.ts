import { ShortWinLinesAction } from './short_win_lines_action';
import { Line, ReelWinPosition, SceneCommon } from '@cgs/common';
import { ReelsEngine } from '../../../../reels_engine/reels_engine';
import {
  Container,
  EmptyAction,
  FunctionAction,
  InterpolateInplaceAction,
  IntervalAction,
  ParallelAction,
  PolylineData,
  PolylineDataItem,
  SceneObject,
  SequenceAction,
  Vector2,
} from '@cgs/syd';
import { LinesSceneObject } from '../../../../reels_engine/lines_scene_object';
import { LineModel, RegularLineIndex } from '../../../../reels_engine/line_model';
import { SpinConfig } from '../../../../reels_engine/game_config/game_config';
import { IconsSoundModel } from '../../../../reels_engine/icons_sound_model';
import { ReelsSoundModel } from '../../../../reels_engine/reels_sound_model';
import { ISlotGameEngineProvider } from '../../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ResourcesComponent } from '../../resources_component';
import { T_ISlotGameEngineProvider, T_ResourcesComponent } from '../../../../type_definitions';
import { WinLineAction } from '../win_line_action';
import { FlyingFeatureWinLineDirection } from './flying_feature_win_line_action';
import { ComponentNames } from '../../../../reels_engine/entity_components/component_names';
import { Entity } from '../../../../reels_engine/entities_engine/entity';

export class ShortFlyingFeatureWinLineAction extends ShortWinLinesAction {
  private static readonly defaultTimeLimit: number = 2.0;
  private static readonly defaultMaxLineTimeInterval: number = 0.2;

  private _sceneCommon: SceneCommon;
  private _reelsEngine: ReelsEngine;
  private _animIconsHolder: SceneObject;
  private _featureSceneName: string;
  private _flyDuration: number;
  private _direction: string;
  private _timeLimit: number;
  private _maxLineTimeInterval: number;

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
    direction: string
  ) {
    super(container, winLines, winPositions, lineNode, lineModel, spinConfig, reelsSoundModel);
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._animIconsHolder = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .slot.findById('anim_icons_holder')!;
    this._sceneCommon = sceneCommon;
    this._featureSceneName = featureSceneName;
    this._flyDuration = flyDuration;
    this._direction = direction;
    this._timeLimit = ShortFlyingFeatureWinLineAction.defaultTimeLimit;
    this._maxLineTimeInterval = ShortFlyingFeatureWinLineAction.defaultMaxLineTimeInterval;
  }

  withTimeLimits(timeLimit: number, maxLineTimeInterval: number): this {
    this._timeLimit = timeLimit;
    this._maxLineTimeInterval = maxLineTimeInterval;
    return this;
  }

  buildAction(): IntervalAction {
    if (this.winLines.length > 0 || this.winPositions.length > 0) {
      const actions: IntervalAction[] = [];
      this.winLines.forEach((line) => actions.push(this.ProcessWinLine(line)));

      actions.push(...this.winPositions.map(this.processWinPositions));
      return new SequenceAction([
        new FunctionAction(() => this.addStickyIcons(this.winLines)),
        new ParallelAction(actions),
        new FunctionAction(() => this.removeStickyIcons(this.winLines)),
      ]);
    }

    return new EmptyAction();
  }

  ProcessWinLine(line: Line): IntervalAction {
    const interval =
      this.winLines.length <= this._timeLimit / this._maxLineTimeInterval
        ? this._maxLineTimeInterval
        : this._timeLimit / this.winLines.length;

    return new SequenceAction([
      new EmptyAction().withDuration(this.winLines.indexOf(line) * interval),
      this.getMovingSceneLineAction(line),
    ]);
  }

  getMovingSceneLineAction(line: Line): IntervalAction {
    const lineData = this.lineModel.getLineData(new RegularLineIndex(line.lineIndex))!;
    const lineData1 = lineData.clone();
    const lineData2 = lineData.clone();

    let lineLength = 0;

    for (let i = 0; i < lineData1.length - 1; i++) {
      lineLength += lineData1.get(i + 1).point.distance(lineData1.get(i).point);
    }

    return new ParallelAction([
      this.getLeftToRightAction(lineData1, lineLength),
      this.getRightToLeftAction(lineData2, lineLength),
    ]);
  }

  processWinPositions(winPosition: ReelWinPosition): IntervalAction {
    const line = new Line();
    line.iconsIndexes = winPosition.positions;
    return new WinLineAction(this.container, line, true);
  }

  getLeftToRightAction(lineData: PolylineData, lineLength: number): IntervalAction {
    const featureNode = this.buildFeatureScene();
    if (this._direction === FlyingFeatureWinLineDirection.RightToLeft || !featureNode) {
      return new EmptyAction();
    }

    const interpolatePositionActions: IntervalAction[] = [];

    for (let i = 0; i < lineData.length - 1; i++) {
      const currentItem = lineData.get(i);
      const nextItem = lineData.get(i + 1);
      interpolatePositionActions.push(
        this.buildFlyAction(featureNode, currentItem, nextItem, lineLength)
      );
    }

    return this.wrapFlyActionWithFeatureAnimation(featureNode, interpolatePositionActions);
  }

  getRightToLeftAction(lineData: PolylineData, lineLength: number): IntervalAction {
    const featureNode = this.buildFeatureScene();

    if (this._direction === FlyingFeatureWinLineDirection.LeftToRight || !featureNode) {
      return new EmptyAction();
    }

    const interpolatePositionActions: IntervalAction[] = [];

    for (let i = lineData.length - 1; i > 0; i--) {
      const currentItem = lineData.get(i);
      const nextItem = lineData.get(i - 1);
      interpolatePositionActions.push(
        this.buildFlyAction(featureNode, currentItem, nextItem, lineLength)
      );
    }

    return this.wrapFlyActionWithFeatureAnimation(featureNode, interpolatePositionActions);
  }

  buildFlyAction(
    featureNode: SceneObject,
    currentItem: PolylineDataItem,
    nextItem: PolylineDataItem,
    lineLength: number
  ): IntervalAction {
    const segmentFlyDuration =
      (nextItem.point.distance(currentItem.point) / lineLength) * this._flyDuration;

    const interpolateAction = new InterpolateInplaceAction<Vector2>((v) => v.clone())
      .withInterpolateFunction(Vector2.lerpInplace)
      .withValues(currentItem.point, nextItem.point)
      .withTimeFunction((time, _start, _dx) => time)
      .withDuration(segmentFlyDuration);

    interpolateAction.valueChange.listen((e) => {
      featureNode.position = e;
    });

    return interpolateAction;
  }

  wrapFlyActionWithFeatureAnimation(
    featureNode: SceneObject,
    interpolatePositionActions: IntervalAction[]
  ): IntervalAction {
    return new SequenceAction([
      new FunctionAction(() => {
        this._animIconsHolder.addChild(featureNode);
        featureNode.visible = true;
        featureNode.stateMachine!.switchToState('anim');
      }),
      new SequenceAction(interpolatePositionActions),
      new FunctionAction(() => featureNode.stateMachine!.switchToState('default')),
      new EmptyAction().withDuration(1.3),
      new FunctionAction(() => {
        featureNode.parent?.removeChild(featureNode);
        featureNode.deinitialize();
      }),
    ]);
  }

  buildFeatureScene(): SceneObject | null {
    const scene = this._sceneCommon.sceneFactory.build(this._featureSceneName);
    if (scene) {
      scene.initialize();
      scene.z = 9999;

      if (scene.stateMachine) {
        scene.stateMachine.switchToState('default');
      }

      scene.visible = false;
      scene.active = true;
    }

    return scene;
  }

  addStickyIcons(lines: Line[]): void {
    this.getAllLinesEntities(lines).forEach((e) => e.addComponent(ComponentNames.StickyIcon, true));
  }

  removeStickyIcons(lines: Line[]): void {
    this.getAllLinesEntities(lines).forEach((e) => e.removeComponent(ComponentNames.StickyIcon));
  }

  getAllLinesEntities(lines: Line[]): Entity[] {
    const positions: number[] = [];
    lines.forEach((l) =>
      l.iconsIndexes.forEach((p) => {
        if (!positions.includes(p)) {
          positions.push(p);
        }
      })
    );

    const entities: Entity[] = [];
    positions.forEach((p) =>
      entities.push(...this._reelsEngine.iconAnimationHelper.getEntities(p))
    );

    return entities;
  }
}
