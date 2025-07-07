import { SlotCheat } from './SlotCheat';

export class SpinParams {
  actionIds: Array<number>;
  bet: number | null;
  betType: string | null;
  cheat: SlotCheat;
  fastSpin: boolean | null;
  freeSpin: boolean | null;
  lines: number | null;
  machineId: string | null;
  volatility: number | null;
  spinMode: number | null;

  toJson(): Record<string, unknown> {
    return {
      actionIds: this.actionIds,
      bet: this.bet,
      betType: this.betType,
      cheat: this.cheat.toJson(),
      fastSpin: this.fastSpin,
      freeSpin: this.freeSpin,
      lines: this.lines,
      machineId: this.machineId,
      volatility: this.volatility,
      spinMode: this.spinMode,
    };
  }
}
