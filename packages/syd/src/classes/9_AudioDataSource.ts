export class AudioDataSource {
  readonly uri: string;
  readonly type: string;

  constructor(uri: string, type: string) {
    this.uri = uri;
    this.type = type;
  }
}
