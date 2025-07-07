export class Timer {
  private readonly duration: number;
  private readonly callback: () => void;
  private readonly isRepeating: boolean;
  private timerId: any;
  stopped: boolean;

  constructor(intervalMs: number, callback: () => void, isRepeating?: boolean) {
    if (intervalMs <= 10) {
      console.log(
        'Requesting Timer with interval ' +
          this.duration.toString() +
          '. Probably passing seconds instead of milliseconds?'
      );
    }
    if (intervalMs >= 1000 * 60 * 60 * 24) {
      console.log(
        'Requesting Timer with interval ' +
          this.duration.toString() +
          '. Probably passing microseconds instead of milliseconds?'
      );
    }

    this.stopped = true;
    this.duration = intervalMs;
    this.isRepeating = isRepeating ?? false;
    this.callback = callback;

    this.start();
  }

  cancel() {
    this.stop();
  }

  private start(): Timer {
    this.stopped = false;
    this.timerId = setTimeout(() => requestAnimationFrame(() => this.tick()), this.duration);
    return this;
  }

  private tick() {
    this.callback();

    if (this.isRepeating) {
      this.timerId = setTimeout(() => requestAnimationFrame(() => this.tick()), this.duration);
    }
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timerId);
  }
}
