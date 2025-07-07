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
import { NoStbAnticipationProvider } from './no_stb_anticipation_provider';

export class NoStbAnticipationProviderWithCustomConfig extends NoStbAnticipationProvider {
  private readonly _iconMap: Map<number, number>;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    iconMap?: Map<number, number>,
    stopSpinSound: boolean = true,
    skipAcceleration: boolean = false
  ) {
    super(container, sceneCommon, { stopSpinSound, skipAcceleration });
    this._iconMap = iconMap || new Map();
  }

  public getMappedKey(key: number): number {
    return this._iconMap.has(key) ? this._iconMap.get(key)! : key;
  }

  AnticipationAction(reel: number): Action {
    if (this.CheckWin(reel)) {
      for (const symbolId of this.anticipationConfig.anticipationIcons) {
        if (this.gameStateMachine.curResponse.viewReels[reel].includes(symbolId)) {
          if (!this.symbols.get(this.getMappedKey(symbolId) as number)?.includes(reel)) {
            this.symbols.get(this.getMappedKey(symbolId) as number)?.push(reel);
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
                !this.skipAcceleration &&
                value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key) &&
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
                value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key) &&
                this.anticipationConfig.anticipationReels[
                  this.anticipationConfig.anticipationIcons.indexOf(key)
                ].includes(reel + 1)
              ) {
                const anticipationScene = this.sceneCommon.sceneFactory.build(
                  `additional/anticipator_${this.getMappedKey(key)}`
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
                  `additional/anticipator_bg_${this.getMappedKey(key)}`
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
                  `anticipation_${this.getMappedKey(key)}_${reel + 1}`
                );
                if (placeholder && anticipationScene) {
                  placeholder.addChild(anticipationScene);
                }

                const placeholderBg = this.gameResourceProvider.slot.findById(
                  `anticipation_bg_${this.getMappedKey(key)}_${reel + 1}`
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
                const accelerateAction = this.skipAcceleration
                  ? new EmptyAction()
                  : this.AccelerateAction(reel + 1);
                actions.push(
                  value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key)
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
              if (value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key)) {
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
              if (value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key)) {
                actions.push(
                  new FunctionAction(() => {
                    this.RemoveCurrentScene(key, reel);
                  })
                );
              }
            }

            if (
              value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key) &&
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
              value.length >= this.anticipationConfig.minIconsForAnticipationForSymbol(key)
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

  RemoveCurrentScene(symbolId: number, reel: number): void {
    this.symbols.forEach((value, key) => {
      this.acceleratedReels = [];
      const reelAnticipation = this.gameResourceProvider.slot.findById(
        `anticipation_${this.getMappedKey(key)}_${reel}`
      );
      const reelAnticipationBg = this.gameResourceProvider.slot.findById(
        `anticipation_bg_${this.getMappedKey(key)}_${reel}`
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

  isWinPossible(symbolId: number, reel: number): boolean {
    const reelsLeft = this.anticipationConfig.anticipationReels[
      this.anticipationConfig.anticipationIcons.indexOf(symbolId)
    ].filter((r) => r >= reel).length;
    return (
      (!(this.symbols.size > 0) &&
        reelsLeft >= this.anticipationConfig.minIconsForWinForIcon(symbolId)) ||
      (this.symbols.size > 0 &&
        this.anticipationConfig.minIconsForWinForIcon(symbolId) -
          (this.symbols.get(symbolId)?.length as number) <=
          reelsLeft)
    );
  }
}
