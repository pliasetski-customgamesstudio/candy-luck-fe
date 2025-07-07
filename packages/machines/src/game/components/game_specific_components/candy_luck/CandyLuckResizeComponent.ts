import {
  Compatibility,
  Container,
  debounce,
  SceneObject,
  Vector2,
  VerticalAlignment,
} from '@cgs/syd';
import { ResourcesComponent } from '../../resources_component';
import { T_ResourcesComponent } from '../../../../type_definitions';
import { CANDY_LUCK_LANDSCAPE_SCALE_VECTOR } from './CandyLuckConstants';
import { Rectangle, ScaleEntry, ScaleManager, Stretch, T_ScaleManager } from '@cgs/common';

export const T_CandyLuckResizeComponent = Symbol('T_CandyLuckResizeComponent');

const enum Orientation {
  Portrait = 'portrait',
  Landscape = 'landscape',
}

const RESIZE_DELAY = 100;
const BOTTOM_PANEL_ASPECT = 2;
const BOTTOM_PANEL_OFFSET_MAP: Record<Orientation, number> = {
  [Orientation.Landscape]: 20,
  [Orientation.Portrait]: 10,
};

export class CandyLuckResizeComponent {
  private readonly _buttonBarScene: SceneObject | null;
  private readonly _debounceResize: () => void;
  private readonly _resourcesComponent: ResourcesComponent;
  private readonly _scaleManager: ScaleManager;

  private readonly _initialBgScale: Vector2;

  private _prevOrientation: Orientation | null = null;
  private _orientation: Orientation;

  constructor(container: Container) {
    this._resourcesComponent = container.forceResolve<ResourcesComponent>(T_ResourcesComponent);

    this._buttonBarScene = this._resourcesComponent.root.findById('button_bar');
    this._initialBgScale = this._resourcesComponent.bg.scale.clone();

    this._scaleManager = container.forceResolve<ScaleManager>(T_ScaleManager);

    this._debounceResize = debounce(() => this.resize(), RESIZE_DELAY);

    this.addListeners();
    this.resize();
  }

  private addListeners(): void {
    window.addEventListener('resize', this._debounceResize);
    window.addEventListener('orientationchange', this._debounceResize);
    document.addEventListener('fullscreenchange', this._debounceResize);
    document.addEventListener('mozfullscreenchange', this._debounceResize);
    document.addEventListener('msfullscreenchange', this._debounceResize);
    document.addEventListener('webkitfullscreenchange', this._debounceResize);
  }

  private resize(): void {
    this._prevOrientation = this._orientation || null;
    this._orientation = Compatibility.isPortrait ? Orientation.Portrait : Orientation.Landscape;

    this.adjustBottomPanel();
    // this.scaleBackground();
  }

  private adjustBottomPanel(): void {
    if (!this._buttonBarScene) {
      return;
    }

    const aspectRatio = window.innerWidth / window.innerHeight;

    const offset = BOTTOM_PANEL_OFFSET_MAP[this._orientation];

    this._buttonBarScene.position =
      aspectRatio < BOTTOM_PANEL_ASPECT ? new Vector2(0, -offset) : new Vector2(0, 0);
  }

  private async scaleBackground(): Promise<void> {
    if (this._prevOrientation && this._prevOrientation === this._orientation) {
      return;
    }

    this._resourcesComponent.bg.scale =
      this._orientation === Orientation.Portrait
        ? this._initialBgScale
        : this._initialBgScale.multiply(CANDY_LUCK_LANDSCAPE_SCALE_VECTOR);

    const coordinateSystem = this._scaleManager.coordinateSystemProvider.coordinateSystem;

    const scaleMultiply =
      this._orientation === Orientation.Portrait
        ? new Vector2(1, 1)
        : CANDY_LUCK_LANDSCAPE_SCALE_VECTOR;

    const bgMinPos = new Vector2(0.0, 0.0);
    const bgMinSize = coordinateSystem.size.multiply(scaleMultiply);

    const bgMaxPos = new Vector2(0.0, 0.0);
    const bgMaxSize = coordinateSystem.size.multiply(scaleMultiply);

    await this._scaleManager.lobbyScaler.initializeDynamic(
      [
        new ScaleEntry(
          new Rectangle(bgMinPos.x, bgMinPos.y, bgMinSize.x, bgMinSize.y),
          new Rectangle(bgMaxPos.x, bgMaxPos.y, bgMaxSize.x, bgMaxSize.y),
          true,
          true
        ),
      ],

      () => new Rectangle(0.0, 0.0, coordinateSystem.width, coordinateSystem.height),
      Stretch.Uniform,
      VerticalAlignment.Top
    );

    await this._scaleManager.lobbyScaler.invalidate();
  }
}
