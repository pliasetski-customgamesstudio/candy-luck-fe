export abstract class AudioSource {
  abstract setLoop(val: boolean): void;

  abstract setVolume(value: number): void;

  abstract setGlobalVolume(value: number): void;

  abstract isEnded: boolean;

  abstract play(): void;

  abstract stop(): void;

  abstract pause(): void;

  abstract resume(): void;
}
