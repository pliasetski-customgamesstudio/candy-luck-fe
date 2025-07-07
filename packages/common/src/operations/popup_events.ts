import { EventDispatcher, EventStream } from '@cgs/syd';
import { IOperation } from './i_operation';

export const T_IPopupEvents = Symbol('IPopupEvents');
export interface IPopupEvents {
  popupShown: EventStream<IOperation>;
  popupHidden: EventStream<IOperation>;
  isPopupShown: boolean;

  onPopupShown(operation: IOperation): void;
  onPopupHidden(operation: IOperation): void;
}

export class PopupEvents implements IPopupEvents {
  private _popupCount: number = 0;
  private _popupShownDispatcher: EventDispatcher<IOperation> = new EventDispatcher();

  get popupShown(): EventStream<IOperation> {
    return this._popupShownDispatcher.eventStream;
  }

  private _popupHiddenDispatcher: EventDispatcher<IOperation> = new EventDispatcher();

  get popupHidden(): EventStream<IOperation> {
    return this._popupHiddenDispatcher.eventStream;
  }

  get isPopupShown(): boolean {
    return this._popupCount > 0;
  }

  onPopupShown(operation: IOperation): void {
    this._popupCount++;
    this._popupShownDispatcher.dispatchEvent(operation);
  }

  onPopupHidden(operation: IOperation): void {
    this._popupCount--;
    this._popupHiddenDispatcher.dispatchEvent(operation);
  }
}
