export interface IFreeSpinsModeProvider {
  get AllViews(): string[] | null;
  get modePickerId(): string | null;
  get groupMarker(): string | null;
  get currentMode(): string | null;
  setMode(symbolId: string): void;
}
