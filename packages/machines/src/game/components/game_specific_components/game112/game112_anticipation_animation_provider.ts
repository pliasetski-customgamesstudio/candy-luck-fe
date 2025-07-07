import { SceneCommon } from '@cgs/common';
import {
  ActionActivator,
  Container,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  EmptyAction,
  ParallelSimpleAction,
  SceneObject,
} from '@cgs/syd';
import { NoStbAnticipationProviderWithFSSupport } from '../../anticipation/no_stb_anticipation_provider_with_f_s_support';
import { ConditionAction } from '../../win_lines/complex_win_line_actions/condition_action';
import { IFadeReelsProvider } from '../../win_lines/i_fade_reels_provider';
import { ISlotGame } from '../../../../reels_engine/i_slot_game';
import { T_IFadeReelsProvider, T_ISlotGame } from '../../../../type_definitions';

export class Game112AnticipationAnimationProvider extends NoStbAnticipationProviderWithFSSupport {
  private _actionActivatorStart: ActionActivator;
  private _actionActivatorRemove: ActionActivator;
  private _isAnticipationActive: boolean = false;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    iconMap: Map<number, number>,
    stopSpinSound: boolean = true,
    skipAcceleration: boolean = false
  ) {
    super(container, sceneCommon, iconMap, stopSpinSound, skipAcceleration);
    this._actionActivatorStart = new ActionActivator(
      container.forceResolve<ISlotGame>(T_ISlotGame).gameNode
    );
    this._actionActivatorRemove = new ActionActivator(
      container.forceResolve<ISlotGame>(T_ISlotGame).gameNode
    );
    this.gameStateMachine.stopping.appendLazyAnimation(
      () => new ConditionAction(() => !this._isAnticipationActive)
    );
    this.gameStateMachine.immediatelyStop.appendLazyAnimation(
      () => new ConditionAction(() => !this._isAnticipationActive)
    );
  }

  AnticipationAction(reel: number): Action {
    if (this.CheckWin(reel)) {
      const currentConfig = this.getAnticipationConfig();

      for (const symbolId of currentConfig.anticipationIcons) {
        if (this.gameStateMachine.curResponse.viewReels[reel].includes(symbolId)) {
          if (!this.symbols.get(this.getMappedKey(symbolId))?.includes(reel)) {
            this.symbols.get(this.getMappedKey(symbolId))?.push(reel);
          }
        }
      }

      const symbolActions: Map<number, Action> = new Map<number, Action>();
      const accelerateActions: Action[] = [];
      const iconAnimationActions: Action[] = [];
      const _fadeReelsProvider = this.container.forceResolve<IFadeReelsProvider>(
        T_IFadeReelsProvider
      ) as IFadeReelsProvider;

      this.symbols.forEach((value, key) => {
        {
          const actions: Action[] = [];

          if (value.length > 0 && this.isWinPossible(key, reel + 1)) {
            for (let r = reel + 1; r < this.reelsEngine.ReelConfig.reelCount; r++) {
              if (
                !this.skipAcceleration &&
                value.length >= currentConfig.minIconsForAnticipationForSymbol(key) &&
                !this.acceleratedReels.includes(r) &&
                currentConfig.anticipationReels[
                  currentConfig.anticipationIcons.indexOf(key)
                ].includes(r)
              ) {
                accelerateActions.push(this.AccelerateAction(r));
                this.acceleratedReels.push(r);
              }
            }

            if (reel < this.reelsEngine.ReelConfig.reelCount - 1) {
              if (
                value.length >= currentConfig.minIconsForAnticipationForSymbol(key) &&
                currentConfig.anticipationReels[
                  currentConfig.anticipationIcons.indexOf(key)
                ].includes(reel + 1) &&
                !this.SkipAnticipationOnReels.includes(reel)
              ) {
                const anticipationScene = this.sceneCommon.sceneFactory.build(
                  `additional/anticipator_${this.getMappedKey(key)}`
                ) as SceneObject;
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
                ) as SceneObject;
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
                if (placeholderBg) {
                  placeholderBg.addChild(anticipationBgScene as SceneObject);
                  actions.push(
                    new SequenceSimpleAction([
                      new ConditionAction(
                        () =>
                          this.reelsEngine.isReelDirectionChanged(reel) ||
                          this.reelsEngine.isReelStopped(reel)
                      ),
                      new FunctionAction(() => {
                        const stateName = reel < 2 ? 'anim' : 'animShaking';

                        anticipationBgScene.enable();
                        if (
                          anticipationBgScene.stateMachine &&
                          anticipationBgScene.stateMachine.findById(stateName)
                        ) {
                          anticipationBgScene.stateMachine.switchToState(stateName);
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
                        const stateName = reel < 2 ? 'anim' : 'animShaking';

                        anticipationScene.enable();
                        if (
                          anticipationScene.stateMachine &&
                          anticipationScene.stateMachine.findById(stateName)
                        ) {
                          anticipationScene.stateMachine.switchToState(stateName);
                        }
                      }
                    }),
                  ])
                );
                const accelerateAction = this.skipAcceleration
                  ? new EmptyAction()
                  : this.AccelerateAction(reel + 1);
                actions.push(
                  value.length >= currentConfig.minIconsForAnticipationForSymbol(key)
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
              if (value.length >= currentConfig.minIconsForAnticipationForSymbol(key)) {
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
              if (value.length >= currentConfig.minIconsForAnticipationForSymbol(key)) {
                actions.push(
                  new FunctionAction(() => {
                    this.RemoveCurrentScene(key, reel);
                  })
                );
              }
            }

            if (
              value.length >= currentConfig.minIconsForAnticipationForSymbol(key) &&
              currentConfig.anticipationReels[
                currentConfig.anticipationIcons.indexOf(key)
              ].includes(reel + 1)
            ) {
              actions.push(
                new EmptyAction().withDuration(
                  value.includes(reel)
                    ? currentConfig.continueDurationAnticipating
                    : currentConfig.continueDurationNotAnticipating
                )
              );
            }

            symbolActions.set(key, new ParallelSimpleAction(actions));
          } else {
            if (
              this.isWinPossible(key, reel) &&
              value.length >= currentConfig.minIconsForAnticipationForSymbol(key)
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

  removeAnticipations(reel: number): Action {
    const actions: Action[] = [];
    for (const symbolKey of this.symbols.keys()) {
      const symbolValue = this.symbols.get(symbolKey) as number[];
      if (symbolValue.length > 0 && !this.isWinPossible(symbolKey, reel)) {
        actions.push(
          new FunctionAction(() => {
            symbolValue.length = 0;
            this.RemoveScene(symbolKey);
          })
        );
      }
    }
    return new ParallelSimpleAction(actions);
  }

  removeSceneOnReel(symbolId: number, reel: number): void {
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
