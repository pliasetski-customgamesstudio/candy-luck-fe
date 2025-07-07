import { Container } from 'inversify';
import { EntitiesEngine, ComponentNames } from 'machines';
import { AnimationBasedGameEngine, IAnimationBasedGameEngineProvider } from 'syd';
import {
  CollapseAnimationBasedGameEngine,
  CollapseAnimationGameEngineParams,
  ISlotGameEngineProvider,
} from 'machines/src/reels_engine_library';

class CollapseAnimationBasedGameEngineProvider
  implements IAnimationBasedGameEngineProvider, ISlotGameEngineProvider
{
  private _entityEngine: EntitiesEngine;
  private _gameEngine: AnimationBasedGameEngine;

  constructor(
    container: Container,
    slotPlaceholderId: string,
    collapsePlaceholderId: string,
    iconPlaceholderId: string,
    showAnimName: string,
    hideAnimName: string,
    collapseHideAnimName: string,
    collapseShowAnimName: string,
    idleStateName: string = 'idle',
    iconContainerIdFormat: string = 'item_{0}',
    iconIdFormat: string = 'icon_{0}'
  ) {
    console.log('load ' + this.constructor.name);
    this._entityEngine = new EntitiesEngine(ComponentNames.Count);
    const engineParams = new CollapseAnimationGameEngineParams();
    engineParams.slotPlaceholderId = slotPlaceholderId;
    engineParams.collapsePlaceholderNodeId = collapsePlaceholderId;
    engineParams.iconPlaceholderId = iconPlaceholderId;
    engineParams.showAnimName = showAnimName;
    engineParams.hideAnimName = hideAnimName;
    engineParams.collapseHideAnimName = collapseHideAnimName;
    engineParams.collapseShowAnimName = collapseShowAnimName;
    engineParams.idleStateName = idleStateName;
    engineParams.iconContainerIdFormat = iconContainerIdFormat;
    engineParams.iconIdFormat = iconIdFormat;

    this._gameEngine = new CollapseAnimationBasedGameEngine(
      container,
      this._entityEngine,
      engineParams
    );
  }

  get gameEngine(): AnimationBasedGameEngine {
    return this._gameEngine;
  }
}
