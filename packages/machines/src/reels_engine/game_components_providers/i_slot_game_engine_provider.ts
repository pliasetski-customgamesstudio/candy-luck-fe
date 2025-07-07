import { ISlotGameEngine } from '../i_slot_game_engine';
import { IReelsEngineProvider } from './i_reels_engine_provider';
import { ReelsEngine } from '../reels_engine';

export abstract class ISlotGameEngineProvider implements IReelsEngineProvider {
  abstract reelsEngine: ReelsEngine;
  abstract get gameEngine(): ISlotGameEngine;
}
