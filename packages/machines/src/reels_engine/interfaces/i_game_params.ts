export abstract class IGameParams {
  abstract get machineId(): string;
  abstract get iconsCount(): number;
  abstract get groupsCount(): number;
  abstract get maxIconsPerGroup(): number;
}
