import { BitmapTextSceneObject, Container, Log, SceneObject } from '@cgs/syd';
import { CheatComponent } from './components/cheat_component';
import { T_CheatComponent, T_ISlotGame } from '../type_definitions';
import { ISlotGame } from '../reels_engine/i_slot_game';

export interface IDebugGameService {
  RegisterJSFunctions(): void;
  executeOnUpdate(): void;
}

export class DebugGameService implements IDebugGameService {
  rootNode: SceneObject;

  private _container: Container;
  private _topPanelView: SceneObject;
  isRegistred: boolean = false;
  private _cheatComponent: CheatComponent;

  constructor(container: Container) {
    this._cheatComponent = container.forceResolve<CheatComponent>(T_CheatComponent);
    this.rootNode = container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
  }

  executeFindById(): void {}

  executeCheatCommands(): void {}

  executeOnUpdate(): void {}

  RegisterJSFunctions(): void {
    if (this.isRegistred) {
      Log.Error('Debug JS functions already registred');
      return;
    }
    this.isRegistred = true;
    (window as any)['customGamesFindTextById'] = (parameter: any) => {
      if (!parameter || !parameter['id']) {
        Log.Error('Wrong params');
        return;
      }
      const rootNode = this._container.forceResolve<ISlotGame>(T_ISlotGame).gameNode;
      const items = rootNode.findAllById(parameter['id']);
      for (const item of items) {
        const textScene = item as BitmapTextSceneObject;
        if (!textScene) {
          continue;
        }
        Log.Trace(textScene.text);
      }
    };
  }
}
