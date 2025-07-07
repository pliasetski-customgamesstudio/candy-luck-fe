// TODO: Not so important on start, and probably isn't useful for slots anyway

// import { LinkedList } from 'typescript-collections';
// import { EventDispatcher } from './78_EventDispatcher';
// import { ScrollSceneObject } from './285_ScrollSceneObject';
// import { Index } from './28_Index';
// import { AbstractModel } from './205_AbstractModel';
// import { GenericLinkedListEntry } from './6_GenericLinkedListEntry';
// import { ScrollItemContext } from './141_ScrollItemContext';
// import { Vector2 } from './15_Vector2';
// import { IDataViewBinding } from './214_IDataViewBinding';
//
// export abstract class AbstractScrollViewSceneObject extends ScrollSceneObject {
//   private _indexTouchDispatcher: EventDispatcher<Index> = new EventDispatcher<Index>();
//
//   get indexTouch(): Stream<Index> {
//     return this._indexTouchDispatcher.eventStream;
//   }
//
//   private _indexTouchUpDispatcher: EventDispatcher<Index> = new EventDispatcher<Index>();
//
//   get indexTouchUp(): Stream<Index> {
//     return this._indexTouchUpDispatcher.eventStream;
//   }
//
//   protected model: AbstractModel;
//   private _sizeMode: SizeMode = SizeMode.Keep;
//
//   private _currentList: LinkedList<GenericLinkedListEntry<ScrollItemContext>>;
//   private _tempList: LinkedList<GenericLinkedListEntry<ScrollItemContext>>;
//   private _binding: IDataViewBinding;
//
//   private _modelDataChangedSub: StreamSubscription;
//   private _bindingItemSizeChangedSub: StreamSubscription;
//
//   constructor(binding: IDataViewBinding) {
//     super(Vector2.Zero.clone());
//     this.binding = binding;
//
//     this._currentList = new LinkedList<GenericLinkedListEntry<ScrollItemContext>>();
//     this._tempList = new LinkedList<GenericLinkedListEntry<ScrollItemContext>>();
//     this.scroll.listen((offset) => this.updateContent(true));
//   }
//
//   abstract visibleIndexes(): VisualIndex[];
//
//   abstract visualRect(index: Index): Rect;
//
//   abstract beginUpdateContent(): void;
//
//   abstract endUpdateContent(): void;
//
//   abstract updateGeometry(): void;
//
//   abstract setContentSize(size: Vector2, index: Index): void;
//
//   initializeImpl(): void {
//     super.initializeImpl();
//     this.updateGeometry();
//     this.updateContent(true);
//   }
//
//   deinitializeImpl(): void {
//     this._flushCache();
//     this._binding?.deinitialize();
//     super.deinitializeImpl();
//   }
//
//   addContentScroll(itemView: IScrollItem): void {
//     if (itemView) {
//       for (let i = 0; i < itemView.views.length; i++) {
//         const node = itemView.views[i];
//         this.contentView.addChild(node);
//       }
//     }
//   }
//
//   removeContentScroll(itemView: IScrollItem): void {
//     if (itemView) {
//       for (let i = 0; i < itemView.views.length; i++) {
//         const node = itemView.views[i];
//         this.contentView.removeChild(node);
//       }
//     }
//   }
//
//   get sizeMode(): SizeMode {
//     return this._sizeMode;
//   }
//
//   set sizeMode(value: SizeMode) {
//     if (this._sizeMode !== value) {
//       this._sizeMode = value;
//       if (this.isInitialized) {
//         this.updateGeometry();
//         this.updateContent(true);
//       }
//     }
//   }
//
//   get dataModel(): AbstractModel {
//     return this.model;
//   }
//
//   set dataModel(value: AbstractModel) {
//     if (this._modelDataChangedSub) {
//       this._modelDataChangedSub.cancel();
//       this._modelDataChangedSub = null;
//     }
//     this.model = value;
//     if (this.model) {
//       this.model.dataChanged.listen((event) => this._onModelChanged(event));
//     }
//     this.onModelChanged();
//   }
//
//   get binding(): IDataViewBinding {
//     return this._binding;
//   }
//
//   set binding(value: IDataViewBinding) {
//     if (this._bindingItemSizeChangedSub) {
//       this._flushCache();
//       this._bindingItemSizeChangedSub.cancel();
//       this._bindingItemSizeChangedSub = null;
//     }
//     this._binding = value;
//     if (this._binding) {
//       this._binding.itemSizeChanged.listen((event) => this._onObjectSizeChanged(event));
//     }
//
//     this.onBindingChanged();
//   }
//
//   updateContent(setNewPositions: boolean): void {
//     if (this.dataModel && this.binding) {
//       this.beginUpdateContent();
//
//       const visibleList = this.visibleIndexes();
//       const vc = visibleList.length;
//       for (let i = 0; i < vc; i++) {
//         const visualIndex = visibleList[i];
//         let listNode = null;
//
//         let count = 0;
//         for (const node of this._currentList) {
//           if (node.value.index === visualIndex.index) {
//             listNode = node;
//             break;
//           }
//         }
//
//         let context: ScrollItemContext;
//         if (!listNode) {
//           const index = visualIndex.index;
//           context = this.binding.createItemContext(index, this.dataModel.data(index));
//           if (context.scrollItem) {
//             context.setOrder(this.model.orderRole(index));
//             const views = context.scrollItem.views;
//
//             for (let o = 0; o < views.length; o++) {
//               const node = views[o];
//               node.position = new Vector2(
//                 visualIndex.visualRect.lt.x, visualIndex.visualRect.lt.y);
//             }
//             if (this._sizeMode === SizeMode.Keep) {
//               const objSize = context.scrollItem.itemSize;
//               this.setContentSize(objSize, index);
//             }
//
//             this.addContentScroll(context.scrollItem);
//           }
//         } else {
//           context = listNode.value;
//
//           if (context.scrollItem && setNewPositions) {
//             const views = context.scrollItem.views;
//             for (let o = 0; o < views.length; o++) {
//               const node = views[o];
//               node.position = new Vector2(
//                 visualIndex.visualRect.lt.x, visualIndex.visualRect.lt.y);
//             }
//           }
//           this._currentList.remove(listNode);
//         }
//         this._tempList.add(new GenericLinkedListEntry(context));
//       }
//       this._flushCache();
//
//       const aux = this._tempList;
//       this._tempList = this._currentList;
//       this._currentList = aux;
//
//       this.endUpdateContent();
//     }
//   }
//
//   private _onObjectSizeChanged(o: Tuple<IScrollItem, Vector2>): void {
//     for (const node of this._currentList) {
//       const obj = node.value.scrollItem;
//       if (obj === o.item1) {
//         this.beginUpdateContent();
//         this.setContentSize(o.item2, node.value.index);
//         this.endUpdateContent();
//         break;
//       }
//     }
//   }
//
//   private _onModelChanged(o: Tuple3<Index, Index, number>): void {
//     const leftTop = o.item1;
//     const rightBottom = o.item2;
//     const role = o.item3;
//     if (this.isInitialized && leftTop.isValid && rightBottom.isValid) {
//       if (leftTop.model === rightBottom.model && leftTop.model === this.dataModel) {
//         const nodesToRemove: LinkedListEntry[] = [];
//         for (const node of this._currentList) {
//           const currIndex = node.value.index;
//           const context = node.value;
//           const cellItem = context.scrollItem;
//           if (currIndex.column >= leftTop.column &&
//             currIndex.column <= rightBottom.column &&
//             currIndex.row >= leftTop.row &&
//             currIndex.row <= rightBottom.row) {
//             if (!cellItem ||
//               !this.binding.setData(
//                 currIndex, cellItem, this.dataModel.data(currIndex), role)) {
//               this.binding.cacheItemContext(context);
//               this.removeContentScroll(cellItem);
//               nodesToRemove.push(node);
//             } else {
//               if (this.sizeMode === SizeMode.Keep) {
//                 const objSize = cellItem.itemSize;
//                 this.setContentSize(objSize, currIndex);
//               }
//             }
//           }
//         }
//
//         const count = nodesToRemove.length;
//         for (let i = 0; i < count; i++) {
//           this._currentList.remove(nodesToRemove[i]);
//         }
//         this.updateContent(false);
//       }
//     }
//   }
//
//   doIndexTouch(index: Index): void {
//     this._indexTouchDispatcher.dispatchEvent(index);
//   }
//
//   doIndexTouchUp(index: Index): void {
//     this._indexTouchUpDispatcher.dispatchEvent(index);
//   }
//
//   onBindingChanged(): void {
//     if (this.isInitialized) {
//       this.updateGeometry();
//       this.updateContent(true);
//     }
//   }
//
//   onModelChanged(): void {
//     if (this.isInitialized) {
//       this._flushCache();
//       this.updateGeometry();
//       this.updateContent(true);
//     }
//   }
//
//   private _flushCache(): void {
//     for (const node of this._currentList) {
//       const context = node.value;
//       this.removeContentScroll(context.scrollItem);
//       this.binding.cacheItemContext(context);
//     }
//     this._currentList.clear();
//   }
//
//   dispose(): void {
//     this._binding?.dispose();
//   }
// }
//
// export enum SizeMode { Keep, Fit }
