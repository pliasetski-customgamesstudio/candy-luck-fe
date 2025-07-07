import { AnticipationAnimationProvider } from './anticipation_animation_provider';
import {
  Container,
  EmptyAction,
  FunctionAction,
  IntervalAction,
  ParallelAction,
  SequenceAction,
} from '@cgs/syd';
import { ModularSpinResponse, SceneCommon } from '@cgs/common';
import { ConditionIntervalAction } from '../win_lines/complex_win_line_actions/condition_action';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';

export class NextReelAnticipationAnimationProvider extends AnticipationAnimationProvider {
  constructor(container: Container, sceneCommon: SceneCommon, stopSpinSound: boolean = true) {
    super(container, sceneCommon, stopSpinSound);
  }

  AnticipationAction(reel: number): IntervalAction {
    if (this.CheckWin(reel)) {
      for (const symbolId of this.anticipationConfig.anticipationIcons) {
        if (this.gameStateMachine.curResponse.viewReels[reel].includes(symbolId)) {
          if (!this.symbols.get(symbolId)!.includes(reel)) {
            this.symbols.get(symbolId)!.push(reel);
          }
        }
      }

      const symbolActions: Map<number, IntervalAction> = new Map<number, IntervalAction>();
      const accelerateActions: IntervalAction[] = [];
      const iconAnimationActions: IntervalAction[] = [];
      // const fadeReelsProvider = container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider);

      // let i = 0;
      for (const [key, value] of this.symbols.entries()) {
        const actions: IntervalAction[] = [];

        if (value.length >= 0 && this.isWinPossible(Number(key), reel + 1)) {
          for (let r = reel + 1; r < this.reelsEngine.ReelConfig.reelCount; r++) {
            if (
              value.length >= this.anticipationConfig.minIconsForAnticipation &&
              !this.acceleratedReels.includes(r) &&
              this.anticipationConfig.anticipationReels[
                this.anticipationConfig.anticipationIcons.indexOf(Number(key))
              ].includes(r)
            ) {
              accelerateActions.push(this.AccelerateAction(r));
              this.acceleratedReels.push(r);
            }
          }

          if (reel < this.reelsEngine.ReelConfig.reelCount - 1) {
            const icon = this.iconModel.getStaticIcon(Number(key))[0];
            let iconAnimAction: IntervalAction = new EmptyAction();
            if (this.gameStateMachine.curResponse.viewReels[reel].includes(Number(key))) {
              iconAnimAction = new FunctionAction(() => {
                icon.stateMachine!.switchToState('default');
                icon.stateMachine!.switchToState('anim');
              });
            }
            iconAnimationActions.push(
              new SequenceAction([
                new ConditionIntervalAction(
                  () =>
                    this.reelsEngine.isReelDirectionChanged(reel) ||
                    this.reelsEngine.isReelStopped(reel)
                ).withDuration(-1.0),
                iconAnimAction,
              ])
            );
            iconAnimationActions.push(
              new SequenceAction([
                new ConditionIntervalAction(
                  () =>
                    this.reelsEngine.isReelDirectionChanged(reel) ||
                    this.reelsEngine.isReelStopped(reel)
                ).withDuration(-1.0),
                this.AccelerationSoundAction(),
              ])
            );

            if (
              value.length >= this.anticipationConfig.minIconsForAnticipation &&
              this.anticipationConfig.anticipationReels[
                this.anticipationConfig.anticipationIcons.indexOf(Number(key))
              ].includes(reel + 1)
            ) {
              const anticipationScene = this.sceneCommon.sceneFactory.build(
                `additional/anticipator_${key}`
              )!;
              anticipationScene.initialize();
              anticipationScene.disable();
              anticipationScene.z = 999999;

              const anticipationBgScene = this.sceneCommon.sceneFactory.build(
                `additional/anticipator_bg_${key}`
              )!;
              if (anticipationBgScene) {
                anticipationBgScene.initialize();
                anticipationBgScene.disable();
                anticipationBgScene.z = 999999;
              }

              actions.push(
                new FunctionAction(() => {
                  this.RemoveCurrentScene(Number(key), reel);
                })
              );

              const placeholder = this.gameResourceProvider.slot.findById(
                `anticipation_${key}_${reel + 1}`
              )!;
              placeholder.addChild(anticipationScene);

              const placeholderBg = this.gameResourceProvider.slot.findById(
                `anticipation_bg_${key}_${reel + 1}`
              );
              if (placeholderBg) {
                placeholderBg.addChild(anticipationBgScene);
                actions.push(
                  new SequenceAction([
                    new ConditionIntervalAction(
                      () =>
                        this.reelsEngine.isReelDirectionChanged(reel) ||
                        this.reelsEngine.isReelStopped(reel)
                    ).withDuration(-1.0),
                    new FunctionAction(() => {
                      anticipationBgScene.enable();
                      if (
                        anticipationBgScene.stateMachine &&
                        anticipationBgScene.stateMachine.findById('anim')
                      ) {
                        anticipationBgScene.stateMachine.switchToState('anim');
                      }
                    }),
                  ])
                );
              }

              actions.push(
                new SequenceAction([
                  new ConditionIntervalAction(
                    () =>
                      this.reelsEngine.isReelDirectionChanged(reel) ||
                      this.reelsEngine.isReelStopped(reel)
                  ).withDuration(-1.0),
                  new FunctionAction(() => {
                    anticipationScene.enable();
                    if (
                      anticipationScene.stateMachine &&
                      anticipationScene.stateMachine.findById('anim')
                    ) {
                      anticipationScene.stateMachine.switchToState('anim');
                    }
                  }),
                ])
              );
              actions.push(
                value.length >= this.anticipationConfig.minIconsForAnticipation
                  ? new SequenceAction([
                      new ConditionIntervalAction(
                        () =>
                          this.reelsEngine.isReelDirectionChanged(reel) ||
                          this.reelsEngine.isReelStopped(reel)
                      ).withDuration(-1.0),
                      this.AccelerateAction(reel + 1),
                    ])
                  : this.AccelerateAction(reel + 1)
              );
              actions.push(
                new SequenceAction([
                  new ConditionIntervalAction(
                    () =>
                      this.reelsEngine.isReelDirectionChanged(reel) ||
                      this.reelsEngine.isReelStopped(reel)
                  ).withDuration(-1.0),
                  this.AnticipationSoundAction(key, 0),
                ])
              );
            } else {
              actions.push(
                new FunctionAction(() => {
                  this.RemoveCurrentScene(Number(key), reel);
                })
              );
            }
          } else {
            const icon = this.iconModel.getStaticIcon(Number(key))[0];

            let iconAnimAction: IntervalAction = new EmptyAction();
            if (this.gameStateMachine.curResponse.viewReels[reel].includes(Number(key))) {
              iconAnimAction = new FunctionAction(() => {
                icon.stateMachine!.switchToState('default');
                icon.stateMachine!.switchToState('anim');
              });
            }
            iconAnimationActions.push(
              new SequenceAction([
                new ConditionIntervalAction(
                  () =>
                    this.reelsEngine.isReelDirectionChanged(reel) ||
                    this.reelsEngine.isReelStopped(reel)
                ).withDuration(-1.0),
                iconAnimAction,
              ])
            );
            iconAnimationActions.push(
              new SequenceAction([
                new ConditionIntervalAction(
                  () =>
                    this.reelsEngine.isReelDirectionChanged(reel) ||
                    this.reelsEngine.isReelStopped(reel)
                ).withDuration(-1.0),
                this.AccelerationSoundAction(),
              ])
            );
            if (value.length >= this.anticipationConfig.minIconsForAnticipation) {
              actions.push(
                new FunctionAction(() => {
                  this.RemoveCurrentScene(Number(key), reel);
                })
              );
            }
          }

          if (
            value.length >= this.anticipationConfig.minIconsForAnticipation &&
            this.anticipationConfig.anticipationReels[
              this.anticipationConfig.anticipationIcons.indexOf(Number(key))
            ].includes(reel + 1)
          ) {
            actions.push(
              new EmptyAction().withDuration(
                value.includes(reel)
                  ? this.anticipationConfig.continueDurationAnticipating
                  : this.anticipationConfig.continueDurationNotAnticipating
              )
            );
          }

          symbolActions.set(key, new ParallelAction(actions));
        }
      }

      if (
        this.gameStateMachine.curResponse instanceof ModularSpinResponse &&
        this.gameStateMachine.curResponse.isFreeSpins &&
        this.gameStateMachine.curResponse.freeSpinsInfo!.event !=
          FreeSpinsInfoConstants.FreeSpinsStarted
      ) {
        const returnActions: IntervalAction[] = [new EmptyAction()];
        for (const [key, value] of this.symbols.entries()) {
          if (value.includes(reel) && symbolActions.has(key)) {
            returnActions.push(...iconAnimationActions);
            break;
          }
        }
        return new ParallelAction(returnActions);
      }

      const currentSymbolAction: IntervalAction[] = [];
      const frameSymbolAction: IntervalAction[] = [];
      for (const [key, value] of this.symbols.entries()) {
        if (value.includes(reel) && symbolActions.has(key)) {
          currentSymbolAction.push(symbolActions.get(key)!);
        }
        if (
          !value.includes(reel) &&
          value.length >= this.anticipationConfig.minIconsForAnticipation &&
          symbolActions.has(key)
        ) {
          frameSymbolAction.push(symbolActions.get(key)!);
        }
      }

      if (currentSymbolAction.length > 0 || frameSymbolAction.length > 0) {
        let frameAction: IntervalAction = new EmptyAction();
        let currentAction: IntervalAction = new EmptyAction();

        if (frameSymbolAction.length > 0) {
          frameAction = new ParallelAction(frameSymbolAction);
        }
        if (currentSymbolAction.length > 0) {
          currentAction = new ParallelAction([
            new ParallelAction(iconAnimationActions),
            new ParallelAction(currentSymbolAction),
          ]);
        }
        return new ParallelAction([
          this.RemoveAnticipations(reel + 1),
          new ParallelAction([currentAction]),
          new ParallelAction([frameAction]),
        ]);
      }

      return new ParallelAction([
        this.RemoveAnticipations(reel + 1),
        symbolActions.size > 0 ? Object.values(symbolActions)[0] : new EmptyAction(),
      ]);
    }

    return new FunctionAction(() => {
      for (const [key, _value] of this.symbols.entries()) {
        this.reelSoundModel.anticipatorSound(key, 0).GoToState('default');
      }
    });
  }

  stopAccelerationSound() {
    for (const [key, _value] of this.symbols.entries()) {
      this.reelSoundModel.anticipatorSound(Number(key), 0).GoToState('default');
    }
  }

  stopAccelerationSoundByKey(symbolId: number) {
    this.reelSoundModel.anticipatorSound(symbolId, 0).GoToState('default');
  }

  RemoveCurrentScene(symbolId: number, reel: number) {
    for (const [key, _value] of this.symbols.entries()) {
      this.acceleratedReels = [];
      const reelAnticipation = this.gameResourceProvider.slot.findById(
        `anticipation_${key}_${reel}`
      )!;
      const reelAnticipationBg = this.gameResourceProvider.slot.findById(
        `anticipation_bg_${key}_${reel}`
      );
      const children = [...reelAnticipation.childs];
      reelAnticipation.removeAllChilds();
      for (const child of children) {
        child.deinitialize();
      }

      if (reelAnticipationBg) {
        const childrenBg = [...reelAnticipationBg.childs];
        reelAnticipationBg.removeAllChilds();
        for (const child of childrenBg) {
          child.deinitialize();
        }
      }
    }
  }

  RemoveScene(symbolId: number) {
    this.acceleratedReels = [];
    for (let reel = 0; reel < this.reelsEngine.ReelConfig.reelCount; reel++) {
      const reelAnticipation = this.gameResourceProvider.slot.findById(
        `anticipation_${symbolId}_${reel}`
      )!;
      const reelAnticipationBg = this.gameResourceProvider.slot.findById(
        `anticipation_bg_${symbolId}_${reel}`
      );
      const children = [...reelAnticipation.childs];
      reelAnticipation.removeAllChilds();
      for (const child of children) {
        child.deinitialize();
      }

      if (reelAnticipationBg) {
        const childrenBg = [...reelAnticipationBg.childs];
        reelAnticipationBg.removeAllChilds();
        for (const child of childrenBg) {
          child.deinitialize();
        }
      }
    }
  }
}
