import { SceneCommon, InternalJackpotsSpecGroup, ISpinResponse } from '@cgs/common';
import { StringUtils, LazyAction } from '@cgs/shared';
import {
  Container,
  SceneObject,
  TextSceneObject,
  ParallelSimpleAction,
  EmptyAction,
  SequenceSimpleAction,
  FunctionAction,
  Action,
} from '@cgs/syd';
import { ISlotSessionProvider } from './interfaces/i_slot_session_provider';
import { JackPotSpinActionProvider } from './jackpot_spin_action_provider';
import { BonusGameProvider } from './mini_game/bonus_game_provider';
import { PersonalJackpotCounterProvider } from './personal_jackpot_counter_provider';
import { ResourcesComponent } from './resources_component';
import {
  T_BonusGameProvider,
  T_IGameStateMachineProvider,
  T_ISlotSessionProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { SlotSession, SlotSessionProperties } from '../common/slot_session';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { FreeSpinsInfoConstants } from '../../reels_engine/state_machine/free_spins_info_constants';

export class SpinningPersonalJackpotCounterProvider extends PersonalJackpotCounterProvider {
  protected _currentNodeJackpotValues: Map<number, Map<number, number>> = new Map<
    number,
    Map<number, number>
  >();
  protected _jackPotSpinActionProviders: JackPotSpinActionProvider[][];
  protected _spinningJackpotIndexes: number[] | null;
  protected _maxDigitCount: number;
  protected _isNeedCentering: boolean;
  protected _isNeedPadRight: boolean;

  constructor(
    container: Container,
    jackpotValueSceneObjectIdFormat: string,
    jackpotAnimSceneObjectIdFormat: string,
    bonusSelectedViewRegex: string,
    textIncrementDuration: number,
    sceneCommon: SceneCommon | null = null,
    loadScene: boolean = false,
    spinningJackpotIndexes: number[] | null = null,
    maxDigitCount: number = 9,
    isNeedCentering: boolean = false,
    isNeedPadRight: boolean = false
  ) {
    super(
      container,
      jackpotValueSceneObjectIdFormat,
      jackpotAnimSceneObjectIdFormat,
      bonusSelectedViewRegex,
      textIncrementDuration
    );
    this._container = container;
    this._jackpotValueSceneObjectIdFormat = jackpotValueSceneObjectIdFormat;
    this._jackpotAnimSceneObjectIdFormat = jackpotAnimSceneObjectIdFormat;
    this._bonusSelectedViewRegex = bonusSelectedViewRegex;
    this._textIncrementDuration = textIncrementDuration;
    this._sceneCommon = sceneCommon as SceneCommon;
    this._loadScene = loadScene;
    this._spinningJackpotIndexes = spinningJackpotIndexes;
    this._maxDigitCount = maxDigitCount;
    this._isNeedCentering = isNeedCentering;
    this._isNeedPadRight = isNeedPadRight;
    this._jackPotSpinActionProviders = new Array<Array<JackPotSpinActionProvider>>();
    this._root = this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root;
  }

  public get container(): Container {
    return this._container;
  }

  public get gameStateMachine(): GameStateMachine<ISpinResponse> {
    return this._gameStateMachine;
  }

  public set gameStateMachine(value: GameStateMachine<ISpinResponse>) {
    this._gameStateMachine = value;
  }

  public get sceneCommon(): SceneCommon {
    return this._sceneCommon;
  }

  public get currentNodeJackpotValues(): Map<number, Map<number, number>> {
    return this._currentNodeJackpotValues;
  }

  public get root(): SceneObject {
    return this._root;
  }

  public get jackpotAnimSceneObjectIdFormat(): string {
    return this._jackpotAnimSceneObjectIdFormat;
  }

  public get textIncrementDuration(): number {
    return this._textIncrementDuration;
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public set initialized(value: boolean) {
    this._initialized = value;
  }

  public get loadScene(): boolean {
    return this._loadScene;
  }

  public get jackPotSpinActionProviders(): JackPotSpinActionProvider[][] {
    return this._jackPotSpinActionProviders;
  }

  public get slotSession(): SlotSession {
    return this._slotSession;
  }

  public set slotSession(value: SlotSession) {
    this._slotSession = value;
  }

  public get spinningJackpotIndexes(): number[] {
    return this._spinningJackpotIndexes!;
  }

  public set spinningJackpotIndexes(value: number[]) {
    this._spinningJackpotIndexes = value;
  }

  public get maxDigitCount(): number {
    return this._maxDigitCount;
  }

  public get isNeedCentering(): boolean {
    return this._isNeedCentering;
  }

  public get isNeedPadRight(): boolean {
    return this._isNeedPadRight;
  }

  public initialize(): void {
    this.initializeSubscriptions();
  }

  protected initializeSubscriptions(): void {
    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameStateMachine.init.entered.listen(() => this.onInitialize());
    this._gameStateMachine.stop.entered.listen(() => this.updateOnStopping());
    this._slotSession =
      this._container.forceResolve<ISlotSessionProvider>(T_ISlotSessionProvider).slotSession;
    if (this._configuredJackpotsProvider) {
      this._slotSession.propertyChanged.listen((e) => {
        if (e === SlotSessionProperties.BetIndex || e === SlotSessionProperties.UserChangedBet) {
          this.updateJackpotValuesZeroDurationInternal();
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
      const jackpotScene = this._sceneCommon.sceneFactory.build('slot/jackpot')!;
      jackpotScene.initialize();
      this._root.addChild(jackpotScene);
    }

    const jackpotValues = this.getResponseJackpotValues();

    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    for (let i = 0; i < jackpotValues.length; i++) {
      this._jackPotSpinActionProviders.push(new Array<JackPotSpinActionProvider>());

      const jackPotNodes = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [i]));
      for (let numb = 0; numb < jackPotNodes.length; numb++) {
        let digitsCount = this._maxDigitCount;
        const countNode = jackPotNodes[numb].findById('digits_count') as TextSceneObject;
        if (countNode) {
          digitsCount = parseInt(countNode.text);
        }
        const jackpotSpinningNumbers = new JackPotSpinActionProvider(
          this._container,
          jackPotNodes[numb],
          this._sceneCommon,
          digitsCount,
          this._isNeedCentering,
          this._isNeedPadRight
        );
        jackPotNodes[numb].addChild(jackpotSpinningNumbers.getScene());
        const initDiffValue =
          parseFloat(jackpotValues[i].toString()) * 0.001 > 20
            ? parseFloat(jackpotValues[i].toString()) * 0.001
            : parseFloat(jackpotValues[i].toString()) * 0.01;
        if (this._spinningJackpotIndexes && this._spinningJackpotIndexes.includes(i)) {
          jackpotSpinningNumbers.initializeStartingJackpot(
            parseFloat(jackpotValues[i].toString()) - initDiffValue
          );
          if (!this._currentNodeJackpotValues.has(i)) {
            this._currentNodeJackpotValues.set(i, new Map<number, number>());
          }
          this._currentNodeJackpotValues
            .get(i)!
            .set(numb, parseFloat(jackpotValues[i].toString()) - initDiffValue);
        } else {
          jackpotSpinningNumbers.setStatic(true);
          jackpotSpinningNumbers.initializeStartingJackpot(parseFloat(jackpotValues[i].toString()));
        }
        this._jackPotSpinActionProviders[i].push(jackpotSpinningNumbers);
        if (jackPotNodes[numb] && jackPotNodes[numb].stateMachine) {
          const animState = jackPotNodes[numb].stateMachine!.findById('anim');
          if (animState) {
            const jackpotValueSceneObject = this.getJackpotTextSceneObject(i);
            if (jackpotValueSceneObject) {
              const index = i;
              const number = numb;
              let newJackpotValues: number[] | null = null;
              animState.enterAction = new ParallelSimpleAction([
                new EmptyAction(),
                new SequenceSimpleAction([
                  new LazyAction(() => {
                    newJackpotValues = this.getResponseJackpotValues();
                    const previousValue =
                      this._currentNodeJackpotValues.has(index) &&
                      this._currentNodeJackpotValues.get(index)!.has(number)
                        ? this._currentNodeJackpotValues.get(index)!.get(number)
                        : newJackpotValues[index];
                    return this.getNodeIncrementTextAction(
                      index,
                      number,
                      parseFloat(previousValue!.toString()),
                      parseFloat(newJackpotValues[index].toString()),
                      this._textIncrementDuration
                    );
                  }),
                  new FunctionAction(() => {
                    if (newJackpotValues && newJackpotValues.length > index) {
                      if (!this._currentNodeJackpotValues.has(index)) {
                        this._currentNodeJackpotValues.set(index, new Map<number, number>());
                      }
                      this._currentNodeJackpotValues
                        .get(index)!
                        .set(number, parseFloat(newJackpotValues[index].toString()));
                    }
                  }),
                ]),
              ]);
            }
          }
        }
      }
    }

    this.updateJackpotValuesInternal();
    this._initialized = true;
  }

  private getNodeIncrementTextAction(
    jackpotIndex: number,
    number: number,
    startValue: number,
    endValue: number,
    _duration: number
  ): Action {
    return this._jackPotSpinActionProviders[jackpotIndex][number].updateJackpot(
      startValue,
      endValue
    );
  }

  protected updateJackpotValues(): void {
    this.updateJackpotValuesInternal();
  }

  private updateOnStopping(): void {
    if (
      (this._gameStateMachine.curResponse.isFreeSpins &&
        this._gameStateMachine.curResponse.freeSpinsInfo?.name === 'freeRespin' &&
        this._gameStateMachine.curResponse.freeSpinsInfo.event !==
          FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
        this._gameStateMachine.curResponse.freeSpinsInfo.event !==
          FreeSpinsInfoConstants.FreeSpinsStarted) ||
      (this._gameStateMachine.curResponse.isFreeSpins &&
        this._gameStateMachine.curResponse.freeSpinsInfo?.event ===
          FreeSpinsInfoConstants.FreeSpinsGroupSwitched &&
        this._gameStateMachine.prevResponse.isFreeSpins &&
        this._gameStateMachine.prevResponse.freeSpinsInfo?.name === 'freeRespin')
    ) {
      return;
    }
    this.updateJackpotValuesInternal();
  }

  private updateJackpotValuesInternal(): void {
    const newJackpotValues = this.getResponseJackpotValues();

    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    for (let i = 0; i < newJackpotValues.length; i++) {
      const jackpotAnimSceneObject = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [i]));
      for (let numb = 0; numb < jackpotAnimSceneObject.length; numb++) {
        if (
          jackpotAnimSceneObject[numb] &&
          jackpotAnimSceneObject[numb].stateMachine &&
          (!this._currentNodeJackpotValues.has(i) ||
            !this._currentNodeJackpotValues.get(i)!.has(numb) ||
            this._currentNodeJackpotValues.get(i)!.get(numb) !=
              parseFloat(newJackpotValues[i].toString()))
        ) {
          if (
            this._currentNodeJackpotValues.has(i) &&
            this._currentNodeJackpotValues.get(i)!.has(numb) &&
            this._currentNodeJackpotValues.get(i)!.get(numb)! >
              parseFloat(newJackpotValues[i].toString())
          ) {
            this._jackPotSpinActionProviders[i][numb].setDrawActive(false);
            jackpotAnimSceneObject[numb].stateMachine!.switchToState('default');
            this._jackPotSpinActionProviders[i][numb].setDrawActive(true);
            this._jackPotSpinActionProviders[i][numb].drawNumbers(newJackpotValues[i], true);
          } else if (
            this._currentNodeJackpotValues.has(i) &&
            this._currentNodeJackpotValues.get(i)!.has(numb) &&
            this._spinningJackpotIndexes &&
            !this._spinningJackpotIndexes.includes(i)
          ) {
            this._jackPotSpinActionProviders[i][numb].setDrawActive(false);
            jackpotAnimSceneObject[numb].stateMachine!.switchToState('default');
            this._jackPotSpinActionProviders[i][numb].setDrawActive(true);
            this._jackPotSpinActionProviders[i][numb].drawNumbers(newJackpotValues[i], true);
          } else {
            this._jackPotSpinActionProviders[i][numb].setDrawActive(false);
            jackpotAnimSceneObject[numb].stateMachine!.switchToState('default');
            this._jackPotSpinActionProviders[i][numb].setDrawActive(true);
            jackpotAnimSceneObject[numb].stateMachine!.switchToState('anim');
          }
        } else {
          this.setJackpotValue(i, parseFloat(newJackpotValues[i].toString()));
        }
        if (!this._currentNodeJackpotValues.has(i)) {
          this._currentNodeJackpotValues.set(i, new Map<number, number>());
        }
        this._currentNodeJackpotValues
          .get(i)!
          .set(numb, parseFloat(newJackpotValues[i].toString()));
      }
    }
  }

  public resetJackpotValues(): void {
    this.resetJackpotValuesInternal();
  }

  private resetJackpotValuesInternal(): void {
    const newJackpotValues = this.getResponseInitialJackpotValues();

    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    for (let i = 0; i < newJackpotValues.length; i++) {
      const jackpotAnimNode = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [i]));
      for (let numb = 0; numb < jackpotAnimNode.length; numb++) {
        if (
          jackpotAnimNode[numb] &&
          jackpotAnimNode[numb].stateMachine &&
          (!this._currentNodeJackpotValues.has(i) ||
            !this._currentNodeJackpotValues.get(i)!.has(numb) ||
            this._currentNodeJackpotValues.get(i)!.get(numb) !=
              parseFloat(newJackpotValues[i].toString()))
        ) {
          this._jackPotSpinActionProviders[i][numb].setDrawActive(false);
          jackpotAnimNode[numb].stateMachine!.switchToState('default');
          this._jackPotSpinActionProviders[i][numb].setDrawActive(true);
          this._jackPotSpinActionProviders[i][numb].drawNumbers(newJackpotValues[i], true);
          if (newJackpotValues && newJackpotValues.length > i) {
            if (!this._currentNodeJackpotValues.has(i)) {
              this._currentNodeJackpotValues.set(i, new Map<number, number>());
            }
            this._currentNodeJackpotValues
              .get(i)!
              .set(numb, parseFloat(newJackpotValues[i].toString()));
            (
              this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
            ).jackPotValues[i] = (
              this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
            ).jackPotInitialValues[i];
          }
        } else {
          this.setJackpotValue(i, parseFloat(newJackpotValues[i].toString()));
        }
      }
    }
  }

  public resetJackpotValue(id: number): void {
    this.resetJackpotValueInternal(id);
  }

  private resetJackpotValueInternal(id: number): void {
    const newJackpotValues = this.getResponseInitialJackpotValues();

    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    const jackpotAnimNodes = this._container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [id]));
    for (let num = 0; num < jackpotAnimNodes.length; num++) {
      if (
        jackpotAnimNodes[num] &&
        jackpotAnimNodes[num].stateMachine &&
        (!this._currentNodeJackpotValues.has(id) ||
          !this._currentNodeJackpotValues.get(id)!.has(num) ||
          this._currentNodeJackpotValues.get(id)!.get(num) !=
            parseFloat(newJackpotValues[id].toString()))
      ) {
        this._jackPotSpinActionProviders[id][num].setDrawActive(false);
        jackpotAnimNodes[num].stateMachine!.switchToState('default');
        this._jackPotSpinActionProviders[id][num].setDrawActive(true);
        this._jackPotSpinActionProviders[id][num].drawNumbers(newJackpotValues[id], true);
        if (newJackpotValues && newJackpotValues.length > id) {
          if (!this._currentNodeJackpotValues.has(id))
            this._currentNodeJackpotValues.set(id, new Map<number, number>());
          this._currentNodeJackpotValues
            .get(id)!
            .set(num, parseFloat(newJackpotValues[id].toString()));
          (
            this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
          ).jackPotValues[id] = (
            this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
          ).jackPotInitialValues[id];
        }
      } else {
        this.setJackpotValue(id, parseFloat(newJackpotValues[id].toString()));
      }
    }
  }

  public ResetJackpotValueWithMultiplier(id: number, mult: number): void {
    const newJackpotValues = this.getResponseInitialJackpotValues();
    for (let i = 0; i < newJackpotValues.length; i++) {
      newJackpotValues[i] *= mult;
    }

    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    const jackpotAnimNodes = this._container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [id]));
    for (let num = 0; num < jackpotAnimNodes.length; num++) {
      if (
        jackpotAnimNodes[num] &&
        jackpotAnimNodes[num].stateMachine &&
        (!this._currentNodeJackpotValues.has(id) ||
          !this._currentNodeJackpotValues.get(id)!.has(num) ||
          this._currentNodeJackpotValues.get(id)!.get(num) != newJackpotValues[id])
      ) {
        this._jackPotSpinActionProviders[id][num].setDrawActive(false);
        jackpotAnimNodes[num].stateMachine!.switchToState('default');
        this._jackPotSpinActionProviders[id][num].setDrawActive(true);
        this._jackPotSpinActionProviders[id][num].drawNumbers(newJackpotValues[id], true);
        if (newJackpotValues && newJackpotValues.length > id) {
          if (!this._currentNodeJackpotValues.has(id))
            this._currentNodeJackpotValues.set(id, new Map<number, number>());
          this._currentNodeJackpotValues.get(id)!.set(num, newJackpotValues[id]);
          (
            this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
          ).jackPotValues[id] = (
            this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
          ).jackPotInitialValues[id];
        }
      } else {
        this.setJackpotValue(id, newJackpotValues[id]);
      }
    }
  }

  private updateJackpotValuesZeroDurationInternal(): void {
    const newJackpotValues = this.getResponseJackpotValues();

    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    for (let i = 0; i < newJackpotValues.length; i++) {
      const jackpotAnimNode = this._container
        .forceResolve<ResourcesComponent>(T_ResourcesComponent)
        .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [i]));
      for (let numb = 0; numb < jackpotAnimNode.length; numb++) {
        if (
          jackpotAnimNode[numb] &&
          jackpotAnimNode[numb].stateMachine &&
          this._currentNodeJackpotValues.get(i)!.get(numb) !=
            parseFloat(newJackpotValues[i].toString())
        ) {
          this._jackPotSpinActionProviders[i][numb].setDrawActive(false);
          jackpotAnimNode[numb].stateMachine!.switchToState('default');
          this._jackPotSpinActionProviders[i][numb].setDrawActive(true);
          this._jackPotSpinActionProviders[i][numb].drawNumbers(newJackpotValues[i], true);
          if (newJackpotValues && newJackpotValues.length > i) {
            if (!this._currentNodeJackpotValues.has(i)) {
              this._currentNodeJackpotValues.set(i, new Map<number, number>());
            }
            this._currentNodeJackpotValues
              .get(i)!
              .set(numb, parseFloat(newJackpotValues[i].toString()));
          }
        } else {
          this.setJackpotValue(i, parseFloat(newJackpotValues[i].toString()));
        }
      }
    }
  }

  public setJackpotValueWithMult(jackpotIndex: number, jackpotValue: number): void {
    if (!this._container.forceResolve<ResourcesComponent>(T_ResourcesComponent).root) {
      return;
    }
    const jackpotAnimNodes = this._container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.findAllById(StringUtils.format(this._jackpotAnimSceneObjectIdFormat, [jackpotIndex]));
    for (let num = 0; num < jackpotAnimNodes.length; num++) {
      if (
        jackpotAnimNodes[num] &&
        jackpotAnimNodes[num].stateMachine &&
        (!this._currentNodeJackpotValues.has(jackpotIndex) ||
          !this._currentNodeJackpotValues.get(jackpotIndex)!.has(num) ||
          this._currentNodeJackpotValues.get(jackpotIndex)!.get(num) != jackpotValue)
      ) {
        this._jackPotSpinActionProviders[jackpotIndex][num].setDrawActive(false);
        jackpotAnimNodes[num].stateMachine!.switchToState('default');
        this._jackPotSpinActionProviders[jackpotIndex][num].setDrawActive(true);
        this._jackPotSpinActionProviders[jackpotIndex][num].drawNumbers(jackpotValue, true);
        if (!this._currentNodeJackpotValues.has(jackpotIndex)) {
          this._currentNodeJackpotValues.set(jackpotIndex, new Map<number, number>());
        }
        this._currentNodeJackpotValues
          .get(jackpotIndex)!
          .set(num, parseFloat(jackpotValue.toString()));
        (
          this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
        ).jackPotValues[jackpotIndex] = (
          this._gameStateMachine.curResponse.additionalData as InternalJackpotsSpecGroup
        ).jackPotInitialValues[jackpotIndex];
      } else {
        super.setJackpotValue(jackpotIndex, jackpotValue);
      }
    }
  }
}
