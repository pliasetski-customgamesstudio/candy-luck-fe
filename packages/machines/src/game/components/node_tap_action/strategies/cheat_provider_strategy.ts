import { Container } from '@cgs/syd';
import { CheatComponent } from '../../cheat_component';
import { T_CheatComponent } from '../../../../type_definitions';
import { IconActionContext } from '../contexts/icon_action_context';
import { IActionNodeStrategy } from './i_action_node_strategy';

export enum Cheat {
  None = -1,
  Bonus = 0,
  FreeSpins = 1,
  Scatter = 2,
  Config = 3,
}

export class CheatProviderStrategy implements IActionNodeStrategy<IconActionContext> {
  private _container: Container;
  private _cheatComponent: CheatComponent;

  constructor(container: Container) {
    this._container = container;
    this._cheatComponent = this._container.forceResolve<CheatComponent>(T_CheatComponent);
  }

  performStrategy(actionContext: IconActionContext): void {
    switch (actionContext.reelIndex) {
      case 0:
        this._cheatComponent.setCheatType(Cheat.Bonus);
        break;
      case 1:
        this._cheatComponent.setCheatType(Cheat.FreeSpins);
        break;
      case 2:
        this._cheatComponent.setCheatType(Cheat.Config);
        break;
      default:
        break;
    }
    this._cheatComponent.doSpin();
  }
}
