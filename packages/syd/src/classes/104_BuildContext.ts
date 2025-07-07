import { BuildedNode } from './138_BuildedNode';
import { OutputLink } from './58_OutputLink';

export class BuildContext {
  public readonly objects: BuildedNode[] = [];
  public readonly links: OutputLink[] = [];
}
