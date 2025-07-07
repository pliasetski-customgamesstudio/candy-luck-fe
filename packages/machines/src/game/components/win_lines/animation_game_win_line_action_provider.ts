// import { BaseWinLineActionProvider } from './base_win_line_action_provider';
// import { DynamicDrawOrdersProvider } from '../dynamic_draw_orders_provider';

// export class AnimationGameWinLineActionProvider extends BaseWinLineActionProvider {
//   private static readonly animationDrawOrder: number = 1000;
//   private _gameEngine: AnimationBasedGameEngine;
//   private _dynamicDrawOrdersProvider: DynamicDrawOrdersProvider;

//   constructor(
//     container: Container,
//     iconsSoundPriority: Map<number, number> = null,
//     substituteIconSound: Map<number, number> = null,
//     playIconSoundsWithStateMachine: boolean = false,
//     pauseBackSoundOnWinLines: boolean = false,
//     pauseBackSoundIconsIdsList: number[] = null
//   ) {
//     super(
//       container,
//       iconsSoundPriority,
//       substituteIconSound,
//       playIconSoundsWithStateMachine,
//       pauseBackSoundOnWinLines,
//       pauseBackSoundIconsIdsList
//     );
//     this._gameEngine = (
//       container.forceResolve<ISlotGameEngineProvider>(
//         T_ISlotGameEngineProvider
//       ) as IAnimationBasedGameEngineProvider
//     ).gameEngine;
//     this._dynamicDrawOrdersProvider = container.resolve(DynamicDrawOrdersProvider);
//   }

//   createAnimationActions(winLine: Line, animName: string = 'anim'): void {
//     const res: IntervalAction[] = [];

//     const iconPositions: Map<number, SceneObject> = new Map<number, SceneObject>();
//     for (const position of winLine.iconsIndexes) {
//       const icon = this._gameEngine.getIconByPosition(position);

//       if (icon) {
//         if (icon.stateMachine && icon.stateMachine.findById('anim')) {
//           const duration = (icon.stateMachine.findById('anim').enterAction as IntervalAction)
//             .duration;

//           res.push(
//             new SequenceAction([
//               new FunctionAction(() => icon.stateMachine.switchToState('default')),
//               new FunctionAction(() =>
//                 this._gameEngine.setIconDrawOrder(
//                   position,
//                   icon.z + AnimationGameWinLineActionProvider.animationDrawOrder + position
//                 )
//               ),
//               new FunctionAction(() => icon.stateMachine.switchToState('anim')),
//               new EmptyAction().withDuration(duration),
//             ])
//           );

//           iconPositions.set(position, icon);
//         }
//       }
//     }

//     if (res.length == 0) {
//       this.animationDuration = 0.0;
//     } else {
//       const maxIconDuration = res.map((e) => e.duration).reduce(max);
//       res.forEach((e) => e.withDuration(maxIconDuration));
//       this.animationDuration = maxIconDuration;
//     }

//     this.winLineAnimationAction = new ParallelAction(res);

//     this.winLineStopAnimationAction = new SequenceAction([
//       new FunctionAction(() =>
//         iconPositions.forEach((p, i) => this._gameEngine.setIconDrawOrder(p, i.z))
//       ),
//       new FunctionAction(() =>
//         iconPositions.forEach((p, i) => i.stateMachine.switchToState('default'))
//       ),
//       new FunctionAction(() =>
//         iconPositions.forEach((p, i) => i.stateMachine.switchToState('fade'))
//       ),
//       new FunctionAction(() => res.forEach((e) => e.end())),
//     ]);
//   }
// }
