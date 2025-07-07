import { IBaseRequest } from '../../../api/i_base_request';
import { IDtoObject } from '../../../simple_api_request_service';

class KeyValueActionParam_String {
  key: string;
  value: string;
}

export class Machine {
  id: string;
  availableFromLevel: number | null = null;
  actionParams: KeyValueActionParam_String[] | null = null;
  sizeType: string | null = null;
  labels: string[] | null = null;

  static empty(): Machine {
    return new Machine();
  }
}

export interface SimpleBaseRequestData {
  session: string;
  userId: string | null;
  externalUserId: string | null;
}

export class SimpleBaseRequest implements IBaseRequest, IDtoObject, SimpleBaseRequestData {
  public static fromJson(json: SimpleBaseRequestData): SimpleBaseRequest {
    return new SimpleBaseRequest({
      session: json['session'],
      userId: json['userId'],
      externalUserId: json['externalUserId'] || null,
    });
  }

  session: string;
  userId: string | null;
  externalUserId: string | null;

  constructor({ session, userId, externalUserId }: SimpleBaseRequestData) {
    this.session = session;
    this.userId = userId;
    this.externalUserId = externalUserId;
  }

  public toJson(): SimpleBaseRequestData {
    return {
      session: this.session,
      userId: this.userId,
      externalUserId: this.externalUserId,
    };
  }
}
