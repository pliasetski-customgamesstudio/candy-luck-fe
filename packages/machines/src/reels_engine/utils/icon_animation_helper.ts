import {
  Container,
  IntervalAction,
  Vector2,
  SequenceAction,
  FunctionAction,
  EmptyAction,
} from '@cgs/syd';
import { ReelsEngine } from '../reels_engine';
import { ComponentIndex } from '../entities_engine/component_index';
import { IconDescr } from '../long_icon_enumerator';
import { IGameParams } from '../interfaces/i_game_params';
import { T_IGameParams } from '../../type_definitions';
import { SlotParams } from '../slot_params';
import { ComponentNames } from '../entity_components/component_names';
import { Entity } from '../entities_engine/entity';

export class IconAnimationHelper {
  private _engine: ReelsEngine;
  private _drawableIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _positionInReelIndex: ComponentIndex;
  private _longIcons: IconDescr[];
  private static readonly AnimName: string = 'anim';

  constructor(container: Container, engine: ReelsEngine) {
    this._engine = engine;
    this._longIcons = (container.forceResolve<IGameParams>(T_IGameParams) as SlotParams).longIcons;
    this._drawableIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex);
    this._reelIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.ReelIndex);
    this._lineIndex = this._engine.entityEngine.getComponentIndex(ComponentNames.LineIndex);
    this._positionInReelIndex = this._engine.entityEngine.getComponentIndex(
      ComponentNames.PositionInReel
    );
  }

  public getMaxAnimDuration(position: number, animName: string): number {
    const entities = this.getEntities(position);
    const maxAnimatiionsDuration = entities.map((e) => this.getEntityAnimDuration(e, animName));
    let maxDuration = 0.0;
    maxAnimatiionsDuration.forEach((d) => {
      maxDuration = Math.max(maxDuration, d);
    });
    return maxDuration;
    // return entities.map((e) => this.getEntityAnimDuration(e, animName)).reduce(Math.max);
  }

  public getMaxAnimDurationOnFinalPosition(
    position: number,
    animName: string = IconAnimationHelper.AnimName
  ): number {
    const entities = this.getEntitiesByFinalPosition(position);
    const maxAnimatiionsDuration = entities.map((e) => this.getEntityAnimDuration(e, animName));
    let maxDuration = 0.0;
    maxAnimatiionsDuration.forEach((d) => {
      maxDuration += Math.max(maxDuration, d);
    });
    return maxDuration;

    // return entities.map((e) => this.getEntityAnimDuration(e, animName)).reduce(Math.max);
  }

  public getEntityAnimDuration(entity: Entity, animName: string): number {
    const drawIndex = entity.get(this._drawableIndex) as number;
    return this.getAnimDurationByIconId(drawIndex, animName);
  }

  public getAnimDurationByIconId(iconId: number, animName: string): number {
    const icons = this._engine.iconModel.getAnimIcon(iconId);
    const iconsWithAnim = icons.filter((i) => i?.stateMachine?.findById(animName));
    let result = 0.0;
    if (iconsWithAnim.length > 0) {
      const data = iconsWithAnim.map(
        (i) => (i.stateMachine!.findById(animName)?.enterAction as IntervalAction).duration
      ) as number[];
      data.forEach((d) => {
        result = Math.max(result, d);
      });
    }
    return result;
  }

  public getDrawIndexes(icon: number): number[] {
    const reelIndex = this.getReelIndex(icon);
    const lineIndex = this.getLineIndex(icon);
    const entities = this._engine.entityCacheHolder.getAnimationEntities(
      reelIndex,
      lineIndex,
      true
    );

    const result: number[] = [];
    for (const entity of entities) {
      const drawableIndex = entity.get(this._drawableIndex) as number;

      if (drawableIndex > 100) {
        result.push(drawableIndex - (drawableIndex % 100));
      }

      result.push(drawableIndex);
    }

    return result;
  }

  public getDrawablePosition(positionOnReels: number): Vector2 {
    const reel = this.getReelIndex(positionOnReels);
    const line = this.getLineIndex(positionOnReels);
    const offset = this._engine.internalConfig.reelsOffset[reel];
    return new Vector2(
      this._engine.ReelConfig.symbolSize.x * reel + offset.x,
      this._engine.ReelConfig.symbolSize.y * line + offset.y
    );
  }

  public getReelIndex(icon: number): number {
    return icon % this._engine.ReelConfig.reelCount;
  }

  public getLineIndex(icon: number): number {
    return Math.floor(icon / this._engine.ReelConfig.reelCount);
  }

  public getPosition(reel: number, line: number): number {
    return line * this._engine.ReelConfig.reelCount + reel;
  }

  public getTruePosition(reel: number, line: number): number {
    if (line < 0) {
      return line * this._engine.ReelConfig.reelCount - reel;
    }
    return line * this._engine.ReelConfig.reelCount + reel;
  }

  public getPositionAnimAction(position: number, animName: string): IntervalAction {
    return new SequenceAction([
      new FunctionAction(() => this.startAnimOnIcon(position, animName), false),
      new EmptyAction().withDuration(this.getMaxAnimDuration(position, animName)),
      new FunctionAction(() => this.stopAnimOnIcon(position, animName), false),
    ]);
  }

  public getEntityAnimAction(entity: Entity, animName: string): IntervalAction {
    return new SequenceAction([
      new FunctionAction(() => this.startAnimOnEntity(entity, animName), false),
      new EmptyAction().withDuration(this.getEntityAnimDuration(entity, animName)),
      new FunctionAction(() => this.stopAnimOnEntity(entity, animName), false),
    ]);
  }

  public stopAnimOnIcon(position: number, animName: string): void {
    animName = animName ? animName : IconAnimationHelper.AnimName;
    this.getEntities(position).forEach((e) => this._engine.stopAnimation(e, animName));
  }

  public stopAnimOnFinalPosition(
    position: number,
    animName: string = IconAnimationHelper.AnimName
  ): void {
    this.getEntitiesByFinalPosition(position).forEach((e) => this.stopAnimOnEntity(e, animName));
  }

  public stopAnimOnEntity(entity: Entity, animName: string | null): void {
    animName = animName ? animName : IconAnimationHelper.AnimName;
    this._engine.stopAnimation(entity, animName);
  }

  public startAnimOnIcon(position: number, animName: string): void {
    animName = animName ? animName : IconAnimationHelper.AnimName;
    this.getEntities(position).forEach((e) => this._engine.startAnimation(e, animName));
  }

  public startAnimOnFinalPosition(
    position: number,
    animName: string = IconAnimationHelper.AnimName
  ): void {
    this.getEntitiesByFinalPosition(position).forEach((e) => this.startAnimOnEntity(e, animName));
  }

  public startAnimOnEntity(entity: Entity, animName: string): void {
    animName = animName ? animName : IconAnimationHelper.AnimName;
    this._engine.startAnimation(entity, animName);
  }

  public getEntities(icon: number): Entity[] {
    const result: Entity[] = [];
    let reelIndex = this.getReelIndex(icon) as number;
    let lineIndex = this.getLineIndex(icon) as number;
    const entities = this._engine.entityCacheHolder.getAnimationEntities(
      reelIndex,
      lineIndex,
      true
    );

    for (const entity of entities) {
      const drawableIndex = entity.get(this._drawableIndex) as number;
      const iconId = drawableIndex > 100 ? Math.floor(drawableIndex / 100) : drawableIndex;
      const wideIcon =
        this._longIcons &&
        this._longIcons.filter((i) => i.iconIndex == iconId && i.width > 1).length > 0
          ? this._longIcons.find((i) => i.iconIndex == iconId && i.width > 1)
          : null;

      const reelDiv = wideIcon ? Math.floor((drawableIndex % 100) / wideIcon.length) : 0;
      const lineDiv = wideIcon ? (drawableIndex % 100) % wideIcon.length : drawableIndex % 100;

      if (drawableIndex > 100 && (lineDiv > 0 || reelDiv > 0)) {
        lineIndex -= lineDiv;
        reelIndex -= reelDiv;

        if (this._engine.entityCacheHolder.hasPosition(reelIndex, lineIndex)) {
          const cachedEntities = this._engine.entityCacheHolder.getAnimationEntities(
            reelIndex,
            lineIndex,
            true
          );
          if (
            cachedEntities.filter(
              (e) =>
                Math.floor((e.get(this._drawableIndex) as number) / 100) ==
                Math.floor(drawableIndex / 100)
            ).length > 0
          ) {
            result.push(...cachedEntities);
          } else {
            result.push(
              ...this._engine.entityCacheHolder
                .getAnimationEntities(reelIndex, lineIndex, false)
                .filter(
                  (e) =>
                    Math.floor((e.get(this._drawableIndex) as number) / 100) ==
                    Math.floor(drawableIndex / 100)
                )
            );
          }
        }
      } else {
        result.push(entity);
      }
    }

    return result;
  }

  public getEntitiesByFinalPositionByReelLineIndex(reel: number, line: number): Entity[] {
    const entities: Entity[] = [];
    this._engine.entityEngine.getAllEntities().forEach((e) => {
      if (
        e.hasComponent(this._reelIndex) &&
        e.get(this._reelIndex) == reel &&
        ((e.hasComponent(this._lineIndex) &&
          e.get<number>(this._lineIndex) == line &&
          !e.hasComponent(this._positionInReelIndex)) ||
          (e.hasComponent(this._positionInReelIndex) && e.get(this._positionInReelIndex) == line))
      ) {
        entities.push(e);
      }
    });

    const result: Entity[] = [];

    for (const entity of entities) {
      const drawableIndex = entity.get(this._drawableIndex) as number;
      const iconId = drawableIndex > 100 ? Math.floor(drawableIndex / 100) : drawableIndex;
      const wideIcon =
        this._longIcons &&
        this._longIcons.filter((i) => i.iconIndex == iconId && i.width > 1).length > 0
          ? this._longIcons.find((i) => i.iconIndex == iconId && i.width > 1)
          : null;

      const reelDiv = wideIcon ? Math.floor((drawableIndex % 100) / wideIcon.length) : 0;
      const lineDiv = wideIcon ? (drawableIndex % 100) % wideIcon.length : drawableIndex % 100;

      if (drawableIndex > 100 && (lineDiv > 0 || reelDiv > 0)) {
        const newLine = line - lineDiv;
        const newReel = reel - reelDiv;

        const filteredEntities: Entity[] = [];
        this._engine.entityEngine.getAllEntities().forEach((e) => {
          if (
            e.hasComponent(this._reelIndex) &&
            e.get(this._reelIndex) == newReel &&
            ((e.hasComponent(this._lineIndex) &&
              e.get<number>(this._lineIndex) == newLine &&
              !e.hasComponent(this._positionInReelIndex)) ||
              (e.hasComponent(this._positionInReelIndex) &&
                e.get(this._positionInReelIndex) == newLine))
          ) {
            filteredEntities.push(e);
          }
        });

        result.push(...filteredEntities);
      } else {
        result.push(entity);
      }
    }

    return result;
  }

  public getEntitiesByFinalPosition(position: number): Entity[] {
    const reel = this.getReelIndex(position);
    const line = this.getLineIndex(position);
    const entities: Entity[] = [];
    this._engine.entityEngine.getAllEntities().forEach((e) => {
      if (
        e.hasComponent(this._reelIndex) &&
        e.get(this._reelIndex) == reel &&
        ((e.hasComponent(this._lineIndex) &&
          e.get<number>(this._lineIndex) == line &&
          !e.hasComponent(this._positionInReelIndex)) ||
          (e.hasComponent(this._positionInReelIndex) && e.get(this._positionInReelIndex) == line))
      ) {
        entities.push(e);
      }
    });

    const result: Entity[] = [];

    for (const entity of entities) {
      const drawableIndex = entity.get(this._drawableIndex) as number;
      const iconId = drawableIndex > 100 ? Math.floor(drawableIndex / 100) : drawableIndex;
      const wideIcon =
        this._longIcons &&
        this._longIcons.filter((i) => i.iconIndex == iconId && i.width > 1).length > 0
          ? this._longIcons.find((i) => i.iconIndex == iconId && i.width > 1)
          : null;

      const reelDiv = wideIcon ? Math.floor((drawableIndex % 100) / wideIcon.length) : 0;
      const lineDiv = wideIcon ? (drawableIndex % 100) % wideIcon.length : drawableIndex % 100;

      if (drawableIndex > 100 && (lineDiv > 0 || reelDiv > 0)) {
        const newLine = line - lineDiv;
        const newReel = reel - reelDiv;

        const filteredEntities: Entity[] = [];
        this._engine.entityEngine.getAllEntities().forEach((e) => {
          if (
            e.hasComponent(this._reelIndex) &&
            e.get(this._reelIndex) == newReel &&
            ((e.hasComponent(this._lineIndex) &&
              e.get<number>(this._lineIndex) == newLine &&
              !e.hasComponent(this._positionInReelIndex)) ||
              (e.hasComponent(this._positionInReelIndex) &&
                e.get(this._positionInReelIndex) == newLine))
          ) {
            filteredEntities.push(e);
          }
        });

        result.push(...filteredEntities);
      } else {
        result.push(entity);
      }
    }

    return result;
  }

  public getSoundEntities(icon: number): Entity[] {
    const result: Entity[] = [];
    let reelIndex = this.getReelIndex(icon) as number;
    let lineIndex = this.getLineIndex(icon) as number;
    const entities = this._engine.entityCacheHolder.getSoundEntities(reelIndex, lineIndex, true);

    for (const entity of entities) {
      const drawableIndex = entity.get(
        this._engine.entityEngine.getComponentIndex(ComponentNames.DrawableIndex)
      ) as number;
      const iconId = drawableIndex > 100 ? Math.floor(drawableIndex / 100) : drawableIndex;
      const wideIcon =
        this._longIcons &&
        this._longIcons.filter((i) => i.iconIndex == iconId && i.width > 1).length > 0
          ? this._longIcons.find((i) => i.iconIndex == iconId && i.width > 1)
          : null;

      const reelDiv = wideIcon ? Math.floor((drawableIndex % 100) / wideIcon.length) : 0;
      const lineDiv = wideIcon ? (drawableIndex % 100) % wideIcon.length : drawableIndex % 100;

      if (drawableIndex > 100 && (lineDiv > 0 || reelDiv > 0)) {
        lineIndex -= lineDiv;
        reelIndex -= reelDiv;

        if (this._engine.entityCacheHolder.hasPosition(reelIndex, lineIndex)) {
          const cachedEntities = this._engine.entityCacheHolder.getSoundEntities(
            reelIndex,
            lineIndex,
            true
          );
          if (
            cachedEntities.filter(
              (e) =>
                Math.floor((e.get(this._drawableIndex) as number) / 100) ==
                Math.floor(drawableIndex / 100)
            ).length > 0
          ) {
            result.push(...cachedEntities);
          } else {
            result.push(
              ...this._engine.entityCacheHolder
                .getSoundEntities(reelIndex, lineIndex, false)
                .filter(
                  (e) =>
                    Math.floor((e.get(this._drawableIndex) as number) / 100) ==
                    Math.floor(drawableIndex / 100)
                )
            );
          }
        }
      } else {
        result.push(entity);
      }
    }

    return result;
  }
}
