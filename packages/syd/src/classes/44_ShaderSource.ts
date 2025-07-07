import { ShaderSourceResource } from './74_ShaderSourceResource';

export class ShaderSource {
  constructor(
    public vertex: ShaderSourceResource,
    public fragment: ShaderSourceResource
  ) {}
}
