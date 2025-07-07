import { BuildAction } from '@cgs/shared';
import {
  Container,
  IntervalAction,
  SequenceAction,
  EmptyAction,
  FunctionAction,
  Vector2,
} from '@cgs/syd';
import { PlaySoundAction } from './play_sound_action';
import { UpdateEntityCacheAction } from './update_entity_cache_action';
import { WaitForAction } from './wait_for_action';
import { InternalRespinSpecGroup, ISpinResponse } from '@cgs/common';
import { ReelsEngine } from '../reels_engine';
import { AbstractSpinConfig } from '../game_config/abstract_spin_config';
import { ReelsSoundModel } from '../reels_sound_model';
import { GameStateMachine } from '../state_machine/game_state_machine';
import { ComponentIndex } from '../entities_engine/component_index';
import { ComponentNames } from '../entity_components/component_names';
import { UpdateEntityCacheMode } from '../systems/update_entity_cache_system';
import { Entity } from '../entities_engine/entity';

export class RespinAction extends BuildAction {
  private _container: Container;
  private _reelsEngine: ReelsEngine;
  private _regularSpinConfig: AbstractSpinConfig;
  private _freeSpinConfig: AbstractSpinConfig;
  private _sounds: ReelsSoundModel;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _useSounds: boolean;
  private _useFixedPositionToIconCreation: boolean;
  private _drawableIndex: ComponentIndex;
  private static readonly fixedIconMarker: string = 'FixedIcon';

  constructor(
    container: Container,
    reelsEngine: ReelsEngine,
    gameStateMachine: GameStateMachine<ISpinResponse>,
    regularSpinConfig: AbstractSpinConfig,
    freeSpinConfig: AbstractSpinConfig,
    sounds: ReelsSoundModel,
    useSounds: boolean,
    useFixedPositionToIconCreation: boolean = true
  ) {
    super();
    this._container = container;
    this._reelsEngine = reelsEngine;
    this._gameStateMachine = gameStateMachine;
    this._regularSpinConfig = regularSpinConfig;
    this._freeSpinConfig = freeSpinConfig;
    this._sounds = sounds;
    this._useSounds = useSounds;
    this._useFixedPositionToIconCreation = useFixedPositionToIconCreation;
    this._drawableIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.DrawableIndex
    );
  }

  getSpinConfig(): AbstractSpinConfig {
    // uncomment this for using free spins config
    // if(this._gameStateMachine.curResponse.freeSpinsInfo && this._gameStateMachine.curResponse.freeSpinsInfo.event != FreeSpinsInfoConstants.FreeSpinsFinished){
    //   return this._freeSpinConfig;
    // }

    return this._regularSpinConfig;
  }

  buildAction(): IntervalAction {
    const actions: IntervalAction[] = [];
    if (this._useSounds) {
      actions.push(new PlaySoundAction(this.playSpinSound));
    }
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;
    if (respinGroup && respinGroup.respinCounter <= respinGroup.groups.length) {
      if (this._useFixedPositionToIconCreation) {
        const respinnedReels = this.getRespinnedReels(respinGroup);
        this.createFixedEntities(respinGroup, respinnedReels);
        actions.push(...respinnedReels.map(this.getSpinReelAction));
      } else {
        for (let reel = 0; reel < this._reelsEngine.internalConfig.reelCount; ++reel) {
          actions.push(this.getSpinReelAction(reel));
        }
      }
      actions.push(new WaitForAction(this._reelsEngine.slotsAccelerated));
    }

    const filter = this._reelsEngine.entityEngine.getFilterByIndex([
      this._reelsEngine.entityEngine.getComponentIndex(RespinAction.fixedIconMarker),
    ]);
    const fixedEntities = this._reelsEngine.entityEngine.getEntities(filter).list;
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

  playSpinSound(): void {
    this._sounds.startSpinSound.GoToState('sound');
  }

  getSpinReelAction(reel: number): IntervalAction {
    const actions: IntervalAction[] = [];

    //Don't delay first reel
    if (reel > 0) {
      actions.push(new EmptyAction().withDuration(this.getSpinConfig().spinStartDelay));
    }

    actions.push(
      new FunctionAction(() =>
        this._reelsEngine.accelerateReel(
          reel,
          Vector2.Zero,
          new Vector2(0.0, this.getSpinConfig().spinSpeed * this.getSpinConfig().directions[reel]),
          this.getSpinConfig().accelerationDuration
        )
      )
    );

    return new SequenceAction(actions);
  }

  getRespinnedReels(respinGroup: InternalRespinSpecGroup): number[] {
    const fixedPositionsPerReel: Map<number, number> = new Map();

    const reelNumbers = respinGroup.currentRound.fixedPositions.map((pos) =>
      this._reelsEngine.getReelByPosition(pos)
    );
    for (const reel of reelNumbers) {
      if (fixedPositionsPerReel.has(reel)) {
        fixedPositionsPerReel.set(reel, fixedPositionsPerReel.get(reel)! + 1);
      } else {
        fixedPositionsPerReel.set(reel, 1);
      }
    }

    const respinnedReels: number[] = [];
    for (let reel = 0; reel < this._reelsEngine.ReelConfig.reelCount; reel++) {
      if (
        !fixedPositionsPerReel.has(reel) ||
        fixedPositionsPerReel.get(reel)! < this._reelsEngine.ReelConfig.lineCount
      ) {
        respinnedReels.push(reel);
      }
    }

    return respinnedReels;
  }

  createFixedEntities(respinGroup: InternalRespinSpecGroup, reels: number[]): void {
    const positionsToFix = respinGroup.currentRound.fixedPositions.filter((p) =>
      reels.includes(this._reelsEngine.getReelByPosition(p))
    );
    for (const position of positionsToFix) {
      const reel = this._reelsEngine.getReelByPosition(position);
      const line = this._reelsEngine.getLineByPosition(position);
      const drawableId = this._reelsEngine
        .getStopedEntities(reel, line)[0]
        .get<number>(this._drawableIndex);

      const entity = this.createEntity(reel, line, drawableId, RespinAction.fixedIconMarker);
      const offset = this._reelsEngine.internalConfig.reelsOffset[reel];
      entity.addComponent(
        ComponentNames.Position,
        new Vector2(
          this._reelsEngine.ReelConfig.symbolSize.x * reel + offset.x,
          this._reelsEngine.ReelConfig.symbolSize.y * line + offset.y
        )
      );
      entity.addComponent(ComponentNames.StickyIcon, true);
      entity.register();
    }
  }

  createEntity(reel: number, line: number, drawableId: number, marker: string): Entity {
    const entity = new Entity(this._reelsEngine.entityEngine);
    entity.addComponent(ComponentNames.DrawableIndex, drawableId);
    entity.addComponent(ComponentNames.ReelIndex, reel);
    entity.addComponent(ComponentNames.LineIndex, line);
    entity.addComponent(ComponentNames.Visible, true);
    entity.addComponent(marker, true);

    return entity;
  }
}
