declare function customGamesFindTextById(): void;
declare function clearArrayWithSearchObjects(): void;
declare function getCustomGamesFindTextById(): Record<string, string>;

declare function customGamesApplyCheat(): void;
declare function clearArrayWithCheatObjects(): void;
declare function isCustomGamesResetCheat(): boolean;
declare function customGamesResetCheat(): void;
declare function getCustomGamesCheats(): Record<string, string>;

declare function parseUA(): UAResult;

declare interface UAResult {
  ua: string;
  browser: UABrowser;
  engine: UAEngine;
  os: UAOs;
  device: UADevice;
  cpu: UACpu;
}

declare interface UABrowser {
  name: string;
  version: string;
}

declare interface UAEngine {
  name: string;
  version: string;
}

declare interface UAOs {
  name: string;
  version: string;
}

declare interface UADevice {
  model: string;
  type: string;
  vendor: string;
}

interface UACpu {
  architecture: string;
}

declare class UAParser {
  constructor();
  getResult(): UAResult;
  getBrowser(): UABrowser;
  getDevice(): UADevice;
  getEngine(): UAEngine;
  getOS(): UAOs;
  getCPU(): UACpu;
  getUA(): string;
  setUA(uastring: string): void;
}
