export class Queue<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  clear(): void {
    this.items = [];
  }

  forEach(callback: (item: T) => void): void {
    this.items.forEach(callback);
  }

  every(callback: (item: T) => boolean): boolean {
    return this.items.every(callback);
  }

  any(callback: (item: T) => boolean): boolean {
    return this.items.some(callback);
  }
}
