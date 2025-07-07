import { GameStateMachine } from 'machines';
import { AnimationBasedGameEngine } from 'machines';
import { Container } from 'syd';
import { SceneObject } from 'machines';
import { ResourcesComponent } from 'common';

class AnimationEngineRespinAnticipationProvider {
  private _gameStateMachine: GameStateMachine;
  get gameStateMachine(): GameStateMachine {
    return this._gameStateMachine;
  }
  private _gameEngine: AnimationBasedGameEngine;
  private _anticipationIconAnimName: string;
  private _soundNode: SceneObject;
  private _soundStateName: string;

  private fixedPositions: number[] = [];
  private newFixedPositions: number[] = [];

  constructor(
    container: Container,
    anticipationIconAnimName: string,
    soundNodeName: string,
    soundStateName: string
  ) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    this._gameEngine = container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider)
      .gameEngine as AnimationBasedGameEngine;
    this._soundNode = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .slot.findById(soundNodeName);

    this._gameStateMachine.waitRequest.leaved.listen((e) => this.findRespinPositions());
    this._gameStateMachine.beginRespin.leaved.listen((e) => this.findRespinPositions());
    this._gameStateMachine.stop.entered.listen((e) => this.onStopEntered());
    this._gameStateMachine.beginRespin.entered.listen((e) => this.onBeginRespin());
    this._gameStateMachine.immediatelyStop.entered.listen((e) => this.onImmediatelyStop());

    this._gameEngine.respinIconStopped.listen((position) => this.onRespinIconStopped(position));
  }

  private onBeginRespin(): void {
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;
    if (respinGroup && !respinGroup.respinStarted) {
      for (const position of this.newFixedPositions) {
        const icon = this._gameEngine.getIconByPosition(position);
        icon.stateMachine.switchToState(this._anticipationIconAnimName);
        this._gameEngine.lockIconState(position);
      }
    }
  }

  private onRespinIconStopped(position: number): void {
    if (this.newFixedPositions.includes(position)) {
      let icon = this._gameEngine.getRespinIconByPosition(position);
      if (!icon) {
        icon = this._gameEngine.getIconByPosition(position);
      }

      icon.stateMachine.switchToState(this._anticipationIconAnimName);
      this._gameEngine.lockIconState(position);
      if (this._soundNode && this._soundNode.stateMachine) {
        this._soundNode.stateMachine.switchToState(this._soundStateName);
      }
    }
  }

  private onStopEntered(): void {
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;
    if (
      respinGroup &&
      respinGroup.respinStarted &&
      respinGroup.respinCounter == respinGroup.groups.length - 1
    ) {
      this.fixedPositions = [];
      this._gameEngine.unlockAllIconStates();
    }
  }

  private onImmediatelyStop(): void {
    this.newFixedPositions.forEach((position) => {
      let icon = this._gameEngine.getRespinIconByPosition(position);
      if (!icon) {
        icon = this._gameEngine.getIconByPosition(position);
      }

      icon.stateMachine.switchToState(this._anticipationIconAnimName);
      this._gameEngine.lockIconState(position);
      if (this._soundNode && this._soundNode.stateMachine) {
        this._soundNode.stateMachine.switchToState(this._soundStateName);
      }
    });
  }

  private findRespinPositions(): void {
    this.newFixedPositions = [];
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;
    if (
      respinGroup &&
      (!respinGroup.respinStarted || respinGroup.respinCounter < respinGroup.groups.length - 1)
    ) {
      this.newFixedPositions =
        respinGroup.respinCounter == 0 && !respinGroup.respinStarted
          ? respinGroup.currentRound.fixedPositions.map((p) => p).toList()
          : respinGroup.groups[respinGroup.respinCounter + 1].fixedPositions
              .filter((p) => !respinGroup.currentRound.fixedPositions.includes(p))
              .toList();

      this.fixedPositions.push(...this.newFixedPositions);
    }
  }
}
