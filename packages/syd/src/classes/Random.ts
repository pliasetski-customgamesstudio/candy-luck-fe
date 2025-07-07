export class Random {
  nextInt(max: number): number {
    return Math.floor(Math.random() * (max));
  }

  nextDouble(): number {
    return Math.random();
  }

  integer(start: number, end: number): number {
    return Math.floor(this.nextDouble() * (end - start + 1)) + start;
  }
}
