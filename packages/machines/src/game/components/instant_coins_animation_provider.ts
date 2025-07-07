import { ISpinResponse, SceneCommon, NumberFormatter } from '@cgs/common';
import { ListUtil } from '@cgs/shared';
import {
  SceneObject,
  Container,
  IntervalAction,
  Rect,
  Vector2,
  AbstractMouseEvent,
  MouseDownEvent,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  EmptyAction,
  InterpolateCopyAction,
  lerp,
  ParallelSimpleAction,
  TextSceneObject,
} from '@cgs/syd';
import { BaseSlotSoundController } from '../common/base_slot_sound_controller';
import { DrawOrderConstants } from '../common/slot/views/base_popup_view';
import { ISlotPopupCoordinator } from '../common/slot_popup_coordinator';
import { ComponentIndex } from '../../reels_engine/entities_engine/component_index';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { IconsSoundModel } from '../../reels_engine/icons_sound_model';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_IFadeReelsProvider,
  T_RegularSpinsSoundModelComponent,
  T_ISlotPopupCoordinator,
  T_ResourcesComponent,
  T_BaseSlotSoundController,
  T_IconsSoundModelComponent,
} from '../../type_definitions';
import { IconsSoundModelComponent } from './icons_sound_model_component';
import { RegularSpinsSoundModelComponent } from './regular_spins_sound_model_component';
import { ResourcesComponent } from './resources_component';
import { IFadeReelsProvider } from './win_lines/i_fade_reels_provider';

export class InstantCoinsAnimationProvider {
  static readonly PopupId: string = 'Gift';
  static readonly _defaultShowPopupDelay: number = 2.5;
  private _reelsEngine: ReelsEngine;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _iconSoundModel: IconsSoundModel;
  private _slotSoundController: BaseSlotSoundController;
  private _fadeReelsProvider: IFadeReelsProvider;
  private _reelsSoundModel: ReelsSoundModel;
  private _popupCoordinator: ISlotPopupCoordinator;
  private _substituteAnimatedIcons: Map<number, number>;
  private _payingSymbolId: number;
  private _marker: string;
  private _soundName: string;
  private _winPositionsMarker: string;
  private _useTextIncrementAction: boolean;
  private _textIncrementDuration: number;
  private _showPopupDelay: number = 0.0;
  private _hidePopupDelay: number = 0.0;
  private _pauseBackgroundSound: boolean;

  private _popupScene: SceneObject;
  private _drawableIndex: ComponentIndex;

  constructor(
    container: Container,
    sceneCommon: SceneCommon,
    scenePath: string,
    substituteAnimatedIcons: Map<number, number>,
    payingSymbolId: number,
    {
      marker = 'InstantCoins',
      soundName = null,
      winPositionsMarker = null,
      usePopupAnimDuration = false,
      useTextIncrementAction = false,
      textIncrementDuration = 0.0,
      pauseBackgroundSound = false,
    }: {
      marker?: string;
      soundName?: string | null;
      winPositionsMarker?: string | null;
      usePopupAnimDuration?: boolean;
      useTextIncrementAction?: boolean;
      textIncrementDuration?: number;
      pauseBackgroundSound?: boolean;
    } = {}
  ) {
    this._reelsEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as ReelsEngine;
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._iconSoundModel = container.forceResolve<IconsSoundModelComponent>(
      T_IconsSoundModelComponent
    ).iconsSoundModel;
    this._drawableIndex = this._reelsEngine.entityEngine.getComponentIndex(
      ComponentNames.DrawableIndex
    );
    this._slotSoundController =
      container.forceResolve<BaseSlotSoundController>(T_BaseSlotSoundController);
    this._fadeReelsProvider = container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider);
    this._reelsSoundModel = container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel;
    this._popupCoordinator = container.forceResolve<ISlotPopupCoordinator>(T_ISlotPopupCoordinator);
    this._marker = marker;
    this._soundName = soundName!;
    this._winPositionsMarker = winPositionsMarker!;
    this._useTextIncrementAction = useTextIncrementAction;
    this._textIncrementDuration = textIncrementDuration;
    this._pauseBackgroundSound = pauseBackgroundSound;

    this._gameStateMachine.stop.appendLazyAnimation(() => this.getAnimationAction());

    this._popupScene = sceneCommon.sceneFactory.build(scenePath)!;
    if (this._popupScene) {
      this._popupScene.initialize();
      this._popupScene.active = this._popupScene.visible = false;
      this._popupScene.z = DrawOrderConstants.BasePopupViewDrawOrder;
      container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.addChild(this._popupScene);

      this._showPopupDelay = InstantCoinsAnimationProvider._defaultShowPopupDelay;
      if (this._popupScene.stateMachine) {
        if (usePopupAnimDuration) {
          const animState = this._popupScene.stateMachine.findById('anim');
          if (animState) {
            this._showPopupDelay = (animState.enterAction as IntervalAction).duration;
          }
        }

        const defaultState = this._popupScene.stateMachine.findById('default');
        if (defaultState) {
          this._hidePopupDelay = (defaultState.enterAction as IntervalAction).duration;
        }
      }

      this._popupScene.touchable = true;
      //TODO: remove hard-code (config haven't got size!)
      this._popupScene.touchArea = new Rect(
        new Vector2(-1000.0, -1000.0),
        new Vector2(1000.0, 1000.0)
      );
      this._popupScene.eventReceived.listen((e) => {
        if (e instanceof AbstractMouseEvent) {
          e.accept();
          if (e instanceof MouseDownEvent) {
            this._gameStateMachine.stop.animation.end();
          }
        }
      });
    }
  }

  private getAnimationAction(): Action {
    const winPositions = this.getWinIconPositions();
    if (winPositions && winPositions.length > 0) {
      const actions: Action[] = [];
      for (const position of winPositions) {
        actions.push(
          new SequenceSimpleAction([
            new FunctionAction(() => {
              for (const entity of this._reelsEngine.iconAnimationHelper.getSoundEntities(
                position
              )) {
                const drawId = entity.get(this._drawableIndex) as number;
                const iconSound = this._iconSoundModel.getIconSound(drawId);
                iconSound.stop();
                iconSound.play();
              }

              this._reelsEngine.iconAnimationHelper.startAnimOnIcon(position, 'anim');
            }),
            new EmptyAction().withDuration(
              this._reelsEngine.iconAnimationHelper.getMaxAnimDuration(position, 'anim')
            ),
            new FunctionAction(() => {
              for (const entity of this._reelsEngine.iconAnimationHelper.getEntities(position)) {
                const drawId = entity.get(this._drawableIndex) as number;
                if (this._substituteAnimatedIcons && this._substituteAnimatedIcons.has(drawId)) {
                  entity.addComponent(
                    ComponentNames.SubstituteIcon,
                    this._substituteAnimatedIcons.get(drawId)
                  );
                }
              }
              this._reelsEngine.iconAnimationHelper.stopAnimOnIcon(position, 'anim');
            }),
          ])
        );
      }

      let showWinAction: Action;
      const winAmount = this.getWinAmount();
      if (this._useTextIncrementAction) {
        showWinAction = new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
        (showWinAction as InterpolateCopyAction<number>)
          .withDuration(this._textIncrementDuration)

          .withValues(1.0, winAmount);

        (showWinAction as InterpolateCopyAction<number>).valueChange.listen((win) => {
          this.setTotalWin(Math.round(win));
        });
      } else {
        showWinAction = new FunctionAction(() => this.setTotalWin(winAmount));
      }

      return new SequenceSimpleAction([
        new FunctionAction(() => {
          this._popupCoordinator.onPopupShown(InstantCoinsAnimationProvider.PopupId);

          if (this._pauseBackgroundSound) {
            this._slotSoundController.pauseBackgroundSound();
          }
          this._fadeReelsProvider.EnableFade(true);
        }),
        new ParallelSimpleAction(actions),
        new ParallelSimpleAction([this.getShowPopupAction(), showWinAction]),
        new ParallelSimpleAction([
          this.getHidePopupAction(),
          new FunctionAction(() => {
            if (this._soundName && this._soundName.length > 0) {
              const sound = this._reelsSoundModel.getSoundByName(this._soundName);
              sound.stop();
            }

            if (this._pauseBackgroundSound) {
              this._slotSoundController.playBackgroundSound();
            }

            if (this._winPositionsMarker && this._winPositionsMarker.length > 0) {
              this.removeWinPositions();
            }

            this._popupCoordinator.onPopupHidden(InstantCoinsAnimationProvider.PopupId);
          }),
        ]),
        new FunctionAction(() => this._fadeReelsProvider.EnableFade(false)),
      ]);
    }

    return new EmptyAction().withDuration(0.0);
  }

  private getWinIconPositions(): number[] {
    if (!this._winPositionsMarker) {
      if (
        this._gameStateMachine.curResponse.specialSymbolGroups &&
        this._gameStateMachine.curResponse.specialSymbolGroups.length > 0
      ) {
        return ListUtil.mapMany(
          this._gameStateMachine.curResponse.specialSymbolGroups.filter(
            (p) => p.type == this._marker && p.symbolId == this._payingSymbolId
          ),
          (s) => s.positions!
        );
      }
    } else {
      if (
        this._gameStateMachine.curResponse.winPositions &&
        this._gameStateMachine.curResponse.winPositions.length > 0
      ) {
        return ListUtil.mapMany(
          this._gameStateMachine.curResponse.winPositions.filter(
            (p) => p.type == this._winPositionsMarker && p.symbol == this._payingSymbolId
          ),
          (s) => s.positions
        );
      }
    }

    return [];
  }

  private getWinAmount(): number {
    if (!this._winPositionsMarker) {
      if (
        this._gameStateMachine.curResponse.specialSymbolGroups &&
        this._gameStateMachine.curResponse.specialSymbolGroups.length > 0
      ) {
        const instantCoinsSymbols = this._gameStateMachine.curResponse.specialSymbolGroups.filter(
          (p) => p.type == this._marker && p.symbolId == this._payingSymbolId
        );
        return instantCoinsSymbols.map((s) => s.totalJackPotWin).reduce((w1, w2) => w1 + w2);
      }
    } else {
      if (
        this._gameStateMachine.curResponse.winPositions &&
        this._gameStateMachine.curResponse.winPositions.length > 0
      ) {
        return this._gameStateMachine.curResponse.winPositions
          .filter((p) => p.type == this._winPositionsMarker && p.symbol == this._payingSymbolId)
          .map((p) => p.win)
          .reduce((w1, w2) => w1 + w2);
      }
    }

    return 0.0;
  }

  private removeWinPositions(): void {
    if (
      this._gameStateMachine.curResponse.winPositions &&
      this._gameStateMachine.curResponse.winPositions.length > 0
    ) {
      const winPositionsToRemove = this._gameStateMachine.curResponse.winPositions.filter(
        (p) => p.type == this._winPositionsMarker && p.symbol == this._payingSymbolId
      );
      this._gameStateMachine.curResponse.winPositions =
        this._gameStateMachine.curResponse.winPositions.filter(
          (p) => !winPositionsToRemove.includes(p)
        );
    }
  }

  private setTotalWin(totalWin: number): void {
    if (this._popupScene) {
      const totalWinTextNode = this._popupScene.findById('total_win_text') as TextSceneObject;
      if (totalWinTextNode) {
        totalWinTextNode.text = NumberFormatter.format(totalWin);
      }
    }
  }

  private getShowPopupAction(): Action {
    return new ParallelSimpleAction([
      new FunctionAction(() => {
        if (this._popupScene && this._popupScene.stateMachine) {
          this._popupScene.active = this._popupScene.visible = true;
          this._popupScene.stateMachine.switchToState('anim');
        }

        if (this._soundName && this._soundName.length > 0) {
          const sound = this._reelsSoundModel.getSoundByName(this._soundName);
          sound.stop();
          sound.play();
        }
      }),
      new EmptyAction().withDuration(this._showPopupDelay),
    ]);
  }

  private getHidePopupAction(): Action {
    return new SequenceSimpleAction([
      new ParallelSimpleAction([
        new FunctionAction(() => {
          if (this._popupScene && this._popupScene.stateMachine) {
            this._popupScene.stateMachine.switchToState('default');
          }
        }),
        new EmptyAction().withDuration(this._hidePopupDelay),
      ]),
      new FunctionAction(() => (this._popupScene.active = this._popupScene.visible = false)),
    ]);
  }

  public unload(): void {
    if (this._popupScene) {
      this._popupScene.active = false;

      Promise.resolve().then(() => {
        this._popupScene.deinitialize();
      });
    }
  }
}
