import { Random } from '@cgs/syd';
import { IBaseIterator } from './i_base_iterator';

export class RandomIterator<T> implements IBaseIterator<T> {
  private readonly _elements: T[];
  private readonly _random: Random = new Random();
  private _current: T;

  constructor(elements: T[]) {
    this._elements = elements;
  }

  get current(): T {
    return this._current;
  }

  next(): IteratorResult<T> {
    if (!this._elements.length) {
      return {
        done: true,
        value: this._current,
      };
    }

    this._current = this._elements[this._random.nextInt(this._elements.length)];
    return {
      done: false,
      value: this._current,
    };
  }
}
