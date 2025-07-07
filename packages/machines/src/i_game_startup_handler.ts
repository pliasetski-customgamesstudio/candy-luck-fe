export interface IGameStartupHandler {
  handleGameLoading(): void;
  handleGameUnloading(): Promise<void>;
}
