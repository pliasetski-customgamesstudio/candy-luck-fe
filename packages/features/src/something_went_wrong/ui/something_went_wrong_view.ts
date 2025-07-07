// import { SceneObject } from 'package:machines/machines';
// import { BaseSlotPopupView } from 'package:syd/syd';
// import { Button } from 'package:features/features';
//
// class SomethingWentWrongView extends BaseSlotPopupView<SomethingWentWrongController> {
//
//   popupView: SceneObject;
//
//   constructor(_root: SceneObject, _popupView: SceneObject) {
//     super(_root, _popupView, null, SlotPopups.SomethingWentWrong);
//     this.popupView = _popupView;
//     const okButtons = _popupView.findAllById("okBtn").map((t) => t as Button);
//     for(const okButton of okButtons){
//       okButton.clicked.listen(event => this.onBackToGameClicked(event));
//     }
//   }
//
//   onBackToGameClicked(event: ButtonBase) {
//     this.popupView.findById("Modes").stateMachine.switchToState("hide");
//     this.controller.onAnimCompleted();
//   }
//
//   postEvent(state: string): void {
//     console.log("going to state: " + state);
//     this.popupView.findById("Modes").stateMachine.switchToState(state);
//   }
// }
