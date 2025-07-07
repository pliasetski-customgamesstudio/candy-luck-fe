export interface IQualifyingBetSupport {
  isEnabled(): boolean;
  qbFeatureName: string;
  qbInCoins: boolean;
  getQb(): number;
  getQbMultiplier(): number;
  isBetToastsNeeded(): boolean;
  unqualifiedBetToastInterval: number;
  notMaxBetToastInterval: number;
  showUnqualifiedBetToast(): void;
  showNotMaxBetToast(): void;
  disableIndicator(): void;
  enableIndicator(): void;
  setTotalQb(qb: number): void;
  refreshQb(): Promise<void>;
}
