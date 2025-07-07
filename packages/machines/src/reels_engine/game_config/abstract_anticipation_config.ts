export interface AbstractAnticipationConfig {
  anticipatedSpinSpeed: number;
  acceleratedDuration: number;
  anticipationReels: number[][];
  anticipationIcons: number[];
  stopBehaviorIcons: number[];
  minIconsForStopBehavior: number[];
  continueDurationAnticipating: number;
  continueDurationNotAnticipating: number;
  stopBehaviorReels: number[][];
  minIconsForAnticipation: number;
  minIconsForWin: number;
  slowDownAnticipatedSpinSpeed: number;
  maxSpeed: number;
  speedMultiplier: number;

  stopBehaviorConnectedIcons: number[][];
  stopBehaviorIconsByPos: number[];

  minIconsForAnticipationForSymbol(symbol: number): number;

  minIconsForWinForIcon(symbol: number): number;
}
