export abstract class ResourceBase {
  public readonly id: string;
  protected constructor(id: string) {
    this.id = id;
  }

  abstract get typeId(): string;
  abstract destroy(): void;
}

export abstract class Resource<T> extends ResourceBase {
  private _data: T | null = null;

  get data(): T | null {
    return this._data;
  }

  construct(data: T | null): void {
    this._data = data;
  }

  destroy(): void {
    this._data = null;
  }
}
