export interface ISlotGameEngine {
  isSlotAccelerated: boolean;
  isSlotStopped: boolean;
  getAnimationIconIds(position: number): number[];
  getSoundIconIds(position: number): number[];
  getInitialIcons(): number[][];
  update(dt: number): void;
}
