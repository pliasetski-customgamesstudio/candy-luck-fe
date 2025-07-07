import {
  Container,
  Action,
  IntervalAction,
  FunctionAction,
  EmptyAction,
  ParallelAction,
  Vector2,
  SceneObject,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IReelsEngineProvider } from '../../../reels_engine/game_components_providers/i_reels_engine_provider';
import { ISlotGameEngineProvider } from '../../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { AbstractAnticipationConfig } from '../../../reels_engine/game_config/abstract_anticipation_config';
import { AbstractSpinConfig } from '../../../reels_engine/game_config/abstract_spin_config';
import { AnticipationConfig } from '../../../reels_engine/game_config/game_config';
import { IIconModel } from '../../../reels_engine/i_icon_model';
import { ReelsEngine } from '../../../reels_engine/reels_engine';
import { ReelsSoundModel } from '../../../reels_engine/reels_sound_model';
import { GameStateMachine } from '../../../reels_engine/state_machine/game_state_machine';
import { IconModelComponent } from '../icon_model_component';
import { IGameConfigProvider } from '../interfaces/i_game_config_provider';
import { RegularSpinsSoundModelComponent } from '../regular_spins_sound_model_component';
import { ResourcesComponent } from '../resources_component';
import { ISpinResponse, SceneCommon } from '@cgs/common';
import {
  T_ISlotGameEngineProvider,
  T_IGameStateMachineProvider,
  T_IGameConfigProvider,
  T_ResourcesComponent,
  T_RegularSpinsSoundModelComponent,
  T_IconModelComponent,
} from '../../../type_definitions';

export class AnticipationAnimationProvider {
  private _reelsEngine: ReelsEngine;
  get reelsEngine(): ReelsEngine {
    return this._reelsEngine;
  }
  set reelsEngine(value: ReelsEngine) {
    this._reelsEngine = value;
  }
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }
  set gameStateMachine(value: GameStateMachine<ISpinResponse>) {
    this._gameStateMachine = value;
  }
  private _reelSoundModel: ReelsSoundModel;
  get reelSoundModel(): ReelsSoundModel {
    return this._reelSoundModel;
  }
  set reelSoundModel(value: ReelsSoundModel) {
    this._reelSoundModel = value;
  }
  private _spinConfig: AbstractSpinConfig;
  get spinConfig(): AbstractSpinConfig {
    return this._spinConfig;
  }
  set spinConfig(value: AbstractSpinConfig) {
    this._spinConfig = value;
  }
  private _anticipationConfig: AbstractAnticipationConfig;
  get anticipationConfig(): AbstractAnticipationConfig {
    return this._anticipationConfig;
  }
  set anticipationConfig(value: AbstractAnticipationConfig) {
    this._anticipationConfig = value;
  }
  private _gameResourceProvider: ResourcesComponent;
  get gameResourceProvider(): ResourcesComponent {
    return this._gameResourceProvider;
  }
  set gameResourceProvider(value: ResourcesComponent) {
    this._gameResourceProvider = value;
  }
  private _iconModel: IIconModel;
  get iconModel(): IIconModel {
    return this._iconModel;
  }
  set iconModel(value: IIconModel) {
    this._iconModel = value;
  }
  private _symbols: Map<number, number[]> = new Map<number, number[]>();
  get symbols(): Map<number, number[]> {
    return this._symbols;
  }
  private _acceleratedReels: number[] = [];
  get acceleratedReels(): number[] {
    return this._acceleratedReels;
  }
  set acceleratedReels(value: number[]) {
    this._acceleratedReels = value;
  }
  protected _container: Container;
  get container(): Container {
    return this._container;
  }
  private _sceneCommon: SceneCommon;
  get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }
  private _stopSpinSound: boolean = false;
  private _anticipationReelSoundEnable: boolean = false;
  get anticipationReelSoundEnable(): boolean {
    return this._anticipationReelSoundEnable;
  }
  set anticipationReelSoundEnable(value: boolean) {
    this._anticipationReelSoundEnable = value;
  }

  constructor(container: Container, sceneCommon: SceneCommon, stopSpinSound: boolean = true) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._stopSpinSound = stopSpinSound;

    this._reelsEngine = (
      this._container.forceResolve<ISlotGameEngineProvider>(
        T_ISlotGameEngineProvider
      ) as IReelsEngineProvider
    ).reelsEngine;
    this._gameStateMachine = (
      this._container.forceResolve<IGameStateMachineProvider>(
        T_IGameStateMachineProvider
      ) as IGameStateMachineProvider
    ).gameStateMachine;
    this._spinConfig = (
      this._container.forceResolve<IGameConfigProvider>(
        T_IGameConfigProvider
      ) as IGameConfigProvider
    ).gameConfig.regularSpinConfig;
    this._anticipationConfig = (
      this._container.forceResolve<IGameConfigProvider>(
        T_IGameConfigProvider
      ) as IGameConfigProvider
    ).gameConfig.anticipationConfig as AnticipationConfig;
    this._gameResourceProvider = this._container.forceResolve<ResourcesComponent>(
      T_ResourcesComponent
    ) as ResourcesComponent;
    this._reelSoundModel = this._container.forceResolve<RegularSpinsSoundModelComponent>(
      T_RegularSpinsSoundModelComponent
    ).regularSpinSoundModel as ReelsSoundModel;
    this._iconModel = (
      this._container.forceResolve<IconModelComponent>(T_IconModelComponent) as IconModelComponent
    ).iconModel;

    this._gameStateMachine.shortWinLines.leaved.listen((_e) => this.StopAnimation());
    this._gameStateMachine.regularSpins.leaved.listen((_e) => this.StopAnimation());
    this._gameStateMachine.beginBonus.leaved.listen((_e) => this.StopAnimation());
    this._gameStateMachine.beginScatter.leaved.listen((_e) => this.StopAnimation());
    this._gameStateMachine.beginFreeSpins.leaved.listen((_e) => this.StopAnimation());

    this.InitSymbols();
  }

  private InitSymbols(): void {
    for (const anticipationIcon of this._anticipationConfig.anticipationIcons) {
      this._symbols.set(anticipationIcon, []);
    }
  }

  RemoveScene(symbolId: number): void {
    this._acceleratedReels = [];

    for (let reel = 0; reel < this._reelsEngine.ReelConfig.reelCount; reel++) {
      const reelAnticipation = this._gameResourceProvider.slot.findById(
        `anticipation_${symbolId}_${reel}`
      );
      if (reelAnticipation) {
        const children = [...reelAnticipation.childs];
        reelAnticipation.removeAllChilds();
        for (const child of children) {
          child.deinitialize();
        }
      }
    }
  }

  private StopAnimation(): void {
    this._symbols.forEach((value, key) => this.RemoveScene(key));
  }

  stopAccelerationSound(): void {
    this._reelSoundModel.reelAccelerationSound.GoToState('default');
  }

  public ClearSymbols(): void {
    this._symbols.clear();
    this.InitSymbols();
    this._anticipationReelSoundEnable = false;
  }

  protected CheckWin(reel: number): boolean {
    let possible = false;
    this._symbols.forEach((v, k) => {
      if (this.isWinPossible(k, reel)) {
        possible = true;
      }
    });
    return possible;
  }

  AnticipationAction(reel: number): Action {
    if (this.CheckWin(reel)) {
      for (const symbolId of this._anticipationConfig.anticipationIcons) {
        if (this._gameStateMachine.curResponse.viewReels[reel].includes(symbolId)) {
          if (!this._symbols.get(symbolId)?.includes(reel)) {
            this._symbols.get(symbolId)?.push(reel);
          }
        }
      }

      const symbolActions: Map<number, IntervalAction> = new Map<number, IntervalAction>();
      const accelerateActions: IntervalAction[] = [];
      const iconAnimationActions: IntervalAction[] = [];
      // const fadeReelsProvider = this._container.forceResolve<IFadeReelsProvider>(T_IFadeReelsProvider) as IFadeReelsProvider;

      // const i = 0;
      this._symbols.forEach((value, key) => {
        const actions: IntervalAction[] = [];

        if (value.length > 0 && this.isWinPossible(key, reel + 1)) {
          for (let r = reel + 1; r < this._reelsEngine.ReelConfig.reelCount; r++) {
            if (
              !this._acceleratedReels.includes(r) &&
              this._anticipationConfig.anticipationReels[
                this._anticipationConfig.anticipationIcons.indexOf(key)
              ].includes(r)
            ) {
              accelerateActions.push(this.AccelerateAction(r));
              this._acceleratedReels.push(r);
            }
          }

          if (value.includes(reel)) {
            const icon = this._iconModel.getStaticIcon(key).find((_) => true);
            const state = icon?.stateMachine!.findById('anim');

            iconAnimationActions.push(state?.enterAction as IntervalAction);

            const anticipationScene = this._sceneCommon.sceneFactory.build(
              `additional/anticipator_${key}`
            ) as SceneObject;
            anticipationScene.initialize();
            anticipationScene.disable();
            anticipationScene.z = 999999;

            const placeholder = this._gameResourceProvider.slot.findById(
              `anticipation_${key}_${reel}`
            );
            placeholder?.addChild(anticipationScene);

            actions.push(new FunctionAction(anticipationScene.enable));
            const reelIndex = value.indexOf(reel);
            if (reelIndex > 0) {
              actions.push(
                new FunctionAction(() =>
                  this._reelSoundModel
                    .anticipatorSound(key, value[reelIndex - 1])
                    .GoToState('default')
                )
              );
            }
            actions.push(this.AnticipationSoundAction(key, reel));
          }

          actions.push(
            new EmptyAction().withDuration(
              value.includes(reel)
                ? this._anticipationConfig.continueDurationAnticipating
                : this._anticipationConfig.continueDurationNotAnticipating
            )
          );

          symbolActions.set(key, new ParallelAction(actions));
        }
      });

      if (accelerateActions.length > 0) {
        accelerateActions.push(this.AccelerationSoundAction());
      }

      let result: IntervalAction | null = null;
      this._symbols.forEach((value, key) => {
        if (value.includes(reel) && symbolActions.has(key)) {
          result = new ParallelAction([
            this.RemoveAnticipations(reel + 1),
            new ParallelAction(accelerateActions),
            new ParallelAction(iconAnimationActions),
            symbolActions?.get(key) as IntervalAction,
          ]);
        }
      });
      if (result) {
        return result;
      }

      return new ParallelAction([
        this.RemoveAnticipations(reel + 1),
        new ParallelAction(accelerateActions),
        symbolActions.size > 0 ? (symbolActions.get(1) as IntervalAction) : new EmptyAction(),
      ]);
    }

    return new EmptyAction();
  }

  public RemoveAnticipations(reel: number): IntervalAction {
    const actions: IntervalAction[] = [];
    this._symbols.forEach((value, key) => {
      if (value.length > 0 && !this.isWinPossible(key, reel)) {
        actions.push(
          new FunctionAction(() => {
            value.length = 0;
            this.RemoveScene(key);
          })
        );
      }
    });
    return new ParallelAction(actions);
  }

  public AccelerateAction(reel: number): IntervalAction {
    const currentSpeed =
      this._anticipationConfig.anticipatedSpinSpeed * this._spinConfig.directions[reel];
    const maxSpeedConfig = this._anticipationConfig.maxSpeed;
    return new FunctionAction(() =>
      this._reelsEngine.accelerateReel(
        reel,
        new Vector2(0.0, this._spinConfig.spinSpeed * this._spinConfig.directions[reel]),
        new Vector2(0.0, maxSpeedConfig < currentSpeed ? maxSpeedConfig : currentSpeed),
        this._anticipationConfig.acceleratedDuration
      )
    );
  }

  public AccelerationSoundAction(): IntervalAction {
    return new FunctionAction(() => {
      this._reelSoundModel.reelAccelerationSound.GoToState('default');
      this._reelSoundModel.reelAccelerationSound.GoToState('start');
    });
  }

  public AnticipationSoundAction(symbolId: number, reel: number): IntervalAction {
    return new FunctionAction(() => {
      if (!this._anticipationReelSoundEnable) {
        if (this._stopSpinSound) {
          this._reelSoundModel.startSpinSound.GoToState('stop_sound');
        }
        this._reelSoundModel.anticipatorSound(symbolId, reel).GoToState('default');
        this._reelSoundModel.anticipatorSound(symbolId, reel).GoToState('start');
        this._anticipationReelSoundEnable = true;
      }
    });
  }

  protected isWinPossible(symbolId: number, reel: number): boolean {
    const reelsLeft = this._anticipationConfig.anticipationReels[
      this._anticipationConfig.anticipationIcons.indexOf(symbolId)
    ].filter((r) => r >= reel).length;
    return (
      (!(this._symbols.size > 0) && reelsLeft >= this._anticipationConfig.minIconsForWin) ||
      (this._symbols.size > 0 &&
        this._anticipationConfig.minIconsForWin - (this._symbols.get(symbolId)?.length as number) <=
          reelsLeft)
    );
  }
}
