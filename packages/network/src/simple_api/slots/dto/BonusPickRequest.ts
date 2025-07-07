import { IBaseRequest } from '../../../api/i_base_request';
import { IDtoObject } from '../../../simple_api_request_service';

export class BonusPickRequest implements IBaseRequest, IDtoObject {
  roundNum: number;
  machineId: string;
  pickedButtons: number[] | null;
  sequenceNumber: number;
  session: string;
  userId: string | null;
  externalUserId: string | null;
  type: string;
  bet: number;

  toJson(): Record<string, unknown> {
    return {
      roundNum: this.roundNum,
      machineId: this.machineId,
      pickedButtons: this.pickedButtons,
      sequenceNumber: this.sequenceNumber,
      session: this.session,
      userId: this.userId,
      externalUserId: this.externalUserId,
      type: this.type,
      bet: this.bet,
    };
  }
}
