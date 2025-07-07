import { BuildAction } from '@cgs/shared';
import { Container, IntervalAction, EmptyAction, FunctionAction, SequenceAction } from '@cgs/syd';
import { ComponentNames } from '../entity_components/component_names';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { ReelsEngine } from '../reels_engine';
import { ReelsSoundModel } from '../reels_sound_model';
import { UpdateEntityCacheAction } from './update_entity_cache_action';
import { WaitForAction } from './wait_for_action';
import { Line, ReelWinPosition, ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import { UpdateEntityCacheMode } from '../systems/update_entity_cache_system';

export class StopAfterRespinAction extends BuildAction {
  private _container: Container;
  private _engine: ReelsEngine;
  private _spinConfig: AbstractSpinConfig;
  private _sounds: ReelsSoundModel;
  private _useSounds: boolean;
  private _winTapes: number[][];
  private _winLines: Line[];
  private _winPositions: ReelWinPosition[] | null;
  private _stopReelsSoundImmediately: boolean;
  private static readonly fixedIconMarker: string = 'FixedIcon';

  constructor(
    container: Container,
    engine: ReelsEngine,
    spinConfig: AbstractSpinConfig,
    response: ISpinResponse,
    sounds: ReelsSoundModel,
    stopReelsSoundImmediately: boolean,
    useSounds: boolean
  ) {
    super();
    this._container = container;
    this._engine = engine;
    this._spinConfig = spinConfig;
    this._sounds = sounds;
    this._stopReelsSoundImmediately = stopReelsSoundImmediately;
    this._useSounds = useSounds;
    const respinGroup = response.additionalData as InternalRespinSpecGroup;
    this._winTapes = respinGroup.currentRound.newViewReels
      ? respinGroup.currentRound.newViewReels
      : [];
    this._winLines = respinGroup.currentRound.winLines ? respinGroup.currentRound.winLines : [];
    this._winPositions = respinGroup.currentRound.winPositions
      ? respinGroup.currentRound.winPositions
      : null;
  }

  buildAction(): IntervalAction {
    const filter = this._engine.entityEngine.getFilterByIndex([
      this._engine.entityEngine.getComponentIndex(StopAfterRespinAction.fixedIconMarker),
    ]);
    const fixedEntities = this._engine.entityEngine.getEntities(filter).list;

    this._engine.slotsStoped.first.then((s) => this._slotStopped(s));
    const actions: IntervalAction[] = [];
    for (let reel = 0; reel < this._engine.ReelConfig.reelCount; ++reel) {
      if (reel > 0) {
        actions.push(new EmptyAction().withDuration(this._spinConfig.spinStopDelay));
      }
      actions.push(this._stop(reel, this._winTapes[reel]));
    }

    const slotStopAction = new WaitForAction<void>(this._engine.slotsStoped);
    slotStopAction.subscribe();
    actions.push(slotStopAction);

    actions.push(
      new FunctionAction(() => {
        for (const entity of fixedEntities) {
          if (
            entity.hasComponent(
              this._engine.entityEngine.getComponentIndex(ComponentNames.StickyIcon)
            )
          ) {
            entity.removeComponent(ComponentNames.StickyIcon);
          }
        }
      })
    );
    actions.push(
      ...fixedEntities.map(
        (e) =>
          new UpdateEntityCacheAction(
            this._container,
            e,
            UpdateEntityCacheMode.Replace,
            UpdateEntityCacheMode.Replace
          )
      )
    );

    return new SequenceAction(actions);
  }

  private _slotStopped(param: any): void {
    if (this._useSounds) {
      if (
        this._stopReelsSoundImmediately ||
        this._winLines.length > 0 ||
        (this._winPositions && this._winPositions.length > 0)
      ) {
        this._sounds.startSpinSound.GoToState('stop_sound');
      } else {
        this._sounds.startSpinSound.GoToState('fade_out');
      }
    }
  }

  private _stop(reel: number, winTapes: number[]): IntervalAction {
    return new FunctionAction(() => this._engine.stop(reel, winTapes));
  }
}
