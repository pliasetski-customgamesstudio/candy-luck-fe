// import { Container } from 'machines';
// import { Syd } from '@cgs/syd';
// import { ReelsEngineLibrary } from '../../../reels_engine_library';
// import { Common } from 'common';

// export class CollapsingMultiplierAnimationProvider {
//   constructor(container: Container, { entryThreshold = 0, resetIfNoWin = false }: { entryThreshold?: number, resetIfNoWin?: boolean }) {
//     const gameStateMachine: CollapseGameStateMachine = container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine;

//     const gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
//     const multiplier = gameResourceProvider.root.findById("multiplier");
//     gameStateMachine.beginCollapseState.entered.subscribe((e) => {
//       const group: InternalCollapsingSpecGroup = gameStateMachine.curResponse.additionalData;
//       if (group && group.collapsingCounter > entryThreshold) {
//         multiplier.stateMachine.switchToState("next");
//       }
//     });

//     gameStateMachine.accelerate.entered.subscribe((e) => multiplier.stateMachine.switchToState("back"));

//     if (resetIfNoWin) {
//       gameStateMachine.animation.entered.subscribe((e) =>
//         multiplier.stateMachine.switchToState("back"));
//     }
//   }
// }
