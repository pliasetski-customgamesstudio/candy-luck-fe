export interface IAuthorizationKeyStorage {
  // getAuthorizationKey(): StoredAuthorization | null;
  // removeAuthorizationKey(): void;
}

export class StoredAuthorization {
  private readonly _type: string;
  authorizationKey: string;

  constructor(authorizationKey: string, type: string) {
    this.authorizationKey = authorizationKey;
    this._type = type;
  }

  get hasType(): boolean {
    return !!this._type;
  }
}
