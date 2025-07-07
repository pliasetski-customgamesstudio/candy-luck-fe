// import { BonusFinishedArgs } from "@cgs/common";
// import { IBonusGame } from "@cgs/features";
// import { Container } from "@cgs/syd";
// import { ScatterGameProvider } from "./mini_game/scatter_game_provider";

// export class ScatterProgressiveProvider {
//   static readonly ScatterProgressiveKey: string = "unlockedStage";
//   static readonly InitialProgress: number = 0;

//   constructor(container: Container, private _maxProgress: number) {
//     const scatterProvider = container.forceResolve<ScaterGameProvider>(T_ScaterGameProvider);
//     const clientRepository = container.resolve(IStorageRepositoryProvider);

//     scatterProvider.onMiniGameCreated.subscribe((bonusGame: IBonusGame) => {
//       let progress = clientRepository.readItem(ScatterProgressiveProvider.ScatterProgressiveKey);
//       if (!progress || progress.isEmpty) {
//         progress = ScatterProgressiveProvider.InitialProgress.toString();
//       }
//       const currentProgress = parseInt(progress);

//       bonusGame.clearProperties();
//       bonusGame.addProperties({ [ScatterProgressiveProvider.ScatterProgressiveKey]: currentProgress });

//       let finishedSub: StreamSubscription<BonusFinishedArgs>;
//       finishedSub = bonusGame.onBonusFinished.subscribe((finishedArgs: BonusFinishedArgs) => {
//         finishedSub.cancel();

//         if (currentProgress < this._maxProgress) {
//           currentProgress++;
//           clientRepository.createItem(
//             ScatterProgressiveProvider.ScatterProgressiveKey,
//             currentProgress.toString()
//           );
//         }
//       });
//     });
//   }
// }
