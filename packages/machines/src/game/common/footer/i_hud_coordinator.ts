import { EventStream } from '@cgs/syd';

export interface IHudCoordinator {
  isAvailable: boolean;
  canChangeBet: boolean;
  updateTotalWinAfterScatter: boolean;
  updateTotalWinOnRegularSpins: boolean;
  available: EventStream<void>;
  unavailable: EventStream<void>;
  enabled: EventStream<void>;
  disabled: EventStream<void>;
  hudEnable: EventStream<void>;
  hudDisable: EventStream<void>;
  onFullDisabled: EventStream<boolean>;
  raiseUnavailable(): void;
  enableHud(): void;
  disableHud(): void;
}
