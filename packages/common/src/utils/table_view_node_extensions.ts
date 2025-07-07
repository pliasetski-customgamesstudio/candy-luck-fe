// export class TableViewNodeExtensions {
//   static updateTableBounds(tableViewNode: TableViewSceneObject, defaultSize: Vector2): void {
//     tableViewNode.defaultColumnWidth = defaultSize.x;
//     tableViewNode.defaultRowHeight = defaultSize.y;
//   }

//   static updateTableModel(
//     tableViewNode: TableViewSceneObject,
//     scrollModel: AbstractTableModel,
//     scrollBinding: DataViewBinding
//   ): void {
//     tableViewNode.dataModel = scrollModel;
//     tableViewNode.binding = scrollBinding;
//     if (!tableViewNode.isInitialized) {
//       tableViewNode.initialize();
//     }
//   }

//   static checkTableScrollIsValid(tableViewNode: TableViewSceneObject): void {
//     if (tableViewNode.contentOffset.y > tableViewNode.contentSize.y) {
//       tableViewNode.scrollBehavior.cancel();
//       tableViewNode.contentOffset = new Vector2(
//         tableViewNode.contentOffset.x,
//         max(0.0, tableViewNode.contentSize.y - tableViewNode.size.y)
//       );
//     }
//   }

//   static updateScrollBarVisibility(
//     tableViewNode: TableViewSceneObject,
//     sliderNode: SceneObject
//   ): void {
//     sliderNode.visible = sliderNode.active = tableViewNode.contentSize.y > tableViewNode.size.y;
//   }

//   static updateScrollBarVisibilityList(
//     tableViewNode: TableViewSceneObject,
//     sliders: SceneObject[]
//   ): void {
//     for (let sliderNode of sliders) {
//       sliderNode.visible = sliderNode.active = tableViewNode.contentSize.y > tableViewNode.size.y;
//     }
//   }
// }
