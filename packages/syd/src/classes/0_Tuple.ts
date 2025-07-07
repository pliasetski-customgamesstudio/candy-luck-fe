export class Tuple<T1, T2> {
  readonly item1: T1;
  readonly item2: T2;

  constructor(item1: T1, item2: T2) {
    this.item1 = item1;
    this.item2 = item2;
  }
}
