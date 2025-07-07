import { TextureSource } from './40_TextureSource';

export class OutputLink {
  source: TextureSource;
  outputs: number[];

  constructor(source: TextureSource, outputs: number[]) {
    this.source = source;
    this.outputs = outputs;
  }
}
