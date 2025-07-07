import { AbstractAnticipationConfig } from './abstract_anticipation_config';
import { IconWithValuesConfig } from './game_config';

export interface AbstractSpinConfig {
  spinedReels: number[][];
  noWinReels: number[][];
  spinSpeed: number;
  useAnticipation: boolean;
  directions: number[];
  accelerationDuration: number;
  spinStartDelay: number;
  spinStopDelay: number;
  continueDuration: number;
  noWinDelay: number;
  blinkDuration: number;
  blinkIterations: number;
  speedMultiplier: number;
  singleEntitySpinSpeed: number;
  anticipationConfig: AbstractAnticipationConfig;
  iconWithValuesConfig: IconWithValuesConfig | null;
}
