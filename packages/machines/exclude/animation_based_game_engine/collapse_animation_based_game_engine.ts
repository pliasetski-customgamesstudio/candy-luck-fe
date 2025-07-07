import {
  AnimationBasedGameEngine,
  Container,
  EntitiesEngine,
  EventDispatcher,
  IntervalAction,
  SceneObject,
  SequenceAction,
} from 'machines';
import { StringUtils } from 'shared';
import { ICollapseAnimationGameEngineParams } from 'machines/src/reels_engine_library';

class CollapseAnimationBasedGameEngine extends AnimationBasedGameEngine {
  private _collapseHideAnimDuration: number;
  private _collapseShowAnimDuration: number;

  private collapseSymbolPositionCache: Map<number, number> = new Map<number, number>();

  private collapsePlaceholder: SceneObject;
  private isCollapseFinished: boolean;

  private iconsHideFinished: EventDispatcher = new EventDispatcher();

  private get _collapseEngineParams(): ICollapseAnimationGameEngineParams {
    return this.engineParams as ICollapseAnimationGameEngineParams;
  }

  private get collapseHideAnimName(): string {
    return this._collapseEngineParams.collapseHideAnimName;
  }

  private get collapseShowAnimName(): string {
    return this._collapseEngineParams.collapseShowAnimName;
  }

  private get hideIconsAnimationAction(): IntervalAction {
    return new SequenceAction([
      new FunctionAction(() => this.startHideIconsAnimation()),
      new EmptyAction().withDuration(this._collapseHideAnimDuration),
      new FunctionAction(() => this.endHideIconsAnimation()),
      new FunctionAction(() => (this.isCollapseFinished = true)),
    ]);
  }

  private get showIconsAnimationAction(): IntervalAction {
    return new SequenceAction([
      new FunctionAction(() => (this.isCollapseFinished = false)),
      new FunctionAction(() => this.startShowIconsAnimation()),
      new EmptyAction().withDuration(this._collapseShowAnimDuration),
      new FunctionAction(() => this.endShowIconsAnimation()),
    ]);
  }

  constructor(
    container: Container,
    entityEngine: EntitiesEngine,
    engineParams: ICollapseAnimationGameEngineParams
  ) {
    super(container, entityEngine, engineParams);
    this.collapsePlaceholder = this.root.findById(
      this._collapseEngineParams.collapsePlaceholderNodeId
    );

    if (this.collapsePlaceholder) {
      this._collapseHideAnimDuration =
        (
          this.collapsePlaceholder.stateMachine.findById(this.collapseHideAnimName)
            .enterAction as IntervalAction
        ).duration + gameConfig.afterOutgoingAnimationDelay;
      this._collapseShowAnimDuration =
        (
          this.collapsePlaceholder.stateMachine.findById(this.collapseShowAnimName)
            .enterAction as IntervalAction
        ).duration + gameConfig.afterStopAnimationdelay;

      this.collapsePlaceholder.stateMachine
        .findById(this.collapseHideAnimName)
        .entered.listen((e) => this.iconsHideFinished.dispatchEvent());
    }
  }

  private startHideIconsAnimation(): void {
    this.collapsePlaceholder.stateMachine.switchToState(this.collapseHideAnimName);
  }

  private endHideIconsAnimation(): void {
    this.collapsePlaceholder.stateMachine.findById(this.collapseHideAnimName).enterAction.end();
  }

  private startShowIconsAnimation(): void {
    this.collapsePlaceholder.stateMachine.switchToState(this.collapseShowAnimName);
  }

  private endShowIconsAnimation(): void {
    this.collapsePlaceholder.stateMachine.findById(this.collapseShowAnimName).enterAction.end();
  }

  public showCollapseIcons(): void {
    this.collapsePlaceholder.stateMachine.switchToState('default');
  }

  public setCollapseItemIcon(position: number, symbolId: number): void {
    this.collapseSymbolPositionCache.set(position, symbolId);
    const container = this.collapsePlaceholder.findById(
      StringUtils.format(iconContainerIdFormat, [position.toString()])
    );
    const icons = iconResourceProvider.getIconNodes(
      StringUtils.format(iconIdFormat, [symbolId.toString()])
    );

    if (icons) {
      for (const icon of icons) {
        if (container && icon) {
          const placeholder = container.findById(iconPlaceholderId);
          if (placeholder && iconPlaceholderId && iconPlaceholderId.isNotEmpty) {
            placeholder.addChild(icon);
            container.z = icon.z;
          } else if (!iconPlaceholderId || iconPlaceholderId.isEmpty) {
            container.addChild(icon);
            container.z = icon.z;
          } else {
            icon.active = false;
          }
        }
      }
    }
  }

  public getCollapseIconByPosition(position: number): SceneObject {
    if (this.collapseSymbolPositionCache.has(position)) {
      const symbolId = this.collapseSymbolPositionCache.get(position);
      const container = this.collapsePlaceholder.findById(
        StringUtils.format(iconContainerIdFormat, [position.toString()])
      );

      return container.findById(StringUtils.format(iconIdFormat, [symbolId.toString()]));
    }

    return null;
  }

  public reset(): void {
    this.clearCollapseIcons();
    this.collapsePlaceholder.stateMachine.switchToState('empty');
  }

  private clearCollapseIcons(): void {
    for (let position = 0; position < gameConfig.iconsCount; position++) {
      this.removeCollapseItemIcon(position);
    }
  }

  private removeCollapseItemIcon(position: number): void {
    const container = this.collapsePlaceholder.findById(
      StringUtils.format(iconContainerIdFormat, [position.toString()])
    );

    if (container) {
      const placeholder = container.findById(iconPlaceholderId);
      if (placeholder && iconPlaceholderId && iconPlaceholderId.isNotEmpty) {
        placeholder.removeAllChilds();
      } else if (!iconPlaceholderId || iconPlaceholderId.isEmpty) {
        container.removeAllChilds();
      }
    }
  }
}
