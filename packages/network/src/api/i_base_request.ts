export interface IBaseRequest {
  session: string;
  userId: string | null;
  externalUserId: string | null;
}

export function f_isIBaseRequest(obj: any): obj is IBaseRequest {
  return obj && typeof obj.session === 'string' && typeof obj.userId === 'number';
}
