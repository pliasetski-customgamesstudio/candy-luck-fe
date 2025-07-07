import { ISpinResponse, InternalRespinSpecGroup } from '@cgs/common';
import {
  SceneObject,
  Container,
  Action,
  SequenceSimpleAction,
  FunctionAction,
  ParallelSimpleAction,
} from '@cgs/syd';
import { ComponentNames } from '../../reels_engine/entity_components/component_names';
import { IGameStateMachineProvider } from '../../reels_engine/game_components_providers/i_game_state_machine_provider';
import { IRespinFeatureProvider } from '../../reels_engine/game_components_providers/i_respin_feature_provider';
import { ISlotGameEngineProvider } from '../../reels_engine/game_components_providers/i_slot_game_engine_provider';
import { ReelsEngine } from '../../reels_engine/reels_engine';
import { GameStateMachine } from '../../reels_engine/state_machine/game_state_machine';
import { RemoveComponentsSystem } from '../../reels_engine/systems/remove_components_system';
import {
  T_IGameStateMachineProvider,
  T_ISlotGameEngineProvider,
  T_ResourcesComponent,
} from '../../type_definitions';
import { ResourcesComponent } from './resources_component';

export class RespinFeatureProvider implements IRespinFeatureProvider {
  private _gameStateMachine: GameStateMachine<ISpinResponse>;
  private _reelsEngine: ReelsEngine | null;
  private FixedIconMarker: string = 'FixedIcon';
  private _respinRoundWinLinesAnimationEnabled: boolean;
  private _respinIndicatorNodes: SceneObject[];
  private _respinIndicatorShowState: string;

  get respinRoundWinLinesAnimationEnabled(): boolean {
    return this._respinRoundWinLinesAnimationEnabled;
  }

  constructor(
    container: Container,
    {
      enableRoundWinLines = true,
      respinIndicatorNodeId = 'respin',
      respinIndicatorShowState = 'show',
    }
  ) {
    this._gameStateMachine = container.forceResolve<IGameStateMachineProvider>(
      T_IGameStateMachineProvider
    ).gameStateMachine;
    const gameEngine =
      container.forceResolve<ISlotGameEngineProvider>(T_ISlotGameEngineProvider).gameEngine;
    this._reelsEngine = gameEngine instanceof ReelsEngine ? gameEngine : null;
    this._respinIndicatorNodes = container
      .forceResolve<ResourcesComponent>(T_ResourcesComponent)
      .root.findAllById(respinIndicatorNodeId);

    this._respinRoundWinLinesAnimationEnabled = enableRoundWinLines;
    this._respinIndicatorShowState = respinIndicatorShowState;

    this._gameStateMachine.beginRespin.appendLazyAnimation(() => this.getBeginRespinEntered());

    this._gameStateMachine.respin.entered.listen(() => this.onRespinEntered());
    this._gameStateMachine.stop.entered.listen(() => this.onStopEntered());
    this._gameStateMachine.regularSpins.leaved.listen(() => this.unloadFeature());
    this._gameStateMachine.freeSpins.leaved.listen(() => this.unloadFeature());
    this._gameStateMachine.autoSpins.leaved.listen(() => this.unloadFeature());
    this._gameStateMachine.respin.leaved.listen(() => this.unlockIcons());
    this.createSystems(this.FixedIconMarker);
  }

  private createSystems(marker: string): void {
    if (this._reelsEngine) {
      const fixedIconSystem = new RemoveComponentsSystem(this._reelsEngine.entityEngine, marker, [
        ComponentNames.AccelerationInterpolate,
        ComponentNames.BrakingCalculationInfo,
      ]);
      fixedIconSystem.updateOrder = 101;
      fixedIconSystem.register();
    }
  }

  private unloadFeature(): void {
    if (this._reelsEngine) {
      this._reelsEngine.RemoveEntitiesByFilter([this.FixedIconMarker]);
    }
  }

  private unlockIcons(): void {
    if (this._reelsEngine) {
      const filter = this._reelsEngine.entityEngine.getFilterByIndex([
        this._reelsEngine.entityEngine.getComponentIndex(this.FixedIconMarker),
      ]);
      const fixedEntities = this._reelsEngine.entityEngine.getEntities(filter).list;

      const respinData = this._gameStateMachine.curResponse
        .additionalData as InternalRespinSpecGroup;
      const fixedPositions = respinData.groups[respinData.respinCounter - 1].fixedPositions;
      for (const entity of fixedEntities) {
        const reel = entity.get(
          this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.ReelIndex)
        ) as number;
        const line = entity.get(
          this._reelsEngine.entityEngine.getComponentIndex(ComponentNames.LineIndex)
        ) as number;
        const position = this._reelsEngine.iconAnimationHelper.getPosition(reel, line);
        if (!fixedPositions.includes(position)) {
          entity.unregister();
        }
      }
    }
  }

  private getBeginRespinEntered(): Action {
    if (
      !(this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup).respinStarted
    ) {
      const actions = this._respinIndicatorNodes
        .filter((node) => !!node.stateMachine?.findById(this._respinIndicatorShowState))
        .map((node) => node.stateMachine!.findById(this._respinIndicatorShowState)!.enterAction);

      return new SequenceSimpleAction([
        new FunctionAction(() => {
          (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
            .respinStartedCounter++;
          (
            this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup
          ).respinStarted = true;
          this._gameStateMachine.curResponse.isRespin = true;

          for (const respinIndicatorNode of this._respinIndicatorNodes) {
            if (respinIndicatorNode.stateMachine) {
              respinIndicatorNode.stateMachine.switchToState('default');
            }
          }
        }),
        new ParallelSimpleAction(actions),
      ]);
    }

    return new FunctionAction(
      () =>
        (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
          .respinStartedCounter++
    );
  }

  private onRespinEntered(): void {
    const respinGroup = this._gameStateMachine.curResponse
      .additionalData as InternalRespinSpecGroup;
    this._gameStateMachine.curResponse.winLines = respinGroup.currentRound.winLines
      ? respinGroup.currentRound.winLines
      : [];
    this._gameStateMachine.curResponse.winPositions = respinGroup.currentRound.winPositions
      ? respinGroup.currentRound.winPositions
      : [];
    respinGroup.respinCounter++;
  }

  private onStopEntered(): void {
    const respinGroup =
      this._gameStateMachine.curResponse.additionalData &&
      this._gameStateMachine.curResponse.additionalData instanceof InternalRespinSpecGroup
        ? (this._gameStateMachine.curResponse.additionalData as InternalRespinSpecGroup)
        : null;
    if (
      respinGroup &&
      respinGroup.respinStarted &&
      respinGroup.respinCounter == respinGroup.groups.length - 1
    ) {
      this._gameStateMachine.curResponse.isRespin = false;
    }
  }
}
