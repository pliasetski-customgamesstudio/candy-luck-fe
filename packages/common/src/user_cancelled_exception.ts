export class UserCancelledException implements Error {
  public readonly name: string = 'UserCancelledException';

  constructor(public readonly message: string) {}
}
