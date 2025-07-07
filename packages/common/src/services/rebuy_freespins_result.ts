import { Machine } from '@cgs/network';

export class ReBuyFreeSpinsResult {
  static readonly empty: ReBuyFreeSpinsResult = ReBuyFreeSpinsResult.none();
  readonly machine: Machine;

  constructor(machine: Machine) {
    this.machine = machine;
  }

  private static none(): ReBuyFreeSpinsResult {
    return new ReBuyFreeSpinsResult(Machine.empty());
  }
}
