// import { UpdatableScrollModelBase } from 'syd/syd';
//
// class SelectableItemScrollModel<TModel extends SelectableModelBase> extends UpdatableScrollModelBase<TModel> implements ISelectableScrollModel {
//   constructor(models: TModel[]) {
//     super(models);
//   }
//
//   onModelUpdating(newInstance: TModel, oldInstance: TModel): void {
//     newInstance.selected = oldInstance.selected;
//   }
//
//   areAllModelsSelected(): boolean {
//     return this.models.length === 0 || this.models.every((model) => model.selected);
//   }
//
//   get selectedModelsCount(): number {
//     return this.models.filter((m) => m.selected).length;
//   }
//
//   areAnyModelsSelected(): boolean {
//     return this.models.length !== 0 && this.models.some((model) => model.selected);
//   }
//
//   get columnsCount(): number {
//     return 2;
//   }
//
//   getIndex(i: number): Index {
//     return new Index(this, Math.floor(i / 2), i % 2);
//   }
//
//   getModelIndex(index: Index): number {
//     return index.row * 2 + index.column;
//   }
//
//   hasModels(): boolean {
//     return this.models !== null && this.models.length !== 0;
//   }
//
//   get rowsCount(): number {
//     return Math.floor(this.models.length / 2) + this.models.length % 2;
//   }
//
//   selectAll(select: boolean): void {
//     for (let model of this.models) {
//       model.selected = select;
//     }
//     this.onDataChanged(new Index(this, 0, 0), new Index(this, this.rowsCount - 1, this.columnsCount - 1));
//   }
// }
