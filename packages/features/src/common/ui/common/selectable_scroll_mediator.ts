//
// interface ISelectableScrollMediator {
//   setup(): void;
//   teardown(): void;
//   updateSelectAllState(): void;
// }
//
// class SelectableScrollMediator implements ISelectableScrollMediator {
//   private _scroll: ISelectableScrollView;
//   private _selectActions: ISelectDependantActions;
//   private _onSelectAllSub: StreamSubscription;
//
//   constructor(scroll: ISelectableScrollView, selectActions: ISelectDependantActions) {
//     this._scroll = scroll;
//     this._selectActions = selectActions;
//   }
//
//   setup(): void {
//     this._onSelectAllSub = this._scroll.selectAllBtnClicked.subscribe((e) => this._onSelectAllClicked());
//   }
//
//   teardown(): void {
//     this._onSelectAllSub?.cancel();
//   }
//
//   private _onSelectAllClicked(): void {
//     if (this._scroll.selectableScrollModel) {
//       this._scroll.selectableScrollModel.selectAll(!this._scroll.selectableScrollModel.areAllModelsSelected());
//       this.updateSelectAllState();
//     }
//   }
//
//   updateSelectAllState(): void {
//     if (this._scroll.selectableScrollModel) {
//       if (!this._scroll.selectableScrollModel.hasModels()) {
//         this._scroll.hideSelectAll();
//       } else if (this._scroll.selectableScrollModel.areAllModelsSelected()) {
//         this._scroll.checkSelectAll();
//       } else {
//         this._scroll.uncheckSelectAll();
//       }
//       if (this._scroll.selectableScrollModel.areAnyModelsSelected()) {
//         this._selectActions.enableActions();
//       } else {
//         this._selectActions.disableActions();
//       }
//     }
//   }
// }
