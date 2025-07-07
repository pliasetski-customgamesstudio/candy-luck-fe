import { Container } from 'inversify';
import { EntitiesEngine } from 'machines';
import { IconsSceneObject } from 'syd';
import { IconModel, IconEnumerator } from 'machines/src/reels_engine_library';
import { CollapseReelsEngine } from 'machines';
import { IReelsConfig } from 'machines';
import { GameStateMachine } from 'machines';
import { ReelsSoundModel } from 'machines';

class FreeFallReelsEngine extends CollapseReelsEngine {
  private _acceleratedReels: number[] = [];

  constructor(
    container: Container,
    entityEngine: EntitiesEngine,
    iconRender: IconsSceneObject,
    animIconRender: IconsSceneObject,
    iconModel: IconModel,
    enumerator: IconEnumerator,
    reelConfig: IReelsConfig,
    gameStateMachine: GameStateMachine,
    reelsSoundModel: ReelsSoundModel,
    useSounds: boolean
  ) {
    super(
      container,
      entityEngine,
      iconRender,
      animIconRender,
      iconModel,
      enumerator,
      reelConfig,
      gameStateMachine,
      reelsSoundModel,
      useSounds
    );
  }

  get isSlotAccelerated(): boolean {
    return this._acceleratedReels.length === ReelConfig.reelCount;
  }

  createSystems(): void {
    super.createSystems();
    this.movementSystem.unregister();

    this.movementSystem = new FreeFallMovementSystem(this.entityEngine, this.entityCacheHolder);
    this.movementSystem.updateOrder = 600;
    this.movementSystem.register();

    const freeFallAccelerationSystem = new AfterAccelerationSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig,
      [this.entityEngine.getComponentIndex(ComponentNames.RelocatedFlag)]
    );
    freeFallAccelerationSystem.reelFalled.subscribe(this.onReelFalled);
    freeFallAccelerationSystem.updateOrder = 701;
    freeFallAccelerationSystem.register();

    const indexesForFilter: ComponentIndex[] = [
      this.entityEngine.getComponentIndex(ComponentNames.BrakingCalculationInfo),
      this.entityEngine.getComponentIndex(ComponentNames.ReelIndex),
    ];
    const freeFallBrakingSystem = new FreeFallBeforeBrakingSystem(
      this.entityEngine,
      this.entityCacheHolder,
      this.internalConfig,
      this.iconsEnumerator,
      indexesForFilter
    );
    this.beforeBrakingSystem.unregister();
    freeFallBrakingSystem.updateOrder = 701;
    freeFallBrakingSystem.register();
  }

  private onReelFalled = (reel: number): void => {
    if (!this._acceleratedReels.includes(reel)) {
      this._acceleratedReels.push(reel);
    }

    super.onReelAccelerated(reel);
  };

  onEntityStopped(position: number[]): void {
    this._acceleratedReels = [];
    super.onEntityStopped(position);
  }
}
