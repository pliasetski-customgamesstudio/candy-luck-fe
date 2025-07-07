import { State } from './208_State';

export abstract class CompositeState extends State {
  abstract getChild(index: number): State;
}
