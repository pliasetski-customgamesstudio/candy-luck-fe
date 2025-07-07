// import { AbstractTableModel, IUpdatableScrollModel, Index } from 'syd/syd';
//
// abstract class UpdatableScrollModelBase<TModel extends ModelBase> extends AbstractTableModel implements IUpdatableScrollModel {
//   private _models: TModel[];
//
//   constructor(models: TModel[]) {
//     super();
//     this._models = models;
//   }
//
//   get models(): TModel[] {
//     return this._models;
//   }
//
//   data(index: Index): any {
//     const modelIndex = this.getModelIndex(index);
//     return (modelIndex < this.models.length) ? this.models[modelIndex] : null;
//   }
//
//   abstract getModelIndex(index: Index): number;
//
//   abstract getIndex(i: number): Index;
//
//   updateModel(model: ModelBase): void {
//     if (!(model instanceof TModel)) {
//       throw new Error("Wrong newInstance type");
//     }
//     for (let i = 0; i < this.models.length; i++) {
//       const currentModel = this.models[i];
//       if (currentModel && currentModel.id === model.id) {
//         this.onModelUpdating(model, currentModel);
//         this.models[i] = model;
//
//         this.onDataChanged(this.getIndex(i), this.getIndex(i));
//         break;
//       }
//     }
//   }
//
//   onModelUpdating(newInstance: TModel, oldInstance: TModel): void {}
//
//   getIndexByModel(model: TModel): Index {
//     for (let i = 0; i < this.models.length; i++) {
//       if (this.models[i].id === model.id) {
//         return this.getIndex(i);
//       }
//     }
//     return Index.none;
//   }
// }
