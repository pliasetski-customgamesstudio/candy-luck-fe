import { SceneCommon } from '@cgs/common';
import {
  Container,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  EmptyAction,
  ParallelSimpleAction,
} from '@cgs/syd';
import { ConditionAction } from '../win_lines/complex_win_line_actions/condition_action';
import { AnticipationAnimationProvider } from './anticipation_animation_provider';

export class NoStbAnticipationProvider extends AnticipationAnimationProvider {
  private readonly _skipAcceleration: boolean;
  get skipAcceleration(): boolean {
    return this._skipAcceleration;
  }

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    {
      stopSpinSound = true,
      skipAcceleration = false,
    }: { stopSpinSound?: boolean; skipAcceleration?: boolean }
  ) {
    super(container, sceneCommon, stopSpinSound);
    this._skipAcceleration = skipAcceleration;
  }

  AnticipationAction(reel: number): Action {
    if (this.CheckWin(reel)) {
      for (const symbolId of this.anticipationConfig.anticipationIcons) {
        if (this.gameStateMachine.curResponse.viewReels[reel].includes(symbolId)) {
          if (!this.symbols.get(symbolId)?.includes(reel)) {
            this.symbols.get(symbolId)?.push(reel);
          }
        }
      }

      const symbolActions: Map<number, Action> = new Map<number, Action>();
      const accelerateActions: Action[] = [];
      const iconAnimationActions: Action[] = [];

      this.symbols.forEach((value, key) => {
        {
          const actions: Action[] = [];

          if (value.length > 0 && this.isWinPossible(key, reel + 1)) {
            for (let r = reel + 1; r < this.reelsEngine.ReelConfig.reelCount; r++) {
              if (
                !this._skipAcceleration &&
                value.length >= this.anticipationConfig.minIconsForAnticipation &&
                !this.acceleratedReels.includes(r) &&
                this.anticipationConfig.anticipationReels[
                  this.anticipationConfig.anticipationIcons.indexOf(key)
                ].includes(r)
              ) {
                accelerateActions.push(this.AccelerateAction(r));
                this.acceleratedReels.push(r);
              }
            }

            if (reel < this.reelsEngine.ReelConfig.reelCount - 1) {
              if (
                value.length >= this.anticipationConfig.minIconsForAnticipation &&
                this.anticipationConfig.anticipationReels[
                  this.anticipationConfig.anticipationIcons.indexOf(key)
                ].includes(reel + 1)
              ) {
                const anticipationScene = this.sceneCommon.sceneFactory.build(
                  `additional/anticipator_${key}`
                )!;
                anticipationScene.initialize();
                anticipationScene.disable();
                anticipationScene.z = 999999;
                iconAnimationActions.push(
                  new SequenceSimpleAction([
                    new ConditionAction(
                      () =>
                        this.reelsEngine.isReelDirectionChanged(reel) ||
                        this.reelsEngine.isReelStopped(reel)
                    ),
                  ])
                );
                const anticipationBgScene = this.sceneCommon.sceneFactory.build(
                  `additional/anticipator_bg_${key}`
                );
                if (anticipationBgScene) {
                  anticipationBgScene.initialize();
                  anticipationBgScene.disable();
                  anticipationBgScene.z = 999999;
                }

                actions.push(
                  new FunctionAction(() => {
                    this.RemoveCurrentScene(key, reel);
                  })
                );

                const placeholder = this.gameResourceProvider.slot.findById(
                  `anticipation_${key}_${reel + 1}`
                );
                if (placeholder && anticipationScene) {
                  placeholder.addChild(anticipationScene);
                }

                const placeholderBg = this.gameResourceProvider.slot.findById(
                  `anticipation_bg_${key}_${reel + 1}`
                );
                if (placeholderBg && anticipationBgScene) {
                  placeholderBg.addChild(anticipationBgScene);
                  actions.push(
                    new SequenceSimpleAction([
                      new ConditionAction(
                        () =>
                          this.reelsEngine.isReelDirectionChanged(reel) ||
                          this.reelsEngine.isReelStopped(reel)
                      ),
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
                  new SequenceSimpleAction([
                    new ConditionAction(
                      () =>
                        this.reelsEngine.isReelDirectionChanged(reel) ||
                        this.reelsEngine.isReelStopped(reel)
                    ),
                    new FunctionAction(() => {
                      if (anticipationScene) {
                        anticipationScene.enable();
                        if (
                          anticipationScene.stateMachine &&
                          anticipationScene.stateMachine.findById('anim')
                        ) {
                          anticipationScene.stateMachine.switchToState('anim');
                        }
                      }
                    }),
                  ])
                );
                const accelerateAction = this._skipAcceleration
                  ? new EmptyAction()
                  : this.AccelerateAction(reel + 1);
                actions.push(
                  value.length >= this.anticipationConfig.minIconsForAnticipation
                    ? new SequenceSimpleAction([
                        new ConditionAction(
                          () =>
                            this.reelsEngine.isReelDirectionChanged(reel) ||
                            this.reelsEngine.isReelStopped(reel)
                        ),
                        accelerateAction,
                      ])
                    : accelerateAction
                );
                actions.push(
                  new SequenceSimpleAction([
                    new ConditionAction(
                      () =>
                        this.reelsEngine.isReelDirectionChanged(reel) ||
                        this.reelsEngine.isReelStopped(reel)
                    ),
                    this.AnticipationSoundAction(key, 0),
                  ])
                );
              } else {
                actions.push(
                  new FunctionAction(() => {
                    this.RemoveCurrentScene(key, reel);
                  })
                );
              }
            } else {
              if (value.length >= this.anticipationConfig.minIconsForAnticipation) {
                iconAnimationActions.push(
                  new SequenceSimpleAction([
                    new ConditionAction(
                      () =>
                        this.reelsEngine.isReelDirectionChanged(reel) ||
                        this.reelsEngine.isReelStopped(reel)
                    ),
                  ])
                );
                actions.push(
                  new FunctionAction(() => {
                    this.RemoveCurrentScene(key, reel);
                  })
                );
              }
              if (value.length >= this.anticipationConfig.minIconsForAnticipation) {
                actions.push(
                  new FunctionAction(() => {
                    this.RemoveCurrentScene(key, reel);
                  })
                );
              }
            }

            if (
              value.length >= this.anticipationConfig.minIconsForAnticipation &&
              this.anticipationConfig.anticipationReels[
                this.anticipationConfig.anticipationIcons.indexOf(key)
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

            symbolActions.set(key, new ParallelSimpleAction(actions));
          } else {
            if (
              this.isWinPossible(key, reel) &&
              value.length >= this.anticipationConfig.minIconsForAnticipation
            ) {
              iconAnimationActions.push(
                new SequenceSimpleAction([
                  new ConditionAction(
                    () =>
                      this.reelsEngine.isReelDirectionChanged(reel) ||
                      this.reelsEngine.isReelStopped(reel)
                  ),
                ])
              );
              actions.push(
                new FunctionAction(() => {
                  this.RemoveCurrentScene(key, reel);
                })
              );
              symbolActions.set(
                key,
                new FunctionAction(() => {
                  this.reelSoundModel.anticipatorSound(key, 0).GoToState('default');
                })
              );
            }
          }
        }
      });
      let result: Action | null = null;
      this.symbols.forEach((value, key) => {
        if (value.includes(reel) && symbolActions.has(key)) {
          result = new SequenceSimpleAction([
            new ParallelSimpleAction(iconAnimationActions),
            new ParallelSimpleAction([
              this.RemoveAnticipations(reel + 1),
              symbolActions.get(key) as Action,
            ]),
          ]);
        }
      });
      if (result) {
        return result;
      }

      return new SequenceSimpleAction([
        new ParallelSimpleAction(iconAnimationActions),
        new ParallelSimpleAction([
          this.RemoveAnticipations(reel + 1),
          symbolActions.size > 0 ? symbolActions.values().next().value! : new EmptyAction(),
        ]),
      ]);
    }

    return new SequenceSimpleAction([
      new FunctionAction(() => {
        this.symbols.forEach((value, key) => {
          this.reelSoundModel.anticipatorSound(key, 0).GoToState('default');
        });
      }),
    ]);
  }

  stopAccelerationSound() {
    this.symbols.forEach((value, key) => {
      this.reelSoundModel.anticipatorSound(key, 0).GoToState('default');
    });
  }

  stopAccelerationSoundByKey(symbolId: number) {
    this.reelSoundModel.anticipatorSound(symbolId, 0).GoToState('default');
  }

  RemoveCurrentScene(symbolId: number, reel: number) {
    this.symbols.forEach((key, _value) => {
      this.acceleratedReels = [];
      const reelAnticipation = this.gameResourceProvider.slot.findById(
        `anticipation_${key}_${reel}`
      );
      const reelAnticipationBg = this.gameResourceProvider.slot.findById(
        `anticipation_bg_${key}_${reel}`
      );
      if (reelAnticipation) {
        const children = [...reelAnticipation.childs];
        reelAnticipation.removeAllChilds();
        for (const child of children) {
          child.deinitialize();
        }
      }

      if (reelAnticipationBg) {
        const childrenBg = [...reelAnticipationBg.childs];
        reelAnticipationBg.removeAllChilds();
        for (const child of childrenBg) {
          child.deinitialize();
        }
      }
    });
  }

  RemoveScene(symbolId: number) {
    this.acceleratedReels = [];
    // stopAccelerationSoundByKey(symbolId);
    for (let reel = 0; reel < this.reelsEngine.ReelConfig.reelCount; reel++) {
      const reelAnticipation = this.gameResourceProvider.slot.findById(
        `anticipation_${symbolId}_${reel}`
      );
      const reelAnticipationBg = this.gameResourceProvider.slot.findById(
        `anticipation_bg_${symbolId}_${reel}`
      );
      if (reelAnticipation) {
        const children = [...reelAnticipation.childs];
        reelAnticipation.removeAllChilds();
        for (const child of children) {
          child.deinitialize();
        }
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
