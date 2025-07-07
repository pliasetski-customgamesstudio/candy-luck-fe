export interface IDisposable {
  dispose(): void;
}

export function objectIsDisposable(pet: IDisposable): pet is IDisposable {
  return pet.dispose && typeof pet.dispose === 'function';
}
