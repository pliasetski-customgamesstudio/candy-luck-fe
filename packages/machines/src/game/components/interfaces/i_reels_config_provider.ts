import { IReelsConfig } from '../../../reels_engine/i_reels_config';

export abstract class IReelsConfigProvider {
  abstract get reelsConfig(): IReelsConfig;
}
