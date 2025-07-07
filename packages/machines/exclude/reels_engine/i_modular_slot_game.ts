import { ISlotGame } from 'package:machines/src/reels_engine_library';

export interface IModularSlotGame extends ISlotGame {
  modules: ISlotGameModule[];
}
