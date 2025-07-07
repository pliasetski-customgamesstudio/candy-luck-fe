import { HttpException } from '@cgs/network';

export class NotEnoughBalanceException implements Error {
  public readonly name: string = 'NotEnoughBalanceException';
  public readonly message: string;
  private readonly innerMessage: string;
  private readonly innerException: HttpException | null;

  constructor(error: string | HttpException) {
    if (typeof error === 'string') {
      this.innerMessage = error;
      this.innerException = null;
    } else {
      this.innerMessage = error.toString();
      this.innerException = error;
    }
    this.message = `${this.name}: ${this.innerMessage}`;
  }
}
