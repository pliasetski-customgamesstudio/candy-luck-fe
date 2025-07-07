import { AnimationBasedGameEngine, AnimationGameEngineParams } from 'machines';
import { Container } from 'syd';
import { EntitiesEngine, ComponentNames } from 'machines/src/reels_engine_library';

class AnimationBasedGameEngineProvider
  implements IAnimationBasedGameEngineProvider, ISlotGameEngineProvider
{
  private _entityEngine: EntitiesEngine;
  private _gameEngine: AnimationBasedGameEngine;

  get gameEngine(): AnimationBasedGameEngine {
    return this._gameEngine;
  }

  constructor(
    container: Container,
    slotPlaceholderId: string,
    respinSlotPlaceholderId: string,
    iconPlaceholderId: string,
    showAnimName: string,
    hideAnimName: string,
    stopIconEventTrackerId: string = 'events',
    iconStopStateFormat: string = 'post{0}',
    idleStateName: string = 'idle',
    iconContainerIdFormat: string = 'item_{0}',
    iconIdFormat: string = 'icon_{0}'
  ) {
    console.log('load ' + this.constructor.name);
    this._entityEngine = new EntitiesEngine(ComponentNames.Count);
    const engineParams = new AnimationGameEngineParams();
    engineParams.slotPlaceholderId = slotPlaceholderId;
    engineParams.respinSlotPlaceholderId = respinSlotPlaceholderId;
    engineParams.iconPlaceholderId = iconPlaceholderId;
    engineParams.showAnimName = showAnimName;
    engineParams.hideAnimName = hideAnimName;
    engineParams.idleStateName = idleStateName;
    engineParams.iconContainerIdFormat = iconContainerIdFormat;
    engineParams.iconIdFormat = iconIdFormat;
    engineParams.iconsStopEventTrackerId = stopIconEventTrackerId;
    engineParams.iconStopStateFormat = iconStopStateFormat;

    this._gameEngine = new AnimationBasedGameEngine(container, this._entityEngine, engineParams);
  }
}
