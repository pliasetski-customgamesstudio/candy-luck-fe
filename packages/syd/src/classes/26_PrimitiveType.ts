export enum PrimitiveType {
  TriangleList = WebGLRenderingContext.TRIANGLES,
  TriangleStrip = WebGLRenderingContext.TRIANGLE_STRIP,
}

export function getTrianglesCount(primitiveType: PrimitiveType, verticesCount: number): number {
  switch (primitiveType) {
    case PrimitiveType.TriangleList:
      return Math.floor(verticesCount / 3);
    case PrimitiveType.TriangleStrip:
      return verticesCount - 2;
    default:
      return 0;
  }
}
