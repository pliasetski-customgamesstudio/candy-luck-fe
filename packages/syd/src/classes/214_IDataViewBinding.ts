// TODO: Not so important on start, and probably isn't useful for slots anyway

// import { Tuple } from './0_Tuple';
// import { ScrollItemContext } from './141_ScrollItemContext';
// import { Vector2 } from './15_Vector2';
// import { IScrollItem } from './167_IScrollItem';
// import { Index } from './28_Index';
// import { IDisposable } from './5_Disposable';
// import {EventStream} from "./22_EventStreamSubscription";
//
// export interface IDataViewBinding<T> extends IDisposable {
//   itemSizeChanged: EventStream<Tuple<IScrollItem<T>, Vector2>>;
//
//   createItemContext(index: Index, data: Object): ScrollItemContext;
//
//   setData(index: Index, so: IScrollItem<Vector2>, data: Object, role?: number): boolean;
//
//   cacheItemContext(so: ScrollItemContext): void;
//
//   sizeHint(index: Index, dataType: any): Vector2;
//
//   deinitialize(): void;
// }
