import { RoundConfiguration } from './configuration/elements/round_configuration';
import { EventStream, SceneObject } from '@cgs/syd';
import { IRoundComponent } from './components/i_round_component';
import { SelectionArgs } from './messaging/selection_args';
import { RoundMessage } from './messaging/round_message';

export interface IRound {
  configuration: RoundConfiguration;
  interactiveRound: boolean;
  roundScene: SceneObject;
  components: IRoundComponent[];
  select: EventStream<SelectionArgs>;
  serverIndexes: number[];

  processMessage(message: RoundMessage): Promise<void>;

  load(): void;

  show(): Promise<void>;

  interrupt(): void;

  disableInteraction(): void;

  skipExecution(): void;

  unload(): void;

  hide(): Promise<void>;
}
