import { GameComponentProvider } from './game_component_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';
import { ResourcesComponent } from './resources_component';
import {
  Action,
  BitmapTextSceneObject,
  Container,
  EmptyAction,
  FunctionAction,
  SceneObject,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { T_IGameStateMachineProvider, T_ResourcesComponent } from '../../type_definitions';

export class MultipliedWinProvider extends GameComponentProvider {
  private _groupName: string;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _resourcesComponent: ResourcesComponent;
  private _multiplyTextNode: BitmapTextSceneObject;
  private _multiplyAnimNode: SceneObject;

  constructor(
    container: Container,
    groupName: string = 'MultipliedTotalWin',
    textNodeName: string = 'multiplier_txt',
    animNodeName: string = 'multiplier'
  ) {
    super();
    this._groupName = groupName;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    this._gameStateMachine.stop.appendLazyAnimation(() => this.buildChangeMultilied());

    this._gameStateMachine.accelerate.appendLazyAnimation(
      () =>
        new FunctionAction(() => {
          this._multiplyAnimNode.stateMachine!.switchToState('hide');
        })
    );

    this._multiplyTextNode = this._resourcesComponent.root.findById(
      textNodeName
    ) as BitmapTextSceneObject;
    this._multiplyAnimNode = this._resourcesComponent.root.findById(animNodeName)!;
  }

  private buildChangeMultilied(): Action {
    const symbols = this.getSpecSymbolGroupsByMarker(
      this._gameStateMachine.curResponse,
      this._groupName
    );
    if (symbols && symbols.length > 0) {
      this._multiplyTextNode.text = Math.round(symbols[0].totalJackPotWin).toString();
      this._multiplyAnimNode.stateMachine!.switchToState('show');
    }

    return new EmptyAction().withDuration(0.0);
  }
}
