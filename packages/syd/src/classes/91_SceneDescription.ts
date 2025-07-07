export class SceneDescription {
  private readonly _data: string;
  private _result: Record<string, any[]>;

  constructor(data: string) {
    this._data = data;
  }

  get nodes(): Record<string, any>[] {
    return this.resources['nodes'];
  }

  get actions(): Record<string, any>[] {
    return this.resources['actions'];
  }

  get states(): Record<string, any>[] {
    return this.resources['states'];
  }

  get signals(): Record<string, any>[] {
    return this.resources['signalEvents'];
  }

  get rules(): Record<string, any>[] {
    return this.resources['rules'];
  }

  get transitions(): Record<string, any>[] {
    return this.resources['transitions'];
  }

  private get resources(): Record<string, any[]> {
    if (!this._result) {
      const json = JSON.parse(this._data);
      this._result = json['resource'];
    }

    return this._result;
  }
}
