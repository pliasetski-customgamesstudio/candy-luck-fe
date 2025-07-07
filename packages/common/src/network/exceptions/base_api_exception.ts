import { ServerException } from '@cgs/network';

const NAME = 'BaseApiException';

export abstract class BaseApiException extends Error {
  public readonly name: string = NAME;

  private readonly innerMessage: string;
  public readonly innerException: ServerException;

  cause?: unknown;

  constructor(error: ServerException) {
    super(`${NAME}: ${error.toString()}`);
    this.innerMessage = error.toString();
    this.innerException = error;
  }
}
