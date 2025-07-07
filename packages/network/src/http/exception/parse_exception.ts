export class ParseException implements Error {
  public readonly inner: Error;
  public readonly name: string = 'ParseException';
  public readonly message: string;

  constructor(inner: any) {
    this.inner = inner;
    this.message = this.toString();
  }

  toString(): string {
    return this.inner.toString();
  }
}
