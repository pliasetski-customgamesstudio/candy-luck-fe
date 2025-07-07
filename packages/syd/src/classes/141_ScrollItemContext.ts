// TODO: Not so important on start, and probably isn't useful for slots anyway

// import { Index } from './28_Index';
// import {IScrollItem} from "./167_IScrollItem";
//
// export class ScrollItemContext {
//   private _order: number;
//   public scrollItem: IScrollItem;
//   public index: Index;
//
//   constructor(index: Index, scrollItem: IScrollItem) {
//     this.index = index;
//     this.scrollItem = scrollItem;
//     this._order = 0;
//   }
//
//   public setOrder(order: number): void {
//     if (this.scrollItem) {
//       const diff = order - this._order;
//       if (diff !== 0) {
//         for (let i = 0; i < this.scrollItem.views.length; i++) {
//           this.scrollItem.views[i].z += diff;
//         }
//         this._order = order;
//       }
//     }
//   }
//
//   public clone(): ScrollItemContext {
//     var result = new ScrollItemContext(this.index.clone(), this.scrollItem);
//     result.setOrder(this._order);
//     return result
//   }
// }
