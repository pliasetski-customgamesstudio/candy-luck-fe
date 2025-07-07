import { Container } from '@cgs/syd';
import { StickyMaxBetProvider } from './sticky_max_bet_provider';

export class StubStickyMaxBetProvider extends StickyMaxBetProvider {
  constructor(container: Container) {
    super(container);
  }

  get isStickyBetAvailable(): boolean {
    return false;
  }

  updateMaxBet(): void {}
}
