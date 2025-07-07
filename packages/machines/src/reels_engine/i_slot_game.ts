import { Container, SceneObject } from '@cgs/syd';
import { IGameParams } from './interfaces/i_game_params';
import { GameStateMachine } from './state_machine/game_state_machine';
import { ISpinResponse } from '@cgs/common';

export interface ISlotGame {
  get container(): Container;

  get gameNode(): SceneObject;

  get gameParams(): IGameParams;

  get slotLoaded(): Promise<ISlotGame>;
  get slotStateMachineInitCompleted(): Promise<boolean>;

  get gameConfig(): Record<string, any>;
  get symbolsBounds(): Record<string, any>;
  get linesConfig(): Record<string, any>;

  dispose(): void;

  initialize(): void;
  get isInitialized(): boolean;

  resolveComponent(type: any): any;
  getGameStateMachine(): GameStateMachine<ISpinResponse>;
}
