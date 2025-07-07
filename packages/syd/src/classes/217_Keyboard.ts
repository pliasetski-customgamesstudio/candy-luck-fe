import { EventDispatcher } from './78_EventDispatcher';
import { CGSKeyboardEvent } from './42_KeyboardEvent';
import { IKeyListener } from './101_IKeyListener';
import { EventStreamProvider } from './192_EventStreamProvider';
import { EventStream } from './22_EventStreamSubscription';

export class Keyboard {
  private _canvas: HTMLCanvasElement;
  private _onKeyDownEvent: EventDispatcher<CGSKeyboardEvent> =
    new EventDispatcher<CGSKeyboardEvent>();
  private _onKeyPressEvent: EventDispatcher<CGSKeyboardEvent> =
    new EventDispatcher<CGSKeyboardEvent>();
  private _onKeyUpEvent: EventDispatcher<CGSKeyboardEvent> =
    new EventDispatcher<CGSKeyboardEvent>();
  private _activeListener: IKeyListener | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;

    EventStreamProvider.subscribeTarget(window, 'keydown', (event) => this._onKeyDown(event));
    EventStreamProvider.subscribeTarget(window, 'keyup', (event) => this._onKeyUp(event));
    EventStreamProvider.subscribeTarget(window, 'keypress', (event) => this._onKeyPress(event));
  }

  public get activeListener(): IKeyListener | null {
    return this._activeListener;
  }

  public get keyDown(): EventStream<CGSKeyboardEvent> {
    return this._onKeyDownEvent.eventStream;
  }

  public get keyPress(): EventStream<CGSKeyboardEvent> {
    return this._onKeyPressEvent.eventStream;
  }

  public get keyUp(): EventStream<CGSKeyboardEvent> {
    return this._onKeyUpEvent.eventStream;
  }

  public setActiveListener(listener: IKeyListener): void {
    this._activeListener = listener;
  }

  public removeListener(listener: IKeyListener): void {
    if (this._activeListener === listener) {
      this._activeListener = null;
    }
  }

  private _onKeyDown(e: Event): void {
    if (!(e instanceof KeyboardEvent)) {
      console.log('Wrong Keyboard event type');
      return;
    }
    const event = e as KeyboardEvent;

    const keyEvent = this._toInternalEvent(event);
    if (this._activeListener) {
      this._activeListener.onKeyDown(keyEvent);
      if (!keyEvent.isAccepted) {
        this._onKeyDownEvent.dispatchEvent(keyEvent);
      }
    } else {
      this._onKeyDownEvent.dispatchEvent(keyEvent);
    }
  }

  private _onKeyPress(e: Event): void {
    if (!(e instanceof KeyboardEvent)) {
      console.log('Wrong Keyboard event type');
      return;
    }
    const event = e as KeyboardEvent;
    const keyEvent = this._toInternalEvent(event);
    if (this._activeListener) {
      this._activeListener.onKeyPress(keyEvent);
      if (!keyEvent.isAccepted) {
        this._onKeyPressEvent.dispatchEvent(keyEvent);
      }
    } else {
      this._onKeyPressEvent.dispatchEvent(keyEvent);
    }
  }

  private _onKeyUp(e: Event): void {
    if (!(e instanceof KeyboardEvent)) {
      console.log('Wrong Keyboard event type');
      return;
    }
    const event = e as KeyboardEvent;

    const keyEvent = this._toInternalEvent(event);
    if (this._activeListener) {
      this._activeListener.onKeyUp(keyEvent);
      if (!keyEvent.isAccepted) {
        this._onKeyUpEvent.dispatchEvent(keyEvent);
      }
    } else {
      this._onKeyUpEvent.dispatchEvent(keyEvent);
    }
  }

  private _toInternalEvent(event: KeyboardEvent): CGSKeyboardEvent {
    return new CGSKeyboardEvent(
      event.keyCode,
      event.charCode,
      event.ctrlKey,
      event.altKey,
      event.shiftKey
    );
  }

  public activate(): void {
    this._canvas.focus();
  }
}
