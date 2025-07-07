import { Machine } from '@cgs/network';
import { IAppState } from './i_app_state';

export interface IGameAvailabilityCheck extends IAppState {
  canStartMachine(machine: Machine, force: boolean): boolean;
  availableForCurrentVersion(machine: Machine): boolean;
  availableForCurrentLevel(machine: Machine): boolean;
  isGameCodeExists(machine: Machine): boolean;
}
