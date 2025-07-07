import { Container } from '@cgs/syd';
import { BonusConverterExtention } from './bonus_converter_extention';
import { BonusPickRequest } from '@cgs/network';
import { IBonusResponse, ISlotsApiService } from '@cgs/common';
import { SlotSession } from '../game/common/slot_session';
import { ISlotSessionProvider } from '../game/components/interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider } from '../type_definitions';
import { IMiniGameService } from '@cgs/features';

export class BonusService implements IMiniGameService {
  private _container: Container;
  private _slotsApiService: ISlotsApiService;

  constructor(c: Container, slotsApiService: ISlotsApiService) {
    this._container = c;
    this._slotsApiService = slotsApiService;
  }

  async send(selection: number, roundIndex: number, type: string): Promise<IBonusResponse> {
    const slotSession: SlotSession =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    const machineId: string = slotSession.GameId;
    const bonusRequest: BonusPickRequest = new BonusPickRequest();
    bonusRequest.pickedButtons = selection !== -1 ? [selection] : null;
    bonusRequest.roundNum = roundIndex;
    bonusRequest.machineId = machineId;
    bonusRequest.type = type;
    bonusRequest.bet = slotSession.currentBet.bet;

    const result = await this._slotsApiService.pickBonus(bonusRequest);

    return BonusConverterExtention.toInternalResponse(result)!;
  }
}
