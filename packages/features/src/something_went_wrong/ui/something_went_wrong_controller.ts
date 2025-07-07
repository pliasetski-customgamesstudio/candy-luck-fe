// import { GameStateMachine } from 'machines';
// import { IGameStateMachineProvider } from 'machines';
// import { Container } from 'syd';
// import { slotPopupCoordinator } from "@cgs/common";
// import { navigationStack } from "@cgs/common";
// import { ErrorLevel } from "@cgs/common";
// import * as js from 'dart:js';
// import * as html from 'dart:html';
//
// class SomethingWentWrongController extends BaseSlotPopupController<SomethingWentWrongView> {
//   private _gameStateMachine: GameStateMachine;
//
//   constructor(container: Container, popupView: SomethingWentWrongView) {
//     super(container, popupView, false);
//     this._gameStateMachine = (container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider) as IGameStateMachineProvider).gameStateMachine;
//   }
//
//   onPopupClosed(): void {
//     gameStateMachineNotifier.notifier.NotifyListenersExited('popup');
//     slotPopupCoordinator.onPopupHidden((this.view as BaseSlotPopupView).popupId);
//     navigationStack.unregister(this);
//   }
//
//   onPopupShowing(): void {
//     gameStateMachineNotifier.notifier.NotifyListenersEntered('popup');
//     slotPopupCoordinator.onPopupShown((this.view as BaseSlotPopupView).popupId);
//     navigationStack.register(this);
//   }
//
//   onAnimCompleted(): void {
//     this.view.hide();
//   }
//
//   OnStateEntered(slotState: string): void {
//     switch (slotState) {
//       case 'stop':
//         if (this._gameStateMachine.curResponse.isFakeResponse &&
//             this._gameStateMachine.curResponse.errorLevel !== ErrorLevel.None) {
//           let errorLevel = this._gameStateMachine.curResponse.errorLevel;
//           if (errorLevel !== ErrorLevel.SpinLimitExceeded && this._gameStateMachine.prevResponse.isFreeSpins) {
//             errorLevel = ErrorLevel.Critical;
//           }
//           js.context.callMethod('showErrorPopup');
//           const text = new html.SpanElement();
//           text.text = this._gameStateMachine.curResponse.errorMessage;
//           html.document.querySelector('#popupErrorInfo').children.add(text);
//         }
//         break;
//       default:
//         break;
//     }
//   }
// }
