import { SpinRequest, SpinResultResponse, ModularSpinResultResponse } from '@cgs/network';
import { EventDispatcher, EventStream } from '@cgs/syd';
import { ISlotApiWatcher, SlotsApiListenerBase } from '@cgs/common';

/*export class QualifyingBetFeatures extends Enum<string> {
  constructor(value: string) {
    super(value);
  }
}*/

export abstract class IQualifyingBetService {
  abstract get qualifyingBetChanged(): EventStream<void>;
  abstract get featureQualifyingBets(): Map<string, number>;
  abstract get qbGaugesLocked(): boolean;
  abstract set qbGaugesLocked(value: boolean);
}

export class QualifyingBetService implements IQualifyingBetService {
  private _slotApiWatcher: ISlotApiWatcher;
  private _slotListener: QualifyingBetSlotListener;
  private _featureQualifyingBets: Map<string, number>;
  private _qbGaugesLocked: boolean;
  private _qualifyingBetChangedDispatcher: EventDispatcher<void>;

  constructor(slotApiWatcher: ISlotApiWatcher) {
    this._slotApiWatcher = slotApiWatcher;
    this._slotListener = new QualifyingBetSlotListener(this);
    this._featureQualifyingBets = new Map<string, number>();
    this._qbGaugesLocked = false;
    this._qualifyingBetChangedDispatcher = new EventDispatcher();
    this._slotApiWatcher.registerListener(this._slotListener);
  }

  get featureQualifyingBets(): Map<string, number> {
    return this._featureQualifyingBets;
  }

  get qbGaugesLocked(): boolean {
    return this._qbGaugesLocked;
  }

  set qbGaugesLocked(value: boolean) {
    this._qbGaugesLocked = value;
  }

  get qualifyingBetChanged(): EventStream<void> {
    return this._qualifyingBetChangedDispatcher.eventStream;
  }

  updateQualifyingBets(bets: Map<string, number>): void {
    this._featureQualifyingBets = bets;
    this._qualifyingBetChangedDispatcher.dispatchEvent();
  }

  dispose(): void {
    this._slotApiWatcher.unregisterListener(this._slotListener);
  }
}

export class QualifyingBetSlotListener extends SlotsApiListenerBase {
  private _qualifyingBetService: QualifyingBetService;

  constructor(qualifyingBetService: QualifyingBetService) {
    super();
    this._qualifyingBetService = qualifyingBetService;
  }

  async onSpin(request: SpinRequest, result: SpinResultResponse): Promise<void> {
    this._qualifyingBetService.updateQualifyingBets(result.featureTotalQualifyBet!);
    return super.onSpin(request, result);
  }

  async onTutorialSpin(request: SpinRequest, result: SpinResultResponse): Promise<void> {
    this._qualifyingBetService.updateQualifyingBets(result.featureTotalQualifyBet!);
    return super.onTutorialSpin(request, result);
  }

  async onModularSpin(request: SpinRequest, result: ModularSpinResultResponse): Promise<void> {
    this._qualifyingBetService.updateQualifyingBets(result.featureTotalQualifyBet!);
    return super.onModularSpin(request, result);
  }
}
