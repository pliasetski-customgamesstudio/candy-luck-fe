import { ShaderProgram } from './103_ShaderProgram';
import { RenderDevice } from './244_RenderDevice';
import { ShaderSource } from './44_ShaderSource';
import { Resource } from './8_Resource';

export class ShaderResource extends Resource<ShaderSource> {
  static readonly TypeId: string = 'shader';
  private readonly _renderDevice: RenderDevice;

  constructor(renderDevice: RenderDevice, id: string) {
    super(id);
    this._renderDevice = renderDevice;
  }

  get typeId(): string {
    return ShaderResource.TypeId;
  }

  compile(defines: string[]): ShaderProgram | null {
    console.log(`ShaderResource compiling shader ${defines}`);
    return this._renderDevice.createShaderProgram(
      this.data!.vertex!.data!,
      this.data!.fragment!.data!,
      defines
    );
  }
}
