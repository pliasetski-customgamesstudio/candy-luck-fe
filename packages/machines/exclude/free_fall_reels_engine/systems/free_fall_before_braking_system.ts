import { Vector2 } from 'some-library';
import {
  BaseSystem,
  EntitiesEngine,
  Entity,
  EntityCacheHolder,
  ComponentIndex,
} from 'some-library';
import {
  InternalReelsConfig,
  IconEnumerator,
  IntegrationHelper,
  SpeedInterpolation,
} from 'some-library';

class FreeFallBeforeBrakingSystem extends BaseSystem {
  private _indexesForFilter: ComponentIndex[];
  private _brakingInfoIndex: ComponentIndex;
  private _reelIndex: ComponentIndex;
  private _enumerationIndex: ComponentIndex;
  private _lineIndex: ComponentIndex;
  private _reelsConfig: InternalReelsConfig;
  private _iconEnumerator: IconEnumerator;
  private _integrationHelper: IntegrationHelper;
  private _integratedDest: number[];
  private _integratedTime: number[];
  private IntegrationPrecision: number = 0.0001;

  constructor(
    engine: EntitiesEngine,
    entityCacheHolder: EntityCacheHolder,
    reelsConfig: InternalReelsConfig,
    iconEnumerator: IconEnumerator,
    indexesForFilter: ComponentIndex[]
  ) {
    super(engine, entityCacheHolder);
    this._indexesForFilter = indexesForFilter;
    this._reelsConfig = reelsConfig;
    this._iconEnumerator = iconEnumerator;
    this._integrationHelper = new IntegrationHelper();
    this._integratedTime = new Array<number>(this._reelsConfig.reelCount);
    this._integratedDest = new Array<number>(this._reelsConfig.reelCount);

    for (let reel = 0; reel < reelsConfig.reelCount; ++reel) {
      const interpolator = new SpeedInterpolation()
        .withParameters(1.0, Vector2.One, Vector2.Zero, Vector2.Lerp)
        .withTimeFunction(reelsConfig.getStopEasing(reel));
      this._integratedDest[reel] = this._integrationHelper.integrate(
        interpolator,
        this.IntegrationPrecision
      );
    }

    this._lineIndex = engine.getComponentIndex(ComponentNames.LineIndex);
    this._brakingInfoIndex = engine.getComponentIndex(ComponentNames.BrakingCalculationInfo);
    this._reelIndex = engine.getComponentIndex(ComponentNames.ReelIndex);
    this._enumerationIndex = engine.getComponentIndex(ComponentNames.EnumerationIndex);
  }

  processEntity(entity: Entity): void {
    const reel = entity.get<number>(this._reelIndex);
    const offset = this._reelsConfig.reelsOffset[reel];
    const breakInfo: BrakingCalculationInfo = entity.get(this._brakingInfoIndex);
    breakInfo.position -= offset;
    const Y = breakInfo.position.y;
    const idx = entity.get<number>(this._lineIndex);
    const dst = idx * this._reelsConfig.symbolSize.y - Y;
    const destination = new Vector2(0.0, dst);
    const linearTime = destination.y / Math.abs(breakInfo.speed.y);
    this._integratedTime[reel] = linearTime / this._integratedDest[reel];

    const normalInterpolator = new SpeedInterpolation()
      .withParameters(1.0, Vector2.One, Vector2.Zero, Vector2.Lerp)
      .withTimeFunction(this._reelsConfig.getStopEasing(reel));
    const dest = this._integrationHelper.integrate(
      normalInterpolator,
      1.0 / this._integratedTime[reel]
    );

    this._integratedTime[reel] = linearTime / dest;
    const interpolate = new SpeedInterpolation()
      .withParameters(
        this._integratedTime[reel],
        new Vector2(0.0, breakInfo.speed.y),
        Vector2.Zero.clone(),
        Vector2.Lerp
      )
      .withTimeFunction(this._reelsConfig.getStopEasing(reel));

    const posInReel = entity.get<number>(this._lineIndex);
    const enumerationId = entity.get(this._enumerationIndex);

    if (posInReel >= 0) {
      this._iconEnumerator.setMappedWinIndex(
        reel,
        posInReel,
        enumerationId + this._reelsConfig.lineCount
      );
    }
    entity.addComponent(ComponentNames.PositionInReel, posInReel);
    entity.addComponent(ComponentNames.CalculationReadyFlag, true);
    entity.addComponent(ComponentNames.RelocatedFlag, Math.sign(breakInfo.speed.y));
    entity.addComponent(ComponentNames.BrakingInterpolate, interpolate);
    entity.addComponent(
      ComponentNames.FinalPosition,
      new Vector2(breakInfo.position.x, posInReel * this._reelsConfig.symbolSize.y + offset.y)
    );
    entity.addComponent(
      ComponentNames.FinalEnumerationIndex,
      enumerationId + this._reelsConfig.lineCount
    );
    entity.removeComponent(ComponentNames.BrakingCalculationInfo);
    entity.removeComponent(ComponentNames.FreeFallingIcon);
  }

  getIndexesForFilter(): ComponentIndex[] {
    return this._indexesForFilter;
  }
}
