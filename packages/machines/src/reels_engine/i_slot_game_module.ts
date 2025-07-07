import { SceneObject } from '@cgs/syd';
import { ISlotGameConfig } from './game_components/i_slot_game_config';
import { ISlotGameEngine } from './i_slot_game_engine';
import { IGameParams } from './interfaces/i_game_params';

export class ModuleSpinConditions {
  spinModes: string[];
  freeSpinTypes: string[];
  freeSpinParameterValues: number[];

  constructor(
    spinModes: string[],
    freeSpinTypes: string[] = [],
    freeSpinParameterValues: number[] = []
  ) {
    this.spinModes = spinModes;
    this.freeSpinTypes = freeSpinTypes;
    this.freeSpinParameterValues = freeSpinParameterValues;
  }
}

export interface ISlotGameModule extends Disposable {
  moduleNode: SceneObject;
  moduleParams: IGameParams;
  slotParams: IGameParams;
  moduleEngine: ISlotGameEngine;
  moduleConfig: ISlotGameConfig;
  moduleSpinConditions: ModuleSpinConditions;

  registerComponent(factory: any, type: string): void;

  getComponent(type: string): any;
}
