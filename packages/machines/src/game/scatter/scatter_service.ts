import { IBonusResponse, ISlotsApiService, T_ISlotsApiService } from '@cgs/common';
import { SlotSession } from '../common/slot_session';
import { Container } from '@cgs/syd';
import { ISlotSessionProvider } from '../components/interfaces/i_slot_session_provider';
import { T_ISlotSessionProvider } from '../../type_definitions';
import { BonusConverterExtention } from '../../bonus/bonus_converter_extention';
import { IMiniGameService } from '@cgs/features';
import { ScatterPickRequest } from '@cgs/network';

export class ScatterService implements IMiniGameService {
  private _service: ISlotsApiService;
  private _slotSession: SlotSession;

  constructor(container: Container) {
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._service = container.forceResolve<ISlotsApiService>(T_ISlotsApiService);
  }

  async send(selection: number, roundIndex: number, type: string): Promise<IBonusResponse | null> {
    const machineId = this._slotSession.GameId;
    const bonusRequest = new ScatterPickRequest();
    bonusRequest.pickedButtons = [selection];
    bonusRequest.scatterRound = roundIndex;
    bonusRequest.machineId = machineId;
    bonusRequest.type = type;

    const result = await this._service.pickScatter(bonusRequest);

    return BonusConverterExtention.toInternalResponse(result);
  }
}
