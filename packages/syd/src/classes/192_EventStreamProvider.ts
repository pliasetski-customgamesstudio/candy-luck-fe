import { IStreamSubscription, SydEventListener } from './22_EventStreamSubscription';

class EventTargetEventSubscription implements IStreamSubscription {
  private readonly _eventTarget: EventTarget;
  private readonly _eventName: string;
  private readonly _useCapture: boolean;
  private readonly _onData: SydEventListener<Event>;

  constructor(
    target: EventTarget,
    eventName: string,
    onData: SydEventListener<Event>,
    useCapture: boolean = false
  ) {
    this._eventTarget = target;
    this._eventName = eventName;
    this._useCapture = useCapture;
    this._onData = onData;

    this._eventTarget.addEventListener(eventName, this._onData, useCapture);
  }

  cancel(): void {
    this._eventTarget.removeEventListener(this._eventName, this._onData, this._useCapture);
  }
}

class EventTargetEventSubscriptionTyped<T extends Event>
  implements IStreamSubscription, EventListenerObject
{
  private readonly _eventType: { new (...args: any[]): T };
  private readonly _eventTarget: EventTarget;
  private readonly _type: string;
  private readonly _useCapture: boolean;
  private readonly _onData: SydEventListener<T>;

  constructor(
    e: EventTarget,
    type: string,
    eventType: { new (...args: any[]): T },
    onData: SydEventListener<T>,
    useCapture: boolean = false
  ) {
    this._eventType = eventType;
    this._eventTarget = e;
    this._type = type;
    this._onData = onData;
    this._useCapture = useCapture;
    this._eventTarget.addEventListener(type, this, useCapture);
  }

  handleEvent(object: Event): void {
    if (object instanceof this._eventType) {
      this._onData(object);
    }
  }

  cancel(): void {
    this._eventTarget.removeEventListener(this._type, this, this._useCapture);
  }
}

class ElementEventSubscription implements IStreamSubscription {
  private readonly _element: Element;
  private readonly _type: string;
  private readonly _useCapture: boolean;
  private readonly _onData: SydEventListener<Event>;

  constructor(
    e: Element,
    type: string,
    onData: SydEventListener<Event>,
    useCapture: boolean = false
  ) {
    this._element = e;
    this._type = type;
    this._onData = onData;
    this._useCapture = useCapture;
    this._element.addEventListener(type, this._onData, useCapture);
  }

  cancel(): void {
    this._element.removeEventListener(this._type, this._onData, this._useCapture);
  }
}

export class ElementEventSubscriptionTyped<T extends Event>
  implements IStreamSubscription, EventListenerObject
{
  private readonly _eventType: { new (...args: any[]): T };
  private readonly _element: Element;
  private readonly _type: string;
  private readonly _useCapture: boolean;
  private readonly _onData: SydEventListener<T>;

  constructor(
    e: Element,
    type: string,
    eventType: { new (...args: any[]): T },
    onData: SydEventListener<T>,
    useCapture: boolean = false
  ) {
    this._element = e;
    this._type = type;
    this._eventType = eventType;
    this._useCapture = useCapture;
    this._element.addEventListener(type, this, useCapture);
  }

  handleEvent(object: Event): void {
    if (object instanceof this._eventType) {
      this._onData(object);
    }
  }

  cancel(): void {
    this._element.removeEventListener(this._type, this, this._useCapture);
  }
}

export class EventStreamProvider {
  public static subscribeTargetTyped<T extends Event>(
    target: EventTarget,
    type: string,
    onData: SydEventListener<T>,
    eventType: { new (...args: any[]): T },
    useCapture: boolean = false
  ): IStreamSubscription {
    return new EventTargetEventSubscriptionTyped<T>(target, type, eventType, onData, useCapture);
  }

  public static subscribeTarget(
    target: EventTarget,
    eventName: string,
    eventCallback: SydEventListener<Event>,
    useCapture: boolean = false
  ): IStreamSubscription {
    return new EventTargetEventSubscription(target, eventName, eventCallback, useCapture);
  }

  public static subscribeElementTyped<T extends Event>(
    element: Element,
    type: string,
    onData: SydEventListener<T>,
    eventType: { new (...args: any[]): T },
    useCapture: boolean = false
  ): IStreamSubscription {
    return new ElementEventSubscriptionTyped<T>(element, type, eventType, onData, useCapture);
  }

  public static subscribeElement(
    element: Element,
    type: string,
    onData: SydEventListener<Event>,
    useCapture: boolean = false
  ): IStreamSubscription {
    return new ElementEventSubscription(element, type, onData, useCapture);
  }
}
