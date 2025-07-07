import { Random } from '@cgs/syd';
import { IBaseIterator } from './i_base_iterator';

export class UniqueIterator<T> implements IBaseIterator<T> {
  private _currentTemplate: T[] = [];
  private readonly _random: Random = new Random();
  private readonly _template: T[];
  private _current: T;

  constructor(template: T[]) {
    if (template.length < 2) {
      throw new Error('Template must have at least 2 elements');
    }
    this._template = template;
  }

  unusedItems(): T[] {
    return this._currentTemplate;
  }

  next(): IteratorResult<T> {
    if (this._currentTemplate.length === 0) {
      this._currentTemplate = [...this._template];
    }

    let random: T;
    do {
      random = this._currentTemplate[this._random.nextInt(this._currentTemplate.length)];
    } while (random === this._current);

    this._current = random;
    this._currentTemplate = this._currentTemplate.filter((item) => item !== this._current);

    return {
      done: false,
      value: this._current,
    };
  }

  get current(): T {
    return this._current;
  }
}
