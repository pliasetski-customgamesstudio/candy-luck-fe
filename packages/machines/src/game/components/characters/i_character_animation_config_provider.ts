import { CharacterAction } from './character_animation_provider';

export interface ICharacterAnimationConfigProvider {
  characterActions: { [key: string]: CharacterAction[] };
}
