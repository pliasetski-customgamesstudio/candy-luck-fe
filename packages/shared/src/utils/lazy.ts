// Callback used to lazily create an object of type T.
type CachedObjectFactory<T> = () => T;

// A class that caches an object of type T.
// The cache is populated when the object is first accessed.
export class Lazy<T> {
  // Callback used to create the cached object.
  private readonly objectFactory: CachedObjectFactory<T>;
  private _cache: T;
  private _isUpToDate: boolean = false;

  // Constructs a lazy object.
  constructor(objectFactory: CachedObjectFactory<T>) {
    this.objectFactory = objectFactory;
  }

  // Returns the cached object.
  // The object is initialized when first accessed.
  // To re-initialize the cached object use the
  // optional parameter updateCache.
  call(updateCache: boolean = false): T {
    if (updateCache || !this._isUpToDate) {
      this._isUpToDate = true;
      return (this._cache = this.objectFactory());
    } else {
      return this._cache;
    }
  }

  // After calling this function the cached object is
  // (lazily) re-initialized.
  updateCache(): void {
    this._isUpToDate = false;
  }

  // Returns true if the cached object has been initialized and is
  // up-to-date.
  get isUpToDate(): boolean {
    return this._isUpToDate;
  }

  toString(): string {
    const data = this.call();
    const className = data?.constructor?.name || 'T';
    return `Lazy<${className}>: ${data}`;
  }
}
