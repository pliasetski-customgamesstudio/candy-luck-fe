// export class EventStream<T> implements ReadableStream<T> {
//   private _target: EventTarget;
//   private _eventType: string;
//   private _useCapture: boolean;

//   constructor(target: EventTarget, eventType: string, useCapture: boolean) {
//     this._target = target;
//     this._eventType = eventType;
//     this._useCapture = useCapture;
//   }

//   // DOM events are inherently multi-subscribers.
//   public asBroadcastStream(): ReadableStream<T> {
//     return this;
//   }

//   public get isBroadcast(): boolean {
//     return true;
//   }

//   public subscribe(observer: Partial<Observer<T>>): Subscription {
//     const { next, error, complete } = observer;

//     const eventListener = (event: T) => {
//       if (next) {
//         next(event);
//       }
//     };

//     this._target.addEventListener(this._eventType, eventListener, {
//       capture: this._useCapture,
//     });

//     return {
//       unsubscribe: () => {
//         this._target.removeEventListener(this._eventType, eventListener, {
//           capture: this._useCapture,
//         });

//         if (complete) {
//           complete();
//         }
//       },
//     };
//   }
// }

// /**
//  * Adapter for exposing DOM Element events as streams, while also allowing
//  * event delegation.
//  */
