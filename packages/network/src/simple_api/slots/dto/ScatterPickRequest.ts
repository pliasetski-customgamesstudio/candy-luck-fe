import { IBaseRequest } from '../../../api/i_base_request';
import { IDtoObject } from '../../../simple_api_request_service';

export class ScatterPickRequest implements IBaseRequest, IDtoObject {
  machineId: string;
  pickedButtons: number[];
  scatterRound: number;
  sequenceNumber: number;
  session: string;
  userId: string | null;
  externalUserId: string | null;
  type: string;

  toJson(): Record<string, unknown> {
    return {
      machineId: this.machineId,
      pickedButtons: this.pickedButtons,
      scatterRound: this.scatterRound,
      sequenceNumber: this.sequenceNumber,
      session: this.session,
      userId: this.userId,
      externalUserId: this.externalUserId,
      type: this.type,
    };
  }
}
