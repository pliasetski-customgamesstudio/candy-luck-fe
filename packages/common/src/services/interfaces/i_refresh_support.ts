export interface IRefreshSupport {
  lastRefresh: Date;
  resetData(): void;
}
