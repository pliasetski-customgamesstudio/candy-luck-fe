import { SceneCommon } from '@cgs/common';
import {
  Container,
  IntervalAction,
  FunctionAction,
  SequenceAction,
  EmptyAction,
  ParallelAction,
  SceneObject,
} from '@cgs/syd';
import { NoStbAnticipationProvider } from '../../anticipation/no_stb_anticipation_provider';
import { ConditionIntervalAction } from '../../win_lines/complex_win_line_actions/condition_action';
import { IFadeReelsProvider } from '../../win_lines/i_fade_reels_provider';
import { T_IFadeReelsProvider } from '../../../../type_definitions';

export class Game112NoStbAnticipationAnimationProvider extends NoStbAnticipationProvider {
  constructor(container: Container, sceneCommon: SceneCommon, stopSpinSound: boolean = true) {
    super(container, sceneCommon, { stopSpinSound, skipAcceleration: false });
  }

  isWinPossible(symbolId: number, reel: number): boolean {
    let symbolsCount = 0;
    for (const val of this.symbols.values()) {
      symbolsCount += val.length;
    }
    const response = this.gameStateMachine.curResponse;
    let minIconsForWin = this.anticipationConfig.minIconsForWin;
    if (
      response.specialSymbolGroups &&
      response.specialSymbolGroups.some((arg) => arg.type === 'ReTrigger')
    ) {
      minIconsForWin = 2;
    }

    const reelsLeft = this.anticipationConfig.anticipationReels[0].filter((r) => r >= reel).length;
    const hasNoSymbols = !this.symbols.size;
    const condition1: boolean = hasNoSymbols && reelsLeft >= minIconsForWin;
    const condition2: boolean = !hasNoSymbols && minIconsForWin - symbolsCount <= reelsLeft;
    return condition1 || condition2;
  }

  AnticipationAction(reel: number): IntervalAction {
    if (this.CheckWin(reel)) {
      for (const symbolId of this.anticipationConfig.anticipationIcons) {
        if (this.gameStateMachine.curResponse.viewReels[reel].includes(symbolId)) {
          if (!this.symbols.get(symbolId)?.includes(reel)) {
            this.symbols.get(symbolId)?.push(reel);
          }
        }
      }
      const response = this.gameStateMachine.curResponse;
      let minIconsForAnticipation = this.anticipationConfig.minIconsForAnticipation;
      if (
        response.specialSymbolGroups &&
        response.specialSymbolGroups.some((arg) => arg.type === 'ReTrigger')
      ) {
        minIconsForAnticipation = 1;
      }

      const symbolActions = new Map<number, IntervalAction>();
      const accelerateActions: IntervalAction[] = [];
      const _iconAnimationActions: IntervalAction[] = [];
      const _fadeReelsProvider =
        this.container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider);

      this.symbols.forEach((value, key) => {
        const actions: IntervalAction[] = [];

        if (value.length >= 0 && this.isWinPossible(key, reel + 1)) {
          for (let r = reel + 1; r < this.reelsEngine.ReelConfig.reelCount; r++) {
            if (
              value.length >= minIconsForAnticipation &&
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
              value.length >= minIconsForAnticipation &&
              this.anticipationConfig.anticipationReels[
                this.anticipationConfig.anticipationIcons.indexOf(key)
              ].includes(reel + 1)
            ) {
              const anticipationScene = this.sceneCommon.sceneFactory.build(
                'additional/anticipator_${key}'
              ) as SceneObject;
              anticipationScene.initialize();
              anticipationScene.disable();
              anticipationScene.z = 999999;

              const anticipationBgScene = this.sceneCommon.sceneFactory.build(
                'additional/anticipator_bg_${key}'
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
                `anticipation_${key}_${reel + 1}`
              ) as SceneObject;
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
                value.length >= minIconsForAnticipation
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
                  this.RemoveCurrentScene(key, reel);
                })
              );
            }
          } else {
            if (value.length >= minIconsForAnticipation) {
              actions.push(
                new FunctionAction(() => {
                  this.RemoveCurrentScene(key, reel);
                })
              );
            }
          }

          if (
            value.length >= minIconsForAnticipation &&
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

          symbolActions.set(key, new ParallelAction(actions));
        }
      });
      let result: IntervalAction | null = null;
      this.symbols.forEach((value, key) => {
        if (value.includes(reel) && symbolActions.has(key)) {
          result = new ParallelAction([
            this.RemoveAnticipations(reel + 1),
            symbolActions.get(key) as IntervalAction,
          ]);
        }
      });
      if (result) {
        return result;
      }

      return new ParallelAction([
        this.RemoveAnticipations(reel + 1),
        symbolActions.size ? symbolActions.values().next().value! : new EmptyAction(),
      ]);
    }

    return new FunctionAction(() => {
      this.symbols.forEach((value, key) => {
        this.reelSoundModel.anticipatorSound(key, 0).GoToState('default');
      });
    });
  }
}
