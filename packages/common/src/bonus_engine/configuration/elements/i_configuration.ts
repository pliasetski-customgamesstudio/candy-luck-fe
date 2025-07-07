import { RoundConfiguration } from './round_configuration';
import { ResourcesConfiguration } from './resources_configuration';

export interface IConfiguration {
  rounds: RoundConfiguration[];
  sharedResources: ResourcesConfiguration[];
}
