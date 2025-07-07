export class ContextMarshaller {
  static marshalAsync(action: () => void): void {
    Promise.resolve().then(action);
  }
}
