import { SceneCommon } from '@cgs/common';
import {
  Container,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  EmptyAction,
  ParallelSimpleAction,
  IntervalAction,
  Vector2,
} from '@cgs/syd';
import { AbstractAnticipationConfig } from '../../../reels_engine/game_config/abstract_anticipation_config';
import { FreeSpinsInfoConstants } from '../../../reels_engine/state_machine/free_spins_info_constants';
import { T_IGameConfigProvider } from '../../../type_definitions';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { ConditionAction } from '../win_lines/complex_win_line_actions/condition_action';
import { NoStbAnticipationProviderWithCustomConfig } from './no_stb_anticipation_provider_with_custom_config';

export class NoStbAnticipationProviderWithFSSupport extends NoStbAnticipationProviderWithCustomConfig {
  SkipAnticipationOnReels: number[] = [];

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    iconMap?: Map<number, number>,
    stopSpinSound: boolean = true,
    skipAcceleration: boolean = false
  ) {
    super(container, sceneCommon, iconMap, stopSpinSound, skipAcceleration);
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
                    this.reelSoundModel.anticipatorSound(key, 0).GoToState('default');
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

  getAnticipationConfig(): AbstractAnticipationConfig {
    if (
      this.gameStateMachine.curResponse.isFreeSpins &&
      this.gameStateMachine.curResponse.freeSpinsInfo!.event !=
        FreeSpinsInfoConstants.FreeSpinsStarted
    ) {
      const config =
        this.container.forceResolve<IGameConfigProvider>(T_IGameConfigProvider).gameConfig;
      const namedConfig = config.getNamedConfig(
        this.gameStateMachine.curResponse.freeSpinsInfo!.name
      );
      if (!namedConfig) {
        return this.anticipationConfig;
      }
      return namedConfig.anticipationConfig;
    }
    return this.anticipationConfig;
  }

  AccelerateAction(reel: number): IntervalAction {
    const currentConfig = this.getAnticipationConfig();

    const currentSpeed = currentConfig.anticipatedSpinSpeed * this.spinConfig.directions[reel];
    const maxSpeedConfig = currentConfig.maxSpeed;
    return new FunctionAction(() =>
      this.reelsEngine.accelerateReel(
        reel,
        new Vector2(0.0, this.spinConfig.spinSpeed * this.spinConfig.directions[reel]),
        new Vector2(0.0, maxSpeedConfig < currentSpeed ? maxSpeedConfig : currentSpeed),
        currentConfig.acceleratedDuration
      )
    );
  }

  isWinPossible(symbolId: number, reel: number): boolean {
    const currentConfig = this.getAnticipationConfig();
    const reelsLeft = currentConfig.anticipationReels[
      currentConfig.anticipationIcons.indexOf(symbolId)
    ].filter((r) => r >= reel).length;
    return (
      (!(this.symbols.size > 0) && reelsLeft >= currentConfig.minIconsForWinForIcon(symbolId)) ||
      (this.symbols.size > 0 &&
        currentConfig.minIconsForWinForIcon(symbolId) -
          (this.symbols.get(symbolId) as number[]).length <=
          reelsLeft)
    );
  }
}
