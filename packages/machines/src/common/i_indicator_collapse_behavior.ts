import { BaseSlotGame } from '../game/base_slot_game';

export interface IIndicatorCollapseBehavior {
  slotGame: BaseSlotGame;
  clientPropertyFeatureName: string;
  collapseIndicator(): void;
}
