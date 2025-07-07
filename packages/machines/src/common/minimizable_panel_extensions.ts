// import { NodeUtils } from '@cgs/shared';

// export class MinimizablePanelExtensions {
//   static hideShowPanelOnCondition(view: IMinimizablePanel, condition: () => boolean): void {
//     if (condition()) {
//       if (
//         NodeUtils.isAnyActiveState(view.minimizableNode, ['default', 'maximize', 'maximize_bonus'])
//       ) {
//         view.minimizableNode.stateMachine.switchToState('minimize_bonus');
//       }
//     } else {
//       if (view.minimizableNode.stateMachine.isActive('minimize_bonus')) {
//         view.minimizableNode.stateMachine.switchToState('maximize_bonus');
//       }
//     }
//   }

//   /**
//    * Switches expanded state of the panel
//    * Returns true if panel was maximized during this process, or false otherwise
//    */
//   static switchExpandedState(view: IMinimizablePanel): boolean {
//     let expanded = false;

//     if (
//       NodeUtils.isAnyActiveState(view.minimizableNode, ['default', 'maximize', 'maximize_bonus'])
//     ) {
//       expanded = false;
//       view.minimizableNode.stateMachine.switchToState('minimize');
//     } else if (view.minimizableNode.stateMachine.isActive('minimize')) {
//       expanded = true;
//       view.minimizableNode.stateMachine.switchToState('maximize');
//     } else if (view.minimizableNode.stateMachine.isActive('minimize_bonus')) {
//       expanded = true;
//       view.minimizableNode.stateMachine.switchToState('maximize_bonus');
//     }
//     return expanded;
//   }
// }
