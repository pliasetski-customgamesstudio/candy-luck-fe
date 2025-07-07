import { AbstractAnticipationConfig } from './abstract_anticipation_config';
import { AbstractSpinConfig } from './abstract_spin_config';
import { AbstractStaticConfig } from './abstract_static_config';
import { IconWithValuesConfig } from './game_config';

export interface AbstractGameConfig {
  staticConfig: AbstractStaticConfig;
  anticipationConfig: AbstractAnticipationConfig;
  regularSpinConfig: AbstractSpinConfig;
  freeSpinConfig: AbstractSpinConfig;
  giftSpinConfig: AbstractSpinConfig;
  iconWithValuesConfig: IconWithValuesConfig;
  getFakeConfig(name: string): any;
  getSlotFeatureConfig(type: any): any;
  getNamedConfig(name: string): AbstractSpinConfig | null;
}
