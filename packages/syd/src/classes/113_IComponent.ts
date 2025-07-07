import { CgsEvent } from './12_Event';
import { SpriteBatch } from './248_SpriteBatch';

export interface IComponent {
  update(dt: number): void;

  draw(spriteBatch: SpriteBatch): void;

  dispatchEvent(event: CgsEvent): void;
}
