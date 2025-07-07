import { SceneObject } from '@cgs/syd';

export interface IFreeSpinsPopupViewUpdater {
  updateViewBeforeShowingPopup(view: SceneObject): void;
}
