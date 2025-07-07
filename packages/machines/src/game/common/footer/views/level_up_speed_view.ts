// import { BaseSlotView } from 'machines';
// import { ProgressBar, SceneObject } from '@cgs/syd';

// export class LevelUpSpeedView extends BaseSlotView<LevelUpSpeedController> {
//   private _progress: ProgressBar;
//   private _states: SceneObject;

//   constructor(parent: SceneObject) {
//     super(parent);
//     this._progress = parent.findById("LevelUpSpeed");
//     this._states = parent.findById("LevelUpSpeedStates");
//   }

//   setProgress(progress: number): void {
//     if (this._progress) {
//       this._progress.progress = progress;
//     }
//   }

//   showProgress(): void {
//     if (this._states) {
//       this._states.stateMachine.switchToState("show");
//     }
//   }

//   hideProgress(): void {
//     if (this._states) {
//       this._states.stateMachine.switchToState("hide");
//     }
//   }
// }
