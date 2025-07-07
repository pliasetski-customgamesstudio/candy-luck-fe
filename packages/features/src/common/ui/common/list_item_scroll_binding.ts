// import { IChildViewCreator, IScrollItem, Index, SceneObject } from "@cgs/common";
// import { DataViewBinding } from 'syd';
//
// class ListItemScrollBinding<TModel, TView extends SceneObject> extends DataViewBinding {
//   private _childProvider: IChildViewCreator<TView>;
//
//   constructor(childProvider: IChildViewCreator<TView>) {
//     super();
//     this._childProvider = childProvider;
//   }
//
//   dataTypeToItemType(type: any, index: Index): any {
//     if (type === TModel) {
//       return TView;
//     }
//     return null;
//   }
//
//   createItemByType(type: any): IScrollItem {
//     if (type === TView) {
//       return this._childProvider.getChildView() as IScrollItem;
//     }
//     return null;
//   }
//
//   setDataInternal(so: IScrollItem, index: Index, data: any, role: number): void {
//     so.setData(data);
//   }
// }
