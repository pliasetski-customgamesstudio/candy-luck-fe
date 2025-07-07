import {
  Vector2,
  InterpolateCopyAction,
  IntervalAction,
  ParallelAction,
  EmptyAction,
  VideoSceneObject,
  SceneObject,
  State,
} from '@cgs/syd';
import { ListSet } from '../utils/list_set';
import { AbstractSystem } from '../entities_engine/abstract_system';
import { Easing, InternalReelsConfig } from '../internal_reels_config';
import { IIconModel } from '../i_icon_model';
import { ComponentIndex } from '../entities_engine/component_index';
import { Entity } from '../entities_engine/entity';
import { EntitiesEngine } from '../entities_engine/entities_engine';
import { ComponentNames } from '../entity_components/component_names';
import { SpeedInterpolation } from '../entity_components/speed_interpolation';
import { BrakingCalculationInfo } from '../entity_components/braking_calculation_info';

export type Routine = () => void;

export class CommandSystem extends AbstractSystem {
  private readonly _reelsConfig: InternalReelsConfig;
  private readonly _iconModel: IIconModel;
  private readonly _routineQueue: Routine[] = [];
  private _speedIndex: ComponentIndex;
  private _positionIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _maxSpeedIndex: ComponentIndex;
  private _iconNodeIndex: ComponentIndex;
  private _toStart: ListSet<Entity>;
  private _toStop: ListSet<Entity>;

  constructor(engine: EntitiesEngine, reelsConfig: InternalReelsConfig, iconModel: IIconModel) {
    super(engine);
    this._reelsConfig = reelsConfig;
    this._iconModel = iconModel;
    this._maxSpeedIndex = engine.getComponentIndex(ComponentNames.MaxSpeed);
    this._speedIndex = engine.getComponentIndex(ComponentNames.Speed);
    this._positionIndex = engine.getComponentIndex(ComponentNames.Position);
    this._reelIndex = engine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = engine.getComponentIndex(ComponentNames.LineIndex);
    this._iconNodeIndex = engine.getComponentIndex(ComponentNames.IconNode);
    this._toStart = engine.getEntities(engine.getFilterByIndex([this._reelIndex]));
    this._toStop = engine.getEntities(
      engine.getFilterByIndex([this._speedIndex, this._positionIndex, this._reelIndex])
    );
  }

  public accelerateReel(reel: number, startSpeed: Vector2, endSpeed: Vector2, time: number): void {
    this._routineQueue.push(() => {
      for (let l = 0; l < this._reelsConfig.lineCount; ++l) {
        const lineIndexPos = l - this._reelsConfig.additionalUpLines;
        this.accelerateEntityOnPosition(reel, lineIndexPos, startSpeed, endSpeed, time);
      }
    });
  }

  public accelerateSingleSpinningReel(
    reel: number,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number,
    lines: number[]
  ): void {
    this._routineQueue.push(() => {
      for (const l of lines) {
        this.accelerateSpinningEntityOnPosition(reel, l, startSpeed, endSpeed, time);
      }
    });
  }

  public accelerateEntityOnPosition(
    reel: number,
    line: number,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number
  ): void {
    const entities = this._toStart.list;
    for (let i = 0; i < entities.length; ++i) {
      const entity = entities[i];
      if (
        entity.get<number>(this._reelIndex) === reel &&
        entity.get<number>(this._lineIndex) === line
      ) {
        this.accelerateEntity(
          entity,
          startSpeed,
          endSpeed,
          time,
          this._reelsConfig.getStartEasing(reel)
        );
      }
    }
  }

  public accelerateSpinningEntityOnPosition(
    reel: number,
    line: number,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number
  ): void {
    const entities = this._toStart.list;
    for (let i = 0; i < entities.length; ++i) {
      const entity = entities[i];
      if (
        entity.get<number>(this._reelIndex) === reel &&
        entity.get<number>(this._lineIndex) === line
      ) {
        this.accelerateSpinningEntity(
          entity,
          startSpeed,
          endSpeed,
          time,
          this._reelsConfig.getStartEasing(reel)
        );
      }
    }
  }

  private accelerateEntity(
    entity: Entity,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number,
    easing: Easing
  ): void {
    const interpolate = new SpeedInterpolation()
      .withParameters(time, startSpeed, endSpeed, Vector2.lerp)
      .withTimeFunction(easing);
    entity.addComponent(ComponentNames.Speed, startSpeed);
    entity.addComponent(ComponentNames.SingleSpinningIndex, false);
    entity.addComponent(ComponentNames.MaxSpeed, endSpeed);
    entity.addComponent(ComponentNames.RelocatedFlag, 0);
    entity.addComponent(ComponentNames.AccelerationInterpolate, interpolate);
  }

  private accelerateSpinningEntity(
    entity: Entity,
    startSpeed: Vector2,
    endSpeed: Vector2,
    time: number,
    easing: Easing
  ): void {
    const interpolate = new SpeedInterpolation()
      .withParameters(time, startSpeed, endSpeed, Vector2.lerp)
      .withTimeFunction(easing);
    entity.addComponent(ComponentNames.Speed, startSpeed);
    entity.addComponent(ComponentNames.MaxSpeed, endSpeed);
    entity.addComponent(ComponentNames.RelocatedFlag, 0);
    entity.addComponent(ComponentNames.SingleSpinningIndex, true);
    entity.addComponent(ComponentNames.AccelerationInterpolate, interpolate);
  }

  private internalMoveReel(reel: number, toPosition: Vector2, duration: number): void {
    const entities = this._toStart.list;
    for (let i = 0; i < entities.length; ++i) {
      if (entities[i].get(this._reelIndex) === reel) {
        const position = entities[i].get(this._positionIndex) as Vector2;
        const interpolate = new InterpolateCopyAction<Vector2>()
          .withDuration(duration)
          .withValues(position, position.add(toPosition))
          .withInterpolateFunction(Vector2.lerp);

        interpolate.begin();
        entities[i].addComponent(ComponentNames.PositionInterpolate, interpolate);
      }
    }
  }

  public moveReel(reel: number, toPosition: Vector2, duration: number): void {
    this._routineQueue.push(() => {
      this.internalMoveReel(reel, toPosition, duration);
    });
  }

  public stopReel(reel: number): void {
    this._routineQueue.push(() => {
      for (let l = 0; l < this._reelsConfig.lineCount; ++l) {
        const lineIndexPos = l - this._reelsConfig.additionalUpLines;
        this.stopEntity(reel, lineIndexPos);
      }
    });
  }

  public stopEntity(reel: number, line: number): void {
    const entities = this._toStop.list;
    for (let i = 0; i < entities.length; ++i) {
      const entity = entities[i];
      if (
        entity.get<number>(this._reelIndex) === reel &&
        entity.get<number>(this._lineIndex) === line
      ) {
        entity.removeComponent(ComponentNames.AccelerationInterpolate);
        const position = entity.get<Vector2>(this._positionIndex) as Vector2;
        const speed = entity.get(this._maxSpeedIndex) as Vector2;
        entity.addComponent(
          ComponentNames.BrakingCalculationInfo,
          new BrakingCalculationInfo(position, speed)
        );
      }
    }
  }

  public startAnimation(entity: Entity, animationName: string): void {
    const drawIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    const drawId = entity.get(drawIndex) as number;
    const sceneIcons = this._iconModel.getAnimIcon(drawId);
    const startAnimationActions: IntervalAction[] = [];

    for (const sceneIcon of sceneIcons) {
      if (!sceneIcon || !sceneIcon.stateMachine) {
        continue;
      }

      const state = sceneIcon.stateMachine.findById(animationName);
      if (!state) {
        continue;
      }

      const processAnimationIndex = this.engine.getComponentIndex(ComponentNames.ProcessAnimation);
      const processAnimationFilter = this.engine.getFilterByIndex([processAnimationIndex]);

      const entities = this.engine.getEntities(processAnimationFilter);
      entities.list.forEach((entity) => {
        const state = sceneIcon.stateMachine!.findById(animationName) as State;
        const actions = entity.get<ListSet<IntervalAction>>(processAnimationIndex);
        if (actions.add(state.enterAction as IntervalAction)) {
          state.enterAction.begin();
        }
      });

      startAnimationActions.push(state.enterAction as IntervalAction);
    }

    entity.addComponent(ComponentNames.DrawAnimation, new ParallelAction(startAnimationActions));
  }

  public startAnimationInSingleIcon(entity: Entity, _animationName: string): void {
    entity.addComponent(ComponentNames.DrawAnimation, new EmptyAction());
  }

  public stopAnimtion(entity: Entity, animationName: string): void {
    const drawIndex = this.engine.getComponentIndex(ComponentNames.DrawableIndex);
    const drawId = entity.get(drawIndex) as number;
    const sceneIcons = this._iconModel.getAnimIcon(drawId);

    for (const sceneIcon of sceneIcons) {
      if (!sceneIcon || !sceneIcon.stateMachine) {
        continue;
      }

      const state = sceneIcon.stateMachine.findById(animationName);
      if (!state) {
        continue;
      }

      const processAnimationIndex = this.engine.getComponentIndex(ComponentNames.ProcessAnimation);
      const processAnimationFilter = this.engine.getFilterByIndex([processAnimationIndex]);
      const entities = this.engine.getEntities(processAnimationFilter);
      entities.list.forEach((entity) => {
        const actions = entity.get(processAnimationIndex) as ListSet<IntervalAction>;
        state.enterAction.end();
        actions.remove(state.enterAction as IntervalAction);
      });

      const videos = sceneIcon.findAllByType(VideoSceneObject).map((t) => t as VideoSceneObject);
      for (const video of videos) {
        video.stop();
      }
    }

    entity.removeComponent(ComponentNames.DrawAnimation);
  }

  public stopAnimationInSingleIcon(entity: Entity, animationName: string): void {
    const sceneIcon = entity.get<SceneObject>(this._iconNodeIndex) as SceneObject;
    if (sceneIcon && sceneIcon.stateMachine) {
      const state = sceneIcon.stateMachine.findById(animationName);
      if (state && state.enterAction) {
        state.enterAction.end();
      }
      const videos = sceneIcon.findAllByType(VideoSceneObject).map((t) => t as VideoSceneObject);
      for (const video of videos) {
        video.stop();
      }
    }
    entity.removeComponent(ComponentNames.DrawAnimation);
  }

  public updateImpl(_dt: number): void {
    if (this._routineQueue.length > 0) {
      const routine = this._routineQueue.shift() as Routine;
      routine();
    }
  }
}
