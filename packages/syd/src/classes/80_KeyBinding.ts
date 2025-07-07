export type KeyBindingFunction = () => void;

export class KeyBinding {
  keyName: string;
  description: string;
  binding: KeyBindingFunction;

  constructor(keyName: string, description: string, binding: KeyBindingFunction) {
    this.keyName = keyName;
    this.description = description;
    this.binding = binding;
  }
}
