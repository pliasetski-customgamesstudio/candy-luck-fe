export abstract class ResponseProvider<TResponse> {
  doRequest(isFreeSpins: boolean = true): Promise<TResponse> {
    throw new Error('Method not implemented.');
    // implementation goes here
  }
}
