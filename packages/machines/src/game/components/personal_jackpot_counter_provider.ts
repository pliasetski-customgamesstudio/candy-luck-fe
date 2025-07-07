import {
  SceneCommon,
  BonusFinishedArgs,
  InternalJackpotsSpecGroup,
  SpecialSymbolGroup,
  NumberFormatter,
  ISpinResponse,
} from '@cgs/common';
import { LazyAction, StringUtils } from '@cgs/shared';
import {
  Container,
  BitmapTextSceneObject,
  SceneObject,
  ParallelSimpleAction,
  EmptyAction,
  SequenceSimpleAction,
  FunctionAction,
  Action,
  InterpolateCopyAction,
  lerp,
} from '@cgs/syd';
import { SlotSession, SlotSessionProperties } from '../common/slot_session';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { GameComponentProvider } from './game_component_provider';
import { JackpotConfiguredBetsController } from './jackpot_configured_bets_provider';
import { BonusGameProvider } from './mini_game/bonus_game_provider';
import {
  T_BonusGameProvider,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_JackpotConfiguredBetsController,
  T_ResourcesComponent,
} from '../../type_definitions';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { ResourcesComponent } from './resources_component';

export class PersonalJackpotCounterProvider extends GameComponentProvider {
  protected _container: Container;
  protected _gameStateMachine: GameStateMachine<ISpinResponse>;
  protected _sceneCommon: SceneCommon;
  protected _jackpotValueSceneObjects: Map<number, BitmapTextSceneObject> = new Map<
    number,
    BitmapTextSceneObject
  >();
  protected _jackpotAnimSceneObjects: Map<number, SceneObject> = new Map<number, SceneObject>();
  protected _currentJackpotValues: Map<number, number> = new Map<number, number>();
  protected _root: SceneObject;
  protected _jackpotValueSceneObjectIdFormat: string;
  protected _jackpotAnimSceneObjectIdFormat: string;
  protected _bonusSelectedViewRegex: string;
  protected _textIncrementDuration: number;
  protected _initialized: boolean = false;
  protected _loadScene: boolean = false;
  protected _configuredJackpotsProvider: JackpotConfiguredBetsController;
  protected _slotSession: SlotSession;

  constructor(
    container: Container,
    jackpotValueSceneObjectIdFormat: string,
    jackpotAnimSceneObjectIdFormat: string,
    bonusSelectedViewRegex: string,
    textIncrementDuration: number,
    sceneCommon: SceneCommon | null = null,
    loadScene: boolean = false
  ) {
    super();
    this._container = container;
    this._jackpotValueSceneObjectIdFormat = jackpotValueSceneObjectIdFormat;
    this._jackpotAnimSceneObjectIdFormat = jackpotAnimSceneObjectIdFormat;
    this._bonusSelectedViewRegex = bonusSelectedViewRegex;
    this._textIncrementDuration = textIncrementDuration;
    this._sceneCommon = sceneCommon as SceneCommon;
    this._loadScene = loadScene;

    this._configuredJackpotsProvider = container.forceResolve(T_JackpotConfiguredBetsController);
    this._slotSession =
      container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._root = container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
  }

  public get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  public get jackpotValueSceneObjects(): Map<number, BitmapTextSceneObject> {
    return this._jackpotValueSceneObjects;
  }

  public get currentJackpotValues(): Map<number, number> {
    return this._currentJackpotValues;
  }

  public get jackpotAnimSceneObjectIdFormat(): string {
    return this._jackpotAnimSceneObjectIdFormat;
  }

  public get bonusSelectedViewRegex(): string {
    return this._bonusSelectedViewRegex;
  }

  public initialize(): void {
    this.initializeSubscriptions();
  }

  protected initializeSubscriptions(): void {
    this._gameStateMachine.init.entered.listen((_e) => this.onInitialize());
    this._gameStateMachine.stop.entered.listen((_e) => this.updateJackpotValues());
    if (this._configuredJackpotsProvider) {
      this._slotSession.propertyChanged.listen((e) => {
        if (e == SlotSessionProperties.BetIndex || e == SlotSessionProperties.UserChangedBet) {
          this.updateJackpotValues();
        }
      });
    }
    const bonusGameProvider = this._container.forceResolve<BonusGameProvider>(T_BonusGameProvider);
    bonusGameProvider.onMiniGameFinishedEvent.listen((e) => this.setInitialJackpot(e));
  }

  protected onInitialize(): void {
    if (this._initialized) {
      return;
    }

    if (this._loadScene) {
      const jackpotScene = this._sceneCommon.sceneFactory.build('slot/jackpot') as SceneObject;
      jackpotScene.initialize();
      this._root.addChild(jackpotScene);
    }

    const jackpotValues = this.getResponseJackpotValues();

    for (let i = 0; i < jackpotValues.length; i++) {
      const jackpotAnimSceneObject = this.getJackpotAnimSceneObject(i);
      if (jackpotAnimSceneObject?.stateMachine) {
        const animState = jackpotAnimSceneObject.stateMachine.findById('anim');
        if (animState) {
          const jackpotValueSceneObject = this.getJackpotTextSceneObject(i);
          if (jackpotValueSceneObject) {
            const index = i;
            let newJackpotValues: number[] | null = null;
            animState.enterAction = new ParallelSimpleAction([
              animState.enterAction || new EmptyAction(),
              new SequenceSimpleAction([
                new LazyAction(() => {
                  newJackpotValues = this.getResponseJackpotValues();
                  const previousValue = this._currentJackpotValues.has(index)
                    ? this._currentJackpotValues.get(index)
                    : newJackpotValues[index];
                  return this.getIncrementTextAction(
                    index,
                    parseFloat(previousValue?.toString() ?? ''),
                    parseFloat(newJackpotValues[index].toString()),
                    this._textIncrementDuration
                  );
                }),
                new FunctionAction(() => {
                  if (newJackpotValues && newJackpotValues?.length > index) {
                    this._currentJackpotValues.set(
                      index,
                      parseFloat(newJackpotValues[index].toString())
                    );
                  }
                }),
              ]),
            ]);
          }
        }
      }
    }

    this.updateJackpotValues();
    this._initialized = true;
  }

  protected setInitialJackpot(bonusFinishedArgs: BonusFinishedArgs): void {
    if (bonusFinishedArgs) {
      const jackpotIndex = this.parseBonusResult(bonusFinishedArgs.lastSelectedView as string);
      const jackpotInitialValues = this.getInitialResponseJackpotValues();
      if (
        jackpotIndex >= 0 &&
        this._jackpotValueSceneObjects.has(jackpotIndex) &&
        jackpotInitialValues &&
        jackpotInitialValues.length > jackpotIndex
      ) {
        const value = parseFloat(jackpotInitialValues[jackpotIndex].toString());
        this.setJackpotValue(jackpotIndex, value);
        this._currentJackpotValues.set(jackpotIndex, value);
      }
    }
  }

  private parseBonusResult(lastSelectedView: string): number {
    if (lastSelectedView) {
      let regExp = new RegExp(this._bonusSelectedViewRegex);
      let value = regExp.exec(lastSelectedView);
      if (value && value.length > 0) {
        regExp = new RegExp('d+');
        value = regExp.exec(value?.toString());
        return parseInt(value?.toString() ?? '');
      }
    }

    return -1;
  }

  private getIncrementTextAction(
    jackpotIndex: number,
    startValue: number,
    endValue: number,
    duration: number
  ): Action {
    const incrementWinAction = new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
    incrementWinAction.withDuration(duration).withValues(startValue, endValue);

    incrementWinAction.valueChange.listen((value: number) => {
      this.setJackpotValue(jackpotIndex, value);
    });

    return incrementWinAction;
  }

  protected updateJackpotValues(): void {
    const newJackpotValues = this.getResponseJackpotValues();

    for (let i = 0; i < newJackpotValues.length; i++) {
      const jackpotAnimSceneObject = this.getJackpotAnimSceneObject(i);
      if (
        jackpotAnimSceneObject &&
        jackpotAnimSceneObject.stateMachine &&
        (!this._currentJackpotValues.has(i) ||
          this._currentJackpotValues.get(i) != parseFloat(newJackpotValues[i].toString()))
      ) {
        jackpotAnimSceneObject.stateMachine.switchToState('default');
        jackpotAnimSceneObject.stateMachine.switchToState('anim');
      } else {
        this.setJackpotValue(i, parseFloat(newJackpotValues[i].toString()));
      }
    }
  }

  public SetJackpotMultiplier(mult: number): void {
    const newJackpotValues = this.GetMultipliedJackpotValues(mult);

    for (let i = 0; i < newJackpotValues.length; i++) {
      this.setJackpotValueWithMult(i, parseFloat(newJackpotValues[i].toString()));
    }
  }

  public resetJackpotValues(): void {
    const newJackpotValues = this.getResponseInitialJackpotValues();

    for (let i = 0; i < newJackpotValues.length; i++) {
      const jackpotAnimSceneObject = this.getJackpotAnimSceneObject(i);
      if (
        jackpotAnimSceneObject &&
        jackpotAnimSceneObject.stateMachine &&
        (!this._currentJackpotValues.has(i) ||
          this._currentJackpotValues.get(i) != parseFloat(newJackpotValues[i].toString()))
      ) {
        jackpotAnimSceneObject.stateMachine.switchToState('default');
        jackpotAnimSceneObject.stateMachine.switchToState('anim');
      } else {
        this.setJackpotValue(i, parseFloat(newJackpotValues[i].toString()));
      }
    }
  }

  public resetJackpotValue(id: number): void {
    const newJackpotValues = this.getResponseInitialJackpotValues();
    const jackpotAnimSceneObject = this.getJackpotAnimSceneObject(id);
    if (
      jackpotAnimSceneObject &&
      jackpotAnimSceneObject.stateMachine &&
      (!this._currentJackpotValues.has(id) ||
        this._currentJackpotValues.get(id) != newJackpotValues[id])
    ) {
      jackpotAnimSceneObject.stateMachine.switchToState('default');
      jackpotAnimSceneObject.stateMachine.switchToState('anim');
    } else {
      this.setJackpotValue(id, parseFloat(newJackpotValues[id].toString()));
    }
  }

  public ResetJackpotValueWithMultiplier(id: number, mult: number): void {
    const newJackpotValues = this.getResponseInitialJackpotValues();
    for (let i = 0; i < newJackpotValues.length; i++) {
      newJackpotValues[i] *= mult;
    }
    const jackpotAnimSceneObject = this.getJackpotAnimSceneObject(id);
    if (
      jackpotAnimSceneObject &&
      jackpotAnimSceneObject.stateMachine &&
      (!this._currentJackpotValues.has(id) ||
        this._currentJackpotValues.get(id) != newJackpotValues[id])
    ) {
      jackpotAnimSceneObject.stateMachine.switchToState('default');
      jackpotAnimSceneObject.stateMachine.switchToState('anim');
    } else {
      this.setJackpotValueWithMult(id, parseFloat(newJackpotValues[id].toString()));
    }
  }

  protected getResponseInitialJackpotValues(): number[] {
    let jackpotGroup = this._gameStateMachine.curResponse
      .additionalData as InternalJackpotsSpecGroup;
    if (!jackpotGroup) {
      if (
        this._gameStateMachine.prevResponse &&
        (this._gameStateMachine.prevResponse.additionalData as InternalJackpotsSpecGroup)
      )
        jackpotGroup = this._gameStateMachine.prevResponse
          .additionalData as InternalJackpotsSpecGroup;
      else return [];
    }

    if (
      this._configuredJackpotsProvider &&
      this._configuredJackpotsProvider.CurrentJackpots &&
      !this._configuredJackpotsProvider.CurrentJackpots.some((x) => typeof x !== 'number')
    ) {
      const _configuredJackpotsValues: number[] = [];
      if (
        jackpotGroup.jackPotInitialValues &&
        jackpotGroup.jackPotInitialValues.some((x) => typeof x === 'number')
      ) {
        let jackpotWin = null;
        if (
          this._gameStateMachine.curResponse &&
          this._gameStateMachine.curResponse.specialSymbolGroups &&
          this._gameStateMachine.curResponse.specialSymbolGroups.some((x) => x.type == 'JackPotWin')
        ) {
          jackpotWin = this._gameStateMachine.curResponse.specialSymbolGroups.find(
            (x) => x.type == 'JackPotWin'
          );
          const jpIncrement = new SpecialSymbolGroup();
          jpIncrement.type = 'JackpotIncrement';
          jpIncrement.totalJackPotWin = jackpotGroup.jackPotValues[jackpotWin!.symbolId!];
          this._gameStateMachine.curResponse.specialSymbolGroups.push(jpIncrement);
        }

        for (let i = 0; i < jackpotGroup.jackPotInitialValues.length; i++) {
          if (jackpotWin && jackpotWin.symbolId != i) {
            _configuredJackpotsValues.push(
              parseFloat(jackpotGroup.jackPotValues[i].toString()) +
                this._configuredJackpotsProvider.CurrentJackpots[i]
            );
          } else if (jackpotWin && jackpotWin.symbolId == i) {
            _configuredJackpotsValues.push(
              parseFloat(jackpotGroup.jackPotInitialValues[i].toString()) +
                this._configuredJackpotsProvider.CurrentJackpots[i]
            );
            (
              this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
            ).jackPotValues[i] = (
              this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
            ).jackPotInitialValues[i];
          } else {
            _configuredJackpotsValues.push(
              parseFloat(jackpotGroup.jackPotInitialValues[i].toString()) +
                this._configuredJackpotsProvider.CurrentJackpots[i]
            );
          }
        }
      } else {
        for (let i = 0; i < jackpotGroup.jackPotValues.length; i++) {
          _configuredJackpotsValues.push(
            jackpotGroup.jackPotValues[i] + this._configuredJackpotsProvider.CurrentJackpots[i]
          );
        }
      }

      return _configuredJackpotsValues;
    }

    if (
      jackpotGroup.jackPotInitialValues &&
      jackpotGroup.jackPotInitialValues.some((x) => typeof x === 'number')
    ) {
      const _configuredJackpotsValues: number[] = [];
      if (
        jackpotGroup.jackPotInitialValues &&
        jackpotGroup.jackPotInitialValues.some((x) => typeof x === 'number')
      ) {
        let jackpotWin = null;
        if (
          this._gameStateMachine.curResponse &&
          this._gameStateMachine.curResponse.specialSymbolGroups &&
          this._gameStateMachine.curResponse.specialSymbolGroups.some((x) => x.type == 'JackPotWin')
        ) {
          jackpotWin = this._gameStateMachine.curResponse.specialSymbolGroups.find(
            (x) => x.type == 'JackPotWin'
          );
        }

        for (let i = 0; i < jackpotGroup.jackPotInitialValues.length; i++) {
          if (jackpotWin && jackpotWin.symbolId != i) {
            _configuredJackpotsValues.push(parseFloat(jackpotGroup.jackPotValues[i].toString()));
          } else if (jackpotWin && jackpotWin.symbolId == i) {
            _configuredJackpotsValues.push(jackpotGroup.jackPotInitialValues[i]);
            (
              this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
            ).jackPotValues[i] = (
              this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
            ).jackPotInitialValues[i];
          } else {
            _configuredJackpotsValues.push(
              parseFloat(jackpotGroup.jackPotInitialValues[i].toString())
            );
          }
        }
      }

      return _configuredJackpotsValues;
    } else {
      return jackpotGroup.jackPotValues;
    }
  }

  protected setJackpotValue(jackpotIndex: number, jackpotValue: number): void {
    const jackpotTextSceneObject = this.getJackpotTextSceneObject(jackpotIndex);
    if (jackpotTextSceneObject) {
      jackpotTextSceneObject.text = NumberFormatter.formatMoneyShort(jackpotValue, 7);
    }
  }

  protected setJackpotValueWithMult(jackpotIndex: number, jackpotValue: number): void {
    const jackpotTextSceneObject = this.getJackpotTextSceneObject(jackpotIndex);
    if (jackpotTextSceneObject) {
      jackpotTextSceneObject.text = NumberFormatter.formatMoneyShort(jackpotValue, 7);
    }
  }

  protected getResponseJackpotValues(): number[] {
    let jackpotGroup: InternalJackpotsSpecGroup = this._gameStateMachine.curResponse.additionalData;

    if (!jackpotGroup) {
      if (this._gameStateMachine.prevResponse?.additionalData)
        jackpotGroup = this._gameStateMachine.prevResponse.additionalData;
      else return [];
    }

    if (!this._configuredJackpotsProvider) {
      this._configuredJackpotsProvider =
        this._container.forceResolve<JackpotConfiguredBetsController>(
          T_JackpotConfiguredBetsController
        );
    }

    if (
      this._configuredJackpotsProvider &&
      this._configuredJackpotsProvider.CurrentJackpots &&
      !this._configuredJackpotsProvider.CurrentJackpots.some((x) => typeof x !== 'number')
    ) {
      const _configuredJackpotsValues: number[] = [];
      for (let i = 0; i < jackpotGroup.jackPotValues.length; i++) {
        _configuredJackpotsValues.push(
          parseFloat(jackpotGroup.jackPotValues[i].toString()) +
            this._configuredJackpotsProvider.CurrentJackpots[i]
        );
      }

      return _configuredJackpotsValues;
    }

    return jackpotGroup.jackPotValues;
  }

  private GetMultipliedJackpotValues(mult: number): number[] {
    let jackpotGroup = this._gameStateMachine.curResponse
      .additionalData as InternalJackpotsSpecGroup;
    if (!jackpotGroup) {
      if (
        this._gameStateMachine.prevResponse &&
        (this._gameStateMachine.prevResponse.additionalData as InternalJackpotsSpecGroup)
      )
        jackpotGroup = this._gameStateMachine.prevResponse
          .additionalData as InternalJackpotsSpecGroup;
      else return [];
    }
    if (!this._configuredJackpotsProvider) {
      this._configuredJackpotsProvider =
        this._container.forceResolve<JackpotConfiguredBetsController>(
          T_JackpotConfiguredBetsController
        );
    }
    if (
      this._configuredJackpotsProvider &&
      this._configuredJackpotsProvider.CurrentJackpots &&
      !this._configuredJackpotsProvider.CurrentJackpots.some((x) => typeof x !== 'number')
    ) {
      const _configuredJackpotsValues: number[] = [];
      for (let i = 0; i < jackpotGroup.jackPotValues.length; i++) {
        _configuredJackpotsValues.push(
          parseFloat(jackpotGroup.jackPotValues[i].toString()) +
            this._configuredJackpotsProvider.CurrentJackpots[i] * mult
        );
      }

      return _configuredJackpotsValues;
    }

    return jackpotGroup.jackPotValues;
  }

  protected getInitialResponseJackpotValues(): number[] {
    const jackpotGroup = this._gameStateMachine.curResponse
      .additionalData as InternalJackpotsSpecGroup;
    if (!jackpotGroup) {
      if (
        this._gameStateMachine.prevResponse &&
        (this._gameStateMachine.prevResponse.additionalData as InternalJackpotsSpecGroup)
      )
        return this._gameStateMachine.prevResponse.additionalData.jackPotInitialValues;
      else return [];
    }

    return jackpotGroup.jackPotInitialValues;
  }

  protected getJackpotTextSceneObject(index: number): BitmapTextSceneObject | null {
    if (!this._jackpotValueSceneObjects.has(index)) {
      const textSceneObject = this._root.findById(
        StringUtils.format(this._jackpotValueSceneObjectIdFormat, [index.toString()])
      ) as BitmapTextSceneObject;
      if (textSceneObject) {
        this._jackpotValueSceneObjects.set(index, textSceneObject);
      }
    }

    return this._jackpotValueSceneObjects.has(index)
      ? (this._jackpotValueSceneObjects.get(index) as BitmapTextSceneObject)
      : null;
  }

  private getJackpotAnimSceneObject(index: number): SceneObject | null {
    if (!this._jackpotAnimSceneObjects.has(index)) {
      const animSceneObject = this._root.findById(
        StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [index.toString()])
      );
      if (animSceneObject) {
        this._jackpotAnimSceneObjects.set(index, animSceneObject);
      }
    }

    return this._jackpotAnimSceneObjects.has(index)
      ? this._jackpotAnimSceneObjects.get(index)!
      : null;
  }
}
