import { GlContextHelper } from './150_GlContextHelper';
import { IDisposable } from './5_Disposable';

export class ShaderProgram implements IDisposable {
  private readonly _context: WebGLRenderingContext;
  private readonly _contextHelper: GlContextHelper;
  private readonly _program: WebGLProgram;

  constructor(
    context: WebGLRenderingContext,
    contextHelper: GlContextHelper,
    program: WebGLProgram
  ) {
    this._context = context;
    this._contextHelper = contextHelper;
    this._program = program;
  }

  public get program(): WebGLProgram {
    return this._program;
  }

  public dispose(): void {
    this._contextHelper.unuseProgram(this._program);
    this._context.deleteProgram(this._program);
  }

  public link(): void {
    this._context.linkProgram(this._program);
  }

  public bindAttribute(location: number, name: string): void {
    this._context.bindAttribLocation(this._program, location, name);
  }

  public getUniformLocation(name: string): WebGLUniformLocation | null {
    return this._context.getUniformLocation(this._program, name);
  }

  public uniform1i(location: WebGLUniformLocation, x: number): void {
    this._contextHelper.useProgram(this._program);
    this._context.uniform1i(location, x);
  }

  public uniformMatrix3fv(location: WebGLUniformLocation, matrix: Float32Array): void {
    this._contextHelper.useProgram(this._program);
    this._context.uniformMatrix3fv(location, false, matrix);
  }

  public uniform2f(location: WebGLUniformLocation, x: number, y: number): void {
    this._contextHelper.useProgram(this._program);
    this._context.uniform2f(location, x, y);
  }

  public uniform3f(location: WebGLUniformLocation, x: number, y: number, z: number): void {
    this._contextHelper.useProgram(this._program);
    this._context.uniform3f(location, x, y, z);
  }

  public uniform4f(
    location: WebGLUniformLocation,
    x: number,
    y: number,
    z: number,
    w: number
  ): void {
    this._contextHelper.useProgram(this._program);
    this._context.uniform4f(location, x, y, z, w);
  }
}
