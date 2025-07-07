import { IAuthorizationKeyStorage } from '@cgs/shared';

export abstract class IAuthorizationHolder implements IAuthorizationKeyStorage {
  abstract get userId(): string | null;
  abstract set userId(id: string | null);
  abstract get session(): string;
  abstract get externalUserId(): string | null;
  abstract setAuthorization(authorizationKey: string, externalUserId: string | null): void;
}
