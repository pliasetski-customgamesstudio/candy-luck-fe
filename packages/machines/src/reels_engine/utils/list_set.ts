export class ListSet<T> {
  private _set: Set<T> = new Set<T>();
  private _list: Array<T>;
  private _dirty: boolean = true;

  get list(): Array<T> {
    if (this._dirty) {
      this._list = Array.from(this._set);
      this._dirty = false;
    }
    return this._list;
  }

  add(value: T): boolean {
    const res = !this._set.has(value);
    if (res) {
      this._set.add(value);
    }
    this._dirty = this._dirty || res;
    return res;
  }

  remove(value: T): boolean {
    const res = this._set.delete(value);
    this._dirty = this._dirty || res;
    return res;
  }

  clear(): void {
    this._dirty = true;
    this._set.clear();
  }

  forEach(f: (element: T) => void): void {
    this.list.forEach(f);
  }
}
