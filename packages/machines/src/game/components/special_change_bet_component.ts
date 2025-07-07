import { Container } from '@cgs/syd';

export class SpecialChangeBetComponent {
  private _container: Container;

  constructor(container: Container) {
    this._container = container;
  }

  public SetMinBet(userTriggered: boolean): void {}

  public SetMaxBet(userTriggered: boolean): void {}

  public ChangeBetIndex(indexDelta: number, userTriggered: boolean): void {}

  public SetXtremeMaxBet(userTriggered: boolean): void {}
}
