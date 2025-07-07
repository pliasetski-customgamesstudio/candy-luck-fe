import { EventStream, EventDispatcher } from '@cgs/syd';

export interface ISlotPopupCoordinator {
  popupShown: EventStream<string>;
  popupHidden: EventStream<string>;

  isPopupShown(): boolean;

  onPopupShown(popupId: string): void;
  onPopupHidden(popupId: string): void;
}

export class SlotPopupCoordinator implements ISlotPopupCoordinator {
  private _popupCount: number = 0;
  private _popupShownEventDispatcher: EventDispatcher<string> = new EventDispatcher<string>();
  private _popupHiddenEventDispatcher: EventDispatcher<string> = new EventDispatcher<string>();

  get popupShown(): EventStream<string> {
    return this._popupShownEventDispatcher.eventStream;
  }

  get popupHidden(): EventStream<string> {
    return this._popupHiddenEventDispatcher.eventStream;
  }

  isPopupShown(): boolean {
    return this._popupCount > 0;
  }

  onPopupShown(popupId: string): void {
    this._popupCount++;
    this._popupShownEventDispatcher.dispatchEvent(popupId);
  }

  onPopupHidden(popupId: string): void {
    this._popupCount--;
    this._popupHiddenEventDispatcher.dispatchEvent(popupId);
  }
}
