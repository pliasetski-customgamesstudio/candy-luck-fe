abstract class IAnimationGameEngineParams {
  abstract get slotPlaceholderId(): string;
  abstract get respinSlotPlaceholderId(): string;
  abstract get iconPlaceholderId(): string;
  abstract get showAnimName(): string;
  abstract get hideAnimName(): string;
  abstract get idleStateName(): string;
  abstract get iconContainerIdFormat(): string;
  abstract get iconIdFormat(): string;
  abstract get iconsStopEventTrackerId(): string;
  abstract get iconStopStateFormat(): string;
}
