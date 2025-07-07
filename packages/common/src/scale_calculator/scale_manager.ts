import { Platform, Vector2 } from '@cgs/syd';
import { IScaleCalculator } from './i_scale_calculator';
import { ICoordinateSystemInfoProvider } from '../services/coordinate_system_info_provider';
import { ScaleCalculator } from './scale_calculator';
import { ICanvasManager } from '../canvas/i_canvas_manager';

export const T_ScaleManager = Symbol('ScaleManager');
export class ScaleManager {
  popupsOffset: Vector2 = Vector2.Zero;
  private readonly _lobbyScaler: IScaleCalculator;
  private readonly _gamesScaler: IScaleCalculator;
  private readonly _megaWheelScaler: IScaleCalculator;

  get lobbyScaler(): IScaleCalculator {
    return this._lobbyScaler;
  }

  // get gamesScaler(): IScaleCalculator {
  //   return this._gamesScaler;
  // }
  //
  // get megaWheelScaler(): IScaleCalculator {
  //   return this._megaWheelScaler;
  // }

  private readonly _coordinateSystemProvider: ICoordinateSystemInfoProvider;

  constructor(
    coordinateSystemProvider: ICoordinateSystemInfoProvider,
    canvasManager: ICanvasManager,
    platform: Platform
  ) {
    this._coordinateSystemProvider = coordinateSystemProvider;
    this._lobbyScaler = new ScaleCalculator(coordinateSystemProvider, canvasManager, platform.view);
    // this._gamesScaler = new ScaleCalculator(coordinateSystemProvider, canvasManager, platform.view);
    // this._megaWheelScaler = new ScaleCalculator(
    //   coordinateSystemProvider,
    //   canvasManager,
    //   platform.view
    // );
  }

  public get coordinateSystemProvider(): ICoordinateSystemInfoProvider {
    return this._coordinateSystemProvider;
  }
}
