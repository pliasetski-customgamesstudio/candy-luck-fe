export class RestartNeededException implements Error {
  public readonly name: string = 'RestartNeededException';
  public readonly message: string;
  public readonly innerException: Error | null;

  constructor(message: string = '', exception: Error | null = null) {
    this.message = message;
    this.innerException = exception;
  }
}
