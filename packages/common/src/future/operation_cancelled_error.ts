export class OperationCancelledError implements Error {
  public readonly name: string = 'OperationCancelledError';
  public readonly message: string;

  constructor(message?: string) {
    this.message = message || 'Operation cancelled.';
  }
}
