import { IRound } from './i_round';
import { Compatibility, EventDispatcher, EventStream, SceneObject, Vector2 } from '@cgs/syd';
import { IResourceManager } from './resources/i_resource_manager';
import { RoundConfiguration } from './configuration/elements/round_configuration';
import { ExecutorsHolder } from './execute/executors_holder';
import { BonusContext } from './messaging/bonus_context';
import { CancellationTokenSource } from '../future/cancellation_token_source';
import { CancellationToken } from '../future/cancellation_token';
import { RoundMessage } from './messaging/round_message';
import { SelectionArgs } from './messaging/selection_args';
import { IRoundComponent } from './components/i_round_component';
import { RoundType } from './enums/round_type';
import { MessageExtension } from './utils/message_extension';
import { ButtonsComponent } from './components/buttons_component';
import { SenderComponent } from './components/sender_component';
import { RoundMessageType } from './enums/round_message_type';
import { ComponentType } from './enums/componet_type';
import { RandomGeneratorComponent } from './components/random_generator_component';
import { HistoryItemsComponent } from './components/history_items_component';
import { CardsGeneratorComponent } from './components/cards_generator_component';
import { CardColorSuitGeneratorComponent } from './components/card_color_suit_generator_component';
import { VariablesComponent } from './components/variables_component';
import { TutorialComponent } from './components/tutorial_component';
import { SceneProviderComponent } from './components/scene_provider_component';
import { ButtonSetConfiguration } from './configuration/elements/button_set_configuration';
import { SenderSetConfiguration } from './configuration/elements/sender_set_configuration';
import { RandomGeneratorConfiguration } from './configuration/elements/random_generator_configuration';
import { HistoryItemsConfiguration } from './configuration/elements/history_items_configuration';
import { TutorialConfiguration } from './configuration/elements/tutorial_configuration';

export class Round implements IRound {
  public roundScene: SceneObject;
  public components: IRoundComponent[];

  private _selectController: EventDispatcher<SelectionArgs> = new EventDispatcher();
  private _parent: SceneObject;
  private _sharedResources: SceneObject[];
  private _resourceManager: IResourceManager;
  private _roundConfiguration: RoundConfiguration;
  private _executeHelper: ExecutorsHolder;
  private _bonusContext: BonusContext;
  private _serverIndex: number;
  private _executeTokenSource: CancellationTokenSource;
  private _loadTokenSource: CancellationTokenSource;
  private _parentToken: CancellationToken;
  private _currentMessage: RoundMessage;

  constructor(
    parent: SceneObject,
    sharedResources: SceneObject[],
    screenConfiguration: RoundConfiguration,
    resourceManager: IResourceManager,
    bonusContext: BonusContext,
    parentToken: CancellationToken
  ) {
    this._parentToken = parentToken;
    this._executeTokenSource = new CancellationTokenSource(parentToken);
    this._loadTokenSource = new CancellationTokenSource(parentToken);
    this._parent = parent;
    this._sharedResources = sharedResources;
    this._roundConfiguration = screenConfiguration;
    this._resourceManager = resourceManager;
    this._bonusContext = bonusContext;

    window.addEventListener('resize', () => this.resizeFunction());
    window.addEventListener('orientationchange', () => this.resizeFunction());
    document.addEventListener('fullscreenchange', () => this.resizeFunction());
    document.addEventListener('mozfullscreenchange', () => this.resizeFunction());
    document.addEventListener('msfullscreenchange', () => this.resizeFunction());
    document.addEventListener('webkitfullscreenchange', () => this.resizeFunction());
  }

  private resizeFunction(): void {
    if (Compatibility.isPortrait) {
      const initialSizeX = 1200;
      const initialPosX = this.roundScene.position.x;
      const initialPosY = this.roundScene.position.y;
      let windowWidth = window.innerWidth;

      const originalRatio = 1657 / 768;
      const windowRatio = window.innerHeight / window.innerWidth;
      if (windowRatio > originalRatio) {
        windowWidth = 768;
        const scale = windowWidth / initialSizeX;
        const offsetX = initialPosX * (1 - scale);
        const offsetY = initialPosY * (1 - scale);
        this.roundScene.position.add(new Vector2(offsetX, offsetY));
        this.roundScene.scale = new Vector2(scale, scale);
      } else {
        const newWindowWidth = windowWidth * (1657 / window.innerHeight);
        const scale = newWindowWidth / initialSizeX;
        const offsetX = initialPosX * (1 - scale);
        const offsetY = initialPosY * (1 - scale);
        this.roundScene.position.add(new Vector2(offsetX, offsetY));
        this.roundScene.scale = new Vector2(scale, scale);
      }
    } else {
      this.roundScene.position = new Vector2(0.0, 0.0);
      this.roundScene.scale = new Vector2(1.0, 1.0);
    }
  }

  get select(): EventStream<SelectionArgs> {
    return this._selectController.eventStream;
  }

  get interactiveRound(): boolean {
    return this._roundConfiguration.type === RoundType.Scene;
  }

  get serverIndexes(): number[] {
    return this._roundConfiguration.serverIndexes;
  }

  get configuration(): RoundConfiguration {
    return this._roundConfiguration;
  }

  processMessage(message: RoundMessage): Promise<void> {
    this._currentMessage = message;
    this._serverIndex = MessageExtension.serverIndex(message);
    for (const component of this.components) {
      component.proceedMessage(message);
    }
    return this._executeHelper.execute(message, this._executeTokenSource.token);
  }

  load(): void {
    this.roundScene = this._resourceManager.getScene(this._roundConfiguration.sceneName);

    this.resizeFunction();
    const roots = [this.roundScene, ...this._sharedResources];
    this._executeHelper = new ExecutorsHolder(
      roots,
      this._roundConfiguration.execute,
      this._bonusContext
    );
    const sceneComponents = [this.roundScene, ...this._sharedResources];
    this.components = this.createComponents(sceneComponents);
    for (const component of this.components) {
      component.init();
      if (component instanceof ButtonsComponent) {
        component.clicked.listen((event) => this.onButtonClick(event!));
      }
      if (component instanceof SenderComponent) {
        component.invoked.listen((event) => this.onButtonClick(event!));
      }
    }
  }

  disableInteraction(): void {
    for (const component of this.components.filter(
      (component) => component instanceof ButtonsComponent
    )) {
      (component as ButtonsComponent).disable();
    }
  }

  unload(): void {
    for (const component of this.components) {
      component.deinit();
    }
    if (this.roundScene) {
      this._parent.removeChild(this.roundScene);
      this._resourceManager.clear(this._roundConfiguration.sceneName);
    }
  }

  show(): Promise<void> {
    this._parent.addChild(this.roundScene);
    return this.processMessage(
      RoundMessage.fromProperties(RoundMessageType.Show, this._currentMessage.properties)
    );
  }

  hide(): Promise<void> {
    return this.processMessage(
      RoundMessage.fromProperties(RoundMessageType.Hide, this._currentMessage.properties)
    );
  }

  interrupt(): void {
    this._executeTokenSource.cancel();
    this._loadTokenSource.cancel();
  }

  skipExecution(): void {
    this._executeTokenSource.cancel();
    this._executeTokenSource = new CancellationTokenSource(this._parentToken);
  }

  private onButtonClick(e: SelectionArgs): void {
    e.serverIndex = this._serverIndex;
    this._selectController.dispatchEvent(e);
  }

  private createComponents(scene: SceneObject[]): IRoundComponent[] {
    const components: IRoundComponent[] = [];

    if (this._roundConfiguration.components?.length) {
      for (const componentConfiguration of this._roundConfiguration.components) {
        if (componentConfiguration.type === ComponentType.ButtonSet) {
          components.push(
            new ButtonsComponent(componentConfiguration as ButtonSetConfiguration, scene)
          );
        } else if (componentConfiguration.type === ComponentType.Sender) {
          components.push(
            new SenderComponent(componentConfiguration as SenderSetConfiguration, scene)
          );
        } else if (componentConfiguration.type === ComponentType.SceneProvider) {
          components.push(
            new SceneProviderComponent(this._resourceManager, scene, componentConfiguration)
          );
        } else if (componentConfiguration.type === ComponentType.RandomGenerator) {
          components.push(
            new RandomGeneratorComponent(
              scene,
              componentConfiguration as RandomGeneratorConfiguration
            )
          );
        } else if (componentConfiguration.type === ComponentType.HistoryItems) {
          components.push(
            new HistoryItemsComponent(
              scene,
              componentConfiguration as HistoryItemsConfiguration,
              this._bonusContext.storageRepositoryProvider
            )
          );
        } else if (componentConfiguration.type === ComponentType.CardsGenerator) {
          components.push(new CardsGeneratorComponent(scene, componentConfiguration));
        } else if (componentConfiguration.type === ComponentType.CardColorSuitGenerator) {
          components.push(new CardColorSuitGeneratorComponent(scene, componentConfiguration));
        } else if (componentConfiguration.type === ComponentType.Variables) {
          components.push(new VariablesComponent(scene, componentConfiguration));
        } else if (componentConfiguration.type === ComponentType.Tutorial) {
          components.push(
            new TutorialComponent(
              componentConfiguration as TutorialConfiguration,
              this._bonusContext,
              scene
            )
          );
        }
      }
    }
    return components;
  }
}
