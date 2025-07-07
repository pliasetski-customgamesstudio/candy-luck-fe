// TODO: Not so important on start, and probably isn't useful for slots anyway

// export abstract class DataViewBinding implements IDataViewBinding {
//   private _itemSizeChangedDispatcher: EventDispatcher<Tuple<IScrollItem, Vector2>> = new EventDispatcher<Tuple<IScrollItem, Vector2>>();
//
//   public get itemSizeChanged(): Stream<Tuple<IScrollItem, Vector2>> {
//     return this._itemSizeChangedDispatcher.eventStream;
//   }
//
//   private _cache: Map<Type, Queue<IScrollItem>>;
//
//   constructor() {
//     this._cache = new Map<Type, Queue<IScrollItem>>();
//   }
//
//   public abstract dataTypeToItemType(type: Type, index: Index): Type;
//
//   public abstract createItemByType(type: Type): IScrollItem;
//
//   public setDataInternal(so: IScrollItem, index: Index, data: Object, role: number): void {
//     // implementation
//   }
//
//   public sizeHint(index: Index, dataType: Type): Vector2 {
//     return Vector2.Zero.clone();
//   }
//
//   public createItemContext(index: Index, data: Object): ScrollItemContext {
//     const dataType: Type = data?.runtimeType;
//     const objType: Type = this.dataTypeToItemType(dataType, index);
//     const context: ScrollItemContext = this.createContextByType(objType, index);
//     if (context.scrollItem) {
//       this.setData(index, context.scrollItem, data);
//     }
//     return context;
//   }
//
//   public createContextByType(type: Type, index: Index): ScrollItemContext {
//     let item: IScrollItem = null;
//     if (type) {
//       item = this.getItemFromCache(type) ?? this.createItemByType(type);
//     }
//     return new ScrollItemContext(index, item);
//   }
//
//   public setData(index: Index, item: IScrollItem, data: Object, role: number = 0): boolean {
//     let result: boolean = false;
//     if (item && data ) {
//       const dataType: Type = data.runtimeType;
//       if (item.runtimeType == this.dataTypeToItemType(dataType, index)) {
//         this.setDataInternal(item, index, data, role);
//         result = true;
//       }
//     }
//     return result;
//   }
//
//   public cacheItemContext(context: ScrollItemContext): void {
//     const item: IScrollItem = context.scrollItem;
//     if (item ) {
//       context.setOrder(0);
//       const type: Type = item.runtimeType;
//       const cachedObjects: Queue<IScrollItem> = this._cache.get(type) ?? new Queue<IScrollItem>();
//       cachedObjects.addFirst(item);
//       this._cache.set(type, cachedObjects);
//     }
//   }
//
//   public getItemFromCache(type: Type): IScrollItem {
//     let item: IScrollItem = null;
//     const cachedObjects: Queue<IScrollItem> = this._cache.get(type);
//     if (cachedObjects  && cachedObjects.isNotEmpty) {
//       item = cachedObjects.removeFirst();
//     }
//     return item;
//   }
//
//   public deinitialize(): void {
//     this._cache.forEach((k, v) => {
//       for (const item of v) {
//         for (let i = 0; i < item.views.length; i++) {
//           (item.views[i] as SceneObject).deinitialize();
//         }
//       }
//     });
//   }
//
//   public dispose(): void {
//     this._cache.forEach((k, v) => {
//       for (const item of v) {
//         item.dispose();
//       }
//     });
//   }
// }
