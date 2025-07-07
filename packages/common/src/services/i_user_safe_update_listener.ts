export interface IUserSafeUpdateListener {
  afterUserChanged(): Promise<boolean>;
}
