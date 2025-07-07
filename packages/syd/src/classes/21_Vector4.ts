export class Vector4 {
  data: Float32Array;

  constructor(x: number, y: number, z: number, w: number) {
    this.data = new Float32Array([x, y, z, w]);
  }
}
