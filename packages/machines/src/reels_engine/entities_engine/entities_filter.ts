export class FilterMask {
  mask1: number;
  mask2: number;
  constructor(filterMask1: number, filterMask2: number) {
    this.mask1 = filterMask1;
    this.mask2 = filterMask2;
  }
  equals(other: FilterMask): boolean {
    return other.mask1 === this.mask1 && other.mask2 === this.mask2;
  }
  or(other: FilterMask): FilterMask {
    const filter = new FilterMask(0, 0);
    filter.mask1 = this.mask1 | other.mask1;
    filter.mask2 = this.mask2 | other.mask2;
    return filter;
  }
  and(other: FilterMask): FilterMask {
    const filter = new FilterMask(0, 0);
    filter.mask1 = this.mask1 & other.mask1;
    filter.mask2 = this.mask2 & other.mask2;
    return filter;
  }
  xor(other: FilterMask): FilterMask {
    const filter = new FilterMask(0, 0);
    filter.mask1 = this.mask1 ^ other.mask1;
    filter.mask2 = this.mask2 ^ other.mask2;
    return filter;
  }
  lessThan(other: FilterMask): boolean {
    if (this.mask2 < other.mask2) {
      return true;
    } else if (this.mask2 === other.mask2) {
      if (this.mask1 < other.mask1) {
        return true;
      }
    }
    return false;
  }
}

export class EntitiesFilter {
  mask: FilterMask;

  constructor(filterMask: FilterMask) {
    this.mask = filterMask;
  }
  equals(other: EntitiesFilter): boolean {
    return other.mask.equals(this.mask);
  }
  get hashCode(): number {
    return this.mask.mask1 | this.mask.mask2;
  }
}
