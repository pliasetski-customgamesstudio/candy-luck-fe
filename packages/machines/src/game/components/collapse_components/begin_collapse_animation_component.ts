// import { Container } from 'machines';
// import { Syd } from '@cgs/syd';
// import { Shared } from 'shared';
// import { ReelsEngineLibrary } from '../../../reels_engine_library';

// export class BeginCollapseAnimationComponent {
//   constructor(container: Container, beginCollapseAnimationHolderName: string, beginCollapseSoundName: string) {
//     console.log("load " + this.constructor.name);
//     const gameStateMachine: CollapseGameStateMachine = container.forceResolve<IGameStateMachineProvider>(T_IGameStateMachineProvider).gameStateMachine;
//     const slotPrimaryAnimationProvider = container.resolve(ISlotPrimaryAnimationProvider);
//     const gameResourceProvider = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);
//     const reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(T_RegularSpinsSoundModelComponent).regularSpinSoundModel;

//     const beginCollapseAnimationHolder: SceneObject = gameResourceProvider.slot.findById(beginCollapseAnimationHolderName);

//     gameStateMachine.beginCollapseState.appendLazyAnimation(() =>
//       new SequenceSimpleAction([
//         new LazyAction(slotPrimaryAnimationProvider.buildShortWinLinesAction),
//         new StopSoundAction(reelsSoundModel.getSoundByName(beginCollapseSoundName)),
//         new PlaySoundAction(reelsSoundModel.getSoundByName(beginCollapseSoundName)),
//         new FunctionAction(() => beginCollapseAnimationHolder.stateMachine.switchToState("anim"))]));
//   }
// }
