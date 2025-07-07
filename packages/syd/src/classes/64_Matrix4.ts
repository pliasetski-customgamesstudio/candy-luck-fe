import { Vector2 } from './15_Vector2';

export class Matrix4 {
  static readonly Identity: Matrix4 = new Matrix4();

  static orthoProjection(lt: Vector2, rb: Vector2, near: number, far: number): Matrix4 {
    const rml = rb.x - lt.x;
    const rpl = rb.x + lt.x;
    const tmb = lt.y - rb.y;
    const tpb = lt.y + rb.y;
    const fmn = far - near;
    const fpn = far + near;

    const matrix = new Matrix4();
    matrix.set(0, 0, 2.0 / rml);
    matrix.set(1, 1, 2.0 / tmb);
    matrix.set(2, 2, -2.0 / fmn);
    matrix.set(0, 3, -rpl / rml);
    matrix.set(1, 3, -tpb / tmb);
    matrix.set(2, 3, -fpn / fmn);
    matrix.set(3, 3, 1.0);

    return matrix;
  }

  data: Float32Array = new Float32Array(16);

  private constructor() {
    this.set(0, 0, 1.0);
    this.set(1, 1, 1.0);
    this.set(2, 2, 1.0);
    this.set(3, 3, 1.0);
  }

  private set(r: number, c: number, v: number): void {
    this.data[r + c * 4] = v;
  }
}
