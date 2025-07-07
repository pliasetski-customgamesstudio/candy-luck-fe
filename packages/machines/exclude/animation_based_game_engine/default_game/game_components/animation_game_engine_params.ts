import { IAnimationGameEngineParams } from 'machines';

class AnimationGameEngineParams implements IAnimationGameEngineParams {
  slotPlaceholderId: string;
  respinSlotPlaceholderId: string;
  iconPlaceholderId: string;
  showAnimName: string;
  hideAnimName: string;
  idleStateName: string;
  iconContainerIdFormat: string;
  iconIdFormat: string;
  iconsStopEventTrackerId: string;
  iconStopStateFormat: string;
}
