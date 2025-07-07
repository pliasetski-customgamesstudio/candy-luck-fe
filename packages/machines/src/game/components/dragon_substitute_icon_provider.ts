// import { SubstituteIconComponent, SpecialSymbolGroup, IntervalAction, ParallelAction, FunctionAction, EmptyAction } from 'machines';
// import { max } from 'math';
// import { iconModel } from '@cgs/syd';
// import { reelsEngine } from 'common';

// export class DragonSubstituteIconProvider extends SubstituteIconComponent {
//   constructor(container, symbolMap, allowPartialSubstitution, marker, substituteStateName) {
//     super(container, symbolMap, false, marker, substituteStateName);
//   }

//   preSubstituteAction(symbol) {
//     let longestDuration = 0.0;
//     let icons = iconModel.getAnimIcon(1500);
//     for (let icon of icons) {
//       if (icon && icon.stateMachine) {
//         let intervalAction = icon.stateMachine.findById("fire").enterAction;
//         if (intervalAction instanceof IntervalAction) {
//           longestDuration = max(longestDuration, intervalAction.duration);
//         }
//       }
//     }

//     icons = iconModel.getAnimIcon(1300);
//     let animDuration = 0.0;
//     for (let icon of icons) {
//       if (icon && icon.stateMachine) {
//         let intervalAction = icon.stateMachine.findById("show").enterAction;
//         if (intervalAction instanceof IntervalAction) {
//           animDuration = max(animDuration, intervalAction.duration);
//         }
//       }
//     }

//     longestDuration = max(0.0, longestDuration - animDuration);

//     return new ParallelAction([
//       new FunctionAction(() => {
//         let pos = 4;
//         let dragonEntity = reelsEngine.iconAnimationHelper.getEntities(pos)[0];
//         reelsEngine.startAnimation(dragonEntity, "fire");
//       }),
//       new EmptyAction().withDuration(longestDuration)
//     ]);
//   }

//   ProcessSubstitudeSymbolSounds(symbolActions, drawId) {

//   }
// }
