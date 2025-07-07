import { SceneCommon, ISpinResponse, NumberFormatter } from '@cgs/common';
import {
  Container,
  SceneObject,
  ActionActivator,
  IntervalAction,
  TextSceneObject,
  Vector2,
  InterpolateCopyAction,
  lerp,
  EmptyAction,
  lerpi,
  SequenceAction,
  ParallelAction,
  FunctionAction,
} from '@cgs/syd';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { T_IGameStateMachineProvider } from '../../type_definitions';

export class JackPotSpinActionProvider {
  private _jackpotDigitalCount: number;
  private _sceneCommon: SceneCommon;
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _container: Container;
  private _scene: SceneObject;
  private _jackPotNode: SceneObject;
  private _numbers: SceneObject[];
  private _newNumbers: SceneObject[];
  private _actionActivatorsOnPosition: ActionActivator[];
  private _showActivator: ActionActivator;
  private _hideActivator: ActionActivator;
  private _actionList: IntervalAction[][];
  private _currentNum: number[];
  private _nextNum: number[];
  private _num: number;
  private _prevNumber: number;
  private _isStopped: boolean;
  private _useMaxSpeed: boolean;
  private _numberScenes: SceneObject[];
  private _punctuationScenes: SceneObject[];
  private _letterScenes: SceneObject[];
  private _isNeedCentering: boolean;
  private _isNeedPadRight: boolean;
  private _isStatic: boolean;
  private _startValue: number;
  private _endValue: number;
  private _duration: number;

  constructor(
    container: Container,
    jackPotNode: SceneObject,
    sceneCommon: SceneCommon,
    jackpotDigitalCount: number,
    isNeedCentering: boolean,
    isNeedPadRight: boolean,
    holder: string = ''
  ) {
    this._container = container;
    this._sceneCommon = sceneCommon;
    this._jackpotDigitalCount = jackpotDigitalCount;
    this._isNeedCentering = isNeedCentering;
    this._isNeedPadRight = isNeedPadRight;

    this._scene = this._sceneCommon.sceneFactory.build('slot/holder')!;
    this._jackPotNode = jackPotNode;
    this._scene.initialize();

    this._gameStateMachine = this._container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;

    this._actionList = [];
    this._actionActivatorsOnPosition = [];
    this._currentNum = [];
    this._nextNum = [];

    this._isStopped = false;

    this._numberScenes = [];
    this._punctuationScenes = [];
    this._letterScenes = [];
    for (let i = 0; i < 30; i++) {
      const number = this._sceneCommon.sceneFactory.build('slot/number' + holder)!;
      this._numberScenes.push(number);
    }
    for (let i = 0; i < 2; i++) {
      const letter = this._sceneCommon.sceneFactory.build('slot/letter' + holder)!;
      this._letterScenes.push(letter);
    }
    for (let i = 0; i < this._jackpotDigitalCount * 2; i++) {
      const punctuation = this._sceneCommon.sceneFactory.build('slot/punctuation' + holder)!;
      this._punctuationScenes.push(punctuation);
    }
  }

  public getDigitsCount(): number {
    return this._jackpotDigitalCount;
  }

  public setStatic(isStatic: boolean): void {
    this._isStatic = isStatic;
  }

  public getScene(): SceneObject {
    return this._scene;
  }

  public initializeStartingJackpot(startValue: number): void {
    this._numbers = [];
    this._num = startValue;

    const preText = NumberFormatter.formatMoneyShort(startValue, 7);
    let finalText = preText.replaceAll('.0', '');
    finalText = finalText.replaceAll('.00', '');
    finalText = finalText.replaceAll('.000', '');

    let startValueToChar = finalText;
    if (!this._isStatic) {
      startValueToChar = NumberFormatter.formatMoneyShort(startValue, 7);
    }
    let position = 0.0;

    for (let i = 0; i < startValueToChar.length; i++) {
      let number: SceneObject;
      if (
        startValueToChar[i].toString().includes(',') ||
        startValueToChar[i].toString().includes('.')
      ) {
        number = this._punctuationScenes.find(() => true)!;
        this._punctuationScenes.splice(this._punctuationScenes.indexOf(number), 1);
      } else if (
        startValueToChar[i].toString().includes('1') ||
        startValueToChar[i].toString().includes('2') ||
        startValueToChar[i].toString().includes('3') ||
        startValueToChar[i].toString().includes('3') ||
        startValueToChar[i].toString().includes('4') ||
        startValueToChar[i].toString().includes('5') ||
        startValueToChar[i].toString().includes('6') ||
        startValueToChar[i].toString().includes('7') ||
        startValueToChar[i].toString().includes('8') ||
        startValueToChar[i].toString().includes('9') ||
        startValueToChar[i].toString().includes('0') ||
        startValueToChar[i].toString().includes('$')
      ) {
        number = this._numberScenes.find(() => true)!;
        this._numberScenes.splice(this._numberScenes.indexOf(number), 1);
      } else {
        number = this._letterScenes.find(() => true)!;
        this._letterScenes.splice(this._letterScenes.indexOf(number), 1);
      }

      const actionActivator = new ActionActivator(this._jackPotNode);
      const actionList: IntervalAction[] = [];
      (number.findById('Num_1') as TextSceneObject).text = startValueToChar[i].toString();
      number.position = new Vector2(position, 0.0);

      position += number.bounds.width;

      this._currentNum.push(1);
      this._nextNum.push(2);

      const hideActionActivator = new ActionActivator(this._jackPotNode);

      this._actionActivatorsOnPosition.push(actionActivator);
      this._numbers.push(number);
      this._actionList.push(actionList);

      this._scene.findById('NumberHolder')!.addChild(number);
      number.initialize();
    }
    if (this._isNeedCentering) {
      const offset = (this._scene.findById('NumberHolder')!.bounds.width - position) / 2;
      for (let i = 0; i < this._numbers.length; i++) {
        this._numbers[i].position = this._numbers[i].position.add(new Vector2(offset, 0.0));
      }
    }

    if (this._isNeedPadRight) {
      const offset = this._scene.findById('NumberHolder')!.bounds.width - position;
      for (let i = 0; i < this._numbers.length; i++) {
        this._numbers[i].position = this._numbers[i].position.add(new Vector2(offset, 0.0));
      }
    }
  }

  public updateJackpot(startValue: number, endValue: number): IntervalAction {
    this._startValue = startValue;
    this._endValue = endValue;
    for (let i = 0; i < this._actionActivatorsOnPosition.length; i++) {
      this._actionActivatorsOnPosition[i].action?.end();
    }
    const delta = this.setTime(startValue, endValue);

    if (Math.round(delta) * 300 > 300000) {
      this._duration = 300000;
    } else {
      this._duration = Math.round(delta) * 300;
    }
    this._useMaxSpeed = false;
    if (this._duration !== 300000) {
      this._useMaxSpeed = true;
    }
    if (startValue !== endValue) {
      const action = new InterpolateCopyAction<number>()
        .withInterpolateFunction(lerp)
        .withDuration(this._duration / 1000)
        .withValues(startValue, endValue);

      action.valueChange.listen((value: number) => {
        this.drawNumbers(Math.round(value));
      });

      return action;
    } else {
      return new EmptyAction();
    }
  }

  public getSpeed(digit: number, isChangeBet: boolean): number {
    if (this._useMaxSpeed) {
      return 300;
    }
    if (isChangeBet) {
      return 100;
    }
    if (this._endValue - this._startValue !== 0) {
      const minSpeed = 100;
      const maxSpeed = 300;
      const deltaTime = this._duration / (this._endValue - this._startValue);
      const truedigit = this._numbers.length - 1 - digit;
      let speed = Math.round(Math.pow(10, truedigit) * deltaTime);
      if (speed < minSpeed) {
        speed = minSpeed + 10 * truedigit;
      }
      speed = Math.min(maxSpeed, speed);
      return speed;
    }
    return 0;
  }

  public updatePosition(
    number: TextSceneObject,
    start: number,
    end: number,
    speed: number
  ): IntervalAction {
    const action = new InterpolateCopyAction<number>()
      .withInterpolateFunction(lerpi)
      .withDuration(speed / 1000)
      .withValues(start, end);

    action.valueChange.listen((value: number) => {
      this.setPosition(value, number);
    });
    return action;
  }

  public setPosition(position: number, node: TextSceneObject): void {
    node.position = new Vector2(node.position.x, position);
  }

  public getTopHolderPosition(node: SceneObject): Vector2 {
    return node.findById('TopHolder')!.position;
  }

  public getBottomHolderPosition(node: SceneObject): Vector2 {
    return node.findById('BottomHolder')!.position;
  }

  public getCenterHolderPosition(node: SceneObject): Vector2 {
    return node.findById('CenterHolder')!.position;
  }

  public hideAllNumbers(isChangeBet: boolean): void {
    for (const action of this._actionActivatorsOnPosition) {
      if (action.action) {
        action.action.end();
      }
    }
    if (isChangeBet) {
      if (
        this._hideActivator &&
        this._hideActivator.action &&
        !this._showActivator.action!.isDone
      ) {
        this._hideActivator.end();
        this._hideActivator.action = null;
        this.reset();
      }
    } else {
      if (this._hideActivator && this._hideActivator.action && !this._hideActivator.action.isDone) {
        this._hideActivator.end();
        this._hideActivator.action = null;
        this.reset();
      }
    }

    let hideAction: IntervalAction = new EmptyAction();
    for (let i = 0; i < this._numbers.length; i++) {
      const numberCount = i;
      const currNum = this._currentNum[i];
      const nextNum = this._nextNum[i];
      const hidePosition = new SequenceAction([
        this.updatePosition(
          this._numbers[numberCount].findById('Num_' + currNum.toString()) as TextSceneObject,
          Math.round(this.getCenterHolderPosition(this._numbers[numberCount]).y) - 1,
          Math.round(this.getTopHolderPosition(this._numbers[numberCount]).y),
          100
        ),
      ]);
      if (
        this._actionActivatorsOnPosition[i].action &&
        !this._actionActivatorsOnPosition[i].action!.isDone
      ) {
        this._actionActivatorsOnPosition[i].end();
      }
      hideAction = new ParallelAction([hideAction ?? new EmptyAction(), hidePosition]);
      this._actionList[i].length = 0;
    }
    hideAction.done.listen(() => {
      this._hideActivator.end();
    });
    this._hideActivator = new ActionActivator(this._jackPotNode);
    this._hideActivator.action = hideAction;
    this._hideActivator.start();
  }

  public setSceneDefault(scene: SceneObject): void {
    scene.findById('Num_1')!.position = new Vector2(
      scene.findById('Num_1')!.position.x,
      this.getCenterHolderPosition(scene).y
    );
    scene.findById('Num_2')!.position = new Vector2(
      scene.findById('Num_2')!.position.x,
      this.getBottomHolderPosition(scene).y
    );
    (scene.findById('Num_1') as TextSceneObject).text = '';
    (scene.findById('Num_2') as TextSceneObject).text = '';
  }

  public showNewNumbers(value: number, isChangeBet: boolean): void {
    if (isChangeBet) {
      if (this._showActivator && this._showActivator.action && !this._showActivator.action.isDone) {
        this._showActivator.end();
        this._showActivator.action = null;
      }
    } else {
      if (this._showActivator && this._showActivator.action && !this._showActivator.action.isDone) {
        this._showActivator.end();
        this._showActivator.action = null;
        this.reset();
      }
    }

    this._newNumbers = [];
    this._currentNum = [];
    this._nextNum = [];

    let input = NumberFormatter.formatMoneyShort(value, 7);

    if (!this._isStatic) {
      input = NumberFormatter.formatMoneyShort(value, 7);
    }

    let position = 0.0;
    let showAction: IntervalAction = new EmptyAction();
    for (let i = 0; i < input.length; i++) {
      const numberCount = i;

      this._currentNum.push(1);
      this._nextNum.push(2);
      const nextNum = this._nextNum[numberCount];
      const currNum = this._currentNum[numberCount];
      let number: SceneObject;
      if (input[i].toString().includes(',') || input[i].toString().includes('.')) {
        number = this._punctuationScenes.find(() => true)!;
        this.setSceneDefault(number);
        this._punctuationScenes.splice(this._punctuationScenes.indexOf(number), 1);
      } else if (
        input[i].toString().includes('1') ||
        input[i].toString().includes('2') ||
        input[i].toString().includes('3') ||
        input[i].toString().includes('3') ||
        input[i].toString().includes('4') ||
        input[i].toString().includes('5') ||
        input[i].toString().includes('6') ||
        input[i].toString().includes('7') ||
        input[i].toString().includes('8') ||
        input[i].toString().includes('9') ||
        input[i].toString().includes('0') ||
        input[i].toString().includes('$')
      ) {
        number = this._numberScenes.find(() => true)!;
        this.setSceneDefault(number);
        this._numberScenes.splice(this._numberScenes.indexOf(number), 1);
      } else {
        number = this._letterScenes.find(() => true)!;
        this.setSceneDefault(number);
        this._letterScenes.splice(this._letterScenes.indexOf(number), 1);
      }

      if (!number.isInitialized) {
        number.initialize();
      }
      number.visible = true;

      number.position = new Vector2(position, 0.0);
      position += number.bounds.width;

      (number.findById('Num_' + currNum.toString()) as TextSceneObject).text = '';
      this._newNumbers.push(number);

      this._scene.findById('NumberHolder')!.addChild(number);

      const actionOnPosition = new SequenceAction([
        new FunctionAction(() => {
          (number.findById('Num_' + nextNum.toString()) as TextSceneObject).text =
            input[numberCount].toString();
        }),
        new ParallelAction([
          this.updatePosition(
            number.findById('Num_' + currNum.toString()) as TextSceneObject,
            Math.round(this.getCenterHolderPosition(number).y) - 1,
            Math.round(this.getTopHolderPosition(number).y),
            100
          ),
          this.updatePosition(
            number.findById('Num_' + nextNum.toString()) as TextSceneObject,
            Math.round(this.getBottomHolderPosition(number).y),
            Math.round(this.getCenterHolderPosition(number).y),
            100
          ),
        ]),
        new FunctionAction(() => {
          number.findById('Num_' + currNum.toString())!.position = new Vector2(
            number.findById('Num_' + currNum.toString())!.position.x,
            this.getBottomHolderPosition(number).y
          );
        }),
      ]);

      showAction = new ParallelAction([showAction ?? new EmptyAction(), actionOnPosition]);

      const q = this._currentNum[i];
      this._currentNum[numberCount] = this._nextNum[numberCount];
      this._nextNum[numberCount] = q;

      this._num = value;
      this._prevNumber = value;
    }
    if (this._isNeedCentering) {
      const offset = (this._scene.findById('NumberHolder')!.bounds.width - position) / 2;
      for (let i = 0; i < this._newNumbers.length; i++) {
        this._newNumbers[i].position = this._newNumbers[i].position.add(new Vector2(offset, 0.0));
      }
    }
    if (this._isNeedPadRight) {
      const offset = this._scene.findById('NumberHolder')!.bounds.width - position;
      for (let i = 0; i < this._newNumbers.length; i++) {
        this._newNumbers[i].position = this._newNumbers[i].position.add(new Vector2(offset, 0.0));
      }
    }
    showAction.done.listen(() => {
      this.reset();
      this._showActivator.end();
    });
    this._showActivator = new ActionActivator(this._jackPotNode);
    this._showActivator.action = showAction;
    this._showActivator.start();
  }

  public reset(): void {
    for (const number of this._numbers) {
      this._scene.findById('NumberHolder')!.removeChild(number);
    }
    while (this._numbers.length !== 0) {
      if (
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '.' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === ',' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '.' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === ','
      ) {
        const number = this._numbers.find(() => true)!;
        number.visible = false;
        this._numbers.splice(this._numbers.indexOf(number), 1);
        this._punctuationScenes.push(number);
      } else if (
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '1' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '1' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '2' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '2' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '3' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '3' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '4' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '4' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '5' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '5' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '6' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '6' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '7' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '7' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '8' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '8' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '9' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '9' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '0' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '0' ||
        (this._numbers[0].findById('Num_1') as TextSceneObject).text === '$' ||
        (this._numbers[0].findById('Num_2') as TextSceneObject).text === '$'
      ) {
        const number = this._numbers.find(() => true)!;
        number.visible = false;
        this._numbers.splice(this._numbers.indexOf(number), 1);
        this._numberScenes.push(number);
      } else {
        const number = this._numbers.find(() => true)!;
        number.visible = false;
        this._numbers.splice(this._numbers.indexOf(number), 1);
        this._letterScenes.push(number);
      }
    }
    this._numbers = [];
    this._actionList = [];
    this._actionActivatorsOnPosition = [];
    for (const number of this._newNumbers) {
      this._numbers.push(number);
      const actionList: IntervalAction[] = [];
      this._actionList.push(actionList);
      const actionActivator = new ActionActivator(this._jackPotNode);
      this._actionActivatorsOnPosition.push(actionActivator);
    }
    this._newNumbers = [];
    this._isStopped = false;
  }

  private _isDrawActive = true;
  public setDrawActive(active: boolean): void {
    this._isDrawActive = active;
  }

  public drawNumbers(value1: number, isChangeBet: boolean = false): void {
    if (!this._isDrawActive) {
      return;
    }

    const value = Math.round(value1);
    if (this._isStopped && !isChangeBet) {
      if (this._showActivator && this._showActivator.action && this._showActivator.action.isDone) {
        this.reset();
      }
    } else {
      let input = NumberFormatter.formatMoneyShort(value, 7);

      if (!this._isStatic) {
        input = NumberFormatter.formatMoneyShort(value, 7);
      }

      if (
        isChangeBet ||
        input.length !== this._numbers.length ||
        Math.round(value1).toString().length !== Math.round(this._prevNumber).toString().length
      ) {
        this._isStopped = true;
        this.hideAllNumbers(isChangeBet);
        this._currentNum = [];
        this._nextNum = [];
        this.showNewNumbers(value, isChangeBet);
      } else {
        for (let i = 0; i < input.length; i++) {
          let finalTextFormatted = NumberFormatter.formatMoneyShort(this._num, 7);

          if (!this._isStatic) {
            finalTextFormatted = NumberFormatter.formatMoneyShort(this._num, 7);
          }
          if (input[i] !== finalTextFormatted[i]) {
            const numberCount = i;
            const currNum = this._currentNum[i];
            const nextNum = this._nextNum[i];

            const centerHolderPosition = Math.round(
              this.getCenterHolderPosition(this._numbers[numberCount]).y
            );
            const bottomHolderPositionDouble = this.getBottomHolderPosition(
              this._numbers[numberCount]
            ).y;
            const bottomHolderPosition = Math.round(bottomHolderPositionDouble);
            const offsetBottom =
              bottomHolderPosition -
              centerHolderPosition -
              Math.round(this._numbers[numberCount].findById('BottomHolder')!.size.y);
            const speedOffsetForBottomNumber =
              (bottomHolderPositionDouble - offsetBottom) / bottomHolderPositionDouble;

            const actionOnPosition = new SequenceAction([
              new FunctionAction(() => {
                (
                  this._numbers[numberCount].findById(
                    'Num_' + nextNum.toString()
                  ) as TextSceneObject
                ).text = input[numberCount].toString();
              }),
              new ParallelAction([
                this.updatePosition(
                  this._numbers[numberCount].findById(
                    'Num_' + currNum.toString()
                  ) as TextSceneObject,
                  centerHolderPosition - 1,
                  Math.round(this.getTopHolderPosition(this._numbers[numberCount]).y),
                  this.getSpeed(numberCount, isChangeBet)
                ),
                this.updatePosition(
                  this._numbers[numberCount].findById(
                    'Num_' + nextNum.toString()
                  ) as TextSceneObject,
                  bottomHolderPosition - offsetBottom * 2,
                  centerHolderPosition,
                  Math.round(this.getSpeed(numberCount, isChangeBet) * speedOffsetForBottomNumber)
                ),
              ]),
              new FunctionAction(() => {
                this._numbers[numberCount].findById('Num_' + currNum.toString())!.position =
                  new Vector2(
                    this._numbers[numberCount].findById('Num_' + currNum.toString())!.position.x,
                    this.getBottomHolderPosition(this._numbers[numberCount]).y
                  );
              }),
            ]);

            actionOnPosition.done.listen(() => this.actionDone(numberCount));
            this._actionList[i].length = 0;
            this._actionList[i].push(actionOnPosition);

            if (
              !this._actionActivatorsOnPosition[i].action ||
              this._actionActivatorsOnPosition[i].action!.isDone
            ) {
              this._actionList[i].length = 0;
              this._actionActivatorsOnPosition[i].action = actionOnPosition;
              this._actionActivatorsOnPosition[i].start();
              const q = this._currentNum[i];
              this._currentNum[i] = this._nextNum[i];
              this._nextNum[i] = q;
            }
          }
        }
      }

      this._num = value;
      this._prevNumber = value1;
    }
  }

  private actionDone(number: number): void {
    if (this._actionList[number].length !== 0) {
      const q = this._currentNum[number];
      this._currentNum[number] = this._nextNum[number];
      this._nextNum[number] = q;
      this._actionActivatorsOnPosition[number] = new ActionActivator(this._jackPotNode);
      this._actionActivatorsOnPosition[number].action = this._actionList[number][0];
      this._actionActivatorsOnPosition[number].start();
    } else {
      if (this._actionActivatorsOnPosition[number].action) {
        this._actionActivatorsOnPosition[number].end();
      }
    }
    this._actionList[number].length = 0;
  }

  private format(value: number): string {
    let digits = this._jackpotDigitalCount;
    let isNeedDot = true;
    let addLetter = true;
    const startValue = Math.round(value);
    const letters = [
      '0',
      'K',
      'M',
      'B',
      't',
      'q',
      'Q',
      's',
      'S',
      'o',
      'n',
      'd',
      'U',
      'D',
      'T',
      'A',
      'C',
      'E',
      'F',
      'O',
      'N',
      'v',
      'c',
    ];
    let i = 0;
    if (value < Math.pow(10, this._jackpotDigitalCount)) {
      isNeedDot = false;
      addLetter = false;
      digits = Math.round(value).toString().length;
    }
    while (value >= 1000) {
      value /= 1000;
      i++;
    }
    let digitCounter: number;
    let newValue = startValue.toString().substring(0, digits);
    const valueInt = Math.floor(value);
    const valueSize = valueInt.toString().length;
    if ((digits - valueSize) % 3 !== 0) {
      digitCounter = Math.floor((digits - valueSize) / 3) + 1;
      i = i - digitCounter + 1;
    } else {
      isNeedDot = false;
      digitCounter = Math.floor((digits - valueSize) / 3);
      i -= digitCounter;
    }

    for (let j = 0; j < digitCounter; j++) {
      const c = 4 * j + valueSize;
      if (j === digitCounter - 1 && isNeedDot) {
        newValue = newValue.slice(0, c) + '.' + newValue.slice(c);
      } else {
        newValue = newValue.slice(0, c) + ',' + newValue.slice(c);
      }
    }
    if (addLetter) {
      return newValue + letters[i];
    } else {
      return newValue;
    }
  }

  private setTime(startValue: number, endValue: number): number {
    let delta = 0.0;
    let endRemainder = 0.0;
    while (Math.round(startValue).toString().length > this._jackpotDigitalCount) {
      startValue /= 10;
      startValue = Math.round(startValue);
    }
    while (Math.round(endValue).toString().length > this._jackpotDigitalCount) {
      endValue /= 10;
      endValue = Math.round(endValue);
      endRemainder = endValue % 10;
    }
    if (endValue < startValue) {
      delta = endValue * 10 + endRemainder - startValue;
    } else {
      delta = endValue - startValue;
    }
    return delta;
  }
}
