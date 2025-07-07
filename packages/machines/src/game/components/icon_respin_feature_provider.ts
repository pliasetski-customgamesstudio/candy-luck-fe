import { GameComponentProvider } from './game_component_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { SpinConfig } from '../../reels_engine/game_config/game_config';
import { Action, Container, EmptyAction, Vector2 } from '@cgs/syd';
import { T_IGameConfigProvider, T_ISlotGameEngineProvider } from '../../type_definitions';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IGameConfigProvider } from './interfaces/i_game_config_provider';

export class IconRespinFeatureProvider extends GameComponentProvider {
  private _reelEngine: ReelsEngine;
  private _spinConfig: SpinConfig;
  private _isAccelerated: boolean = false;

  constructor(container: Container) {
    super();
    // const gameStateMachine = container.resolve<IGameStateMachineProvider>(
    //   T_IGameStateMachineProvider
    // ).gameStateMachine;
    this._reelEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._spinConfig = container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig
      .regularSpinConfig as SpinConfig;
  }

  public doSpin(): void {
    const line: number = 1;
    const reel: number = 2;
    if (this._isAccelerated) {
      this._reelEngine.stopEntity(reel, line, 2);
      this._isAccelerated = false;
    } else {
      this._isAccelerated = true;
      this._reelEngine.accelerateSpinningEntity(
        reel,
        line,
        new Vector2(0.0, 0.0),
        new Vector2(0.0, this._spinConfig.spinSpeed),
        this._spinConfig.accelerationDuration
      );
    }
  }

  public getRespinEnterAction(): Action {
    return new EmptyAction();
  }
}
