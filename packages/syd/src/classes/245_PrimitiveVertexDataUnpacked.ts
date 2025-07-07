// TODO: Has strange inheritance scheme, and looks like is needed only to support old IEs
// Probably worth removing

// import {VertexData} from "./188_VertexData";
// import {PrimitiveVertexData} from "./235_PrimitiveVertexData";
// import {InputLayout} from "./49_InputLayout";
// import {InputLayoutElement} from "./46_InputLayoutElement";
// import {VertexElementUsage} from "./69_VertexElementUsage";
// import {VertexElementFormat} from "./149_VertexElementFormat";
//
// export class PrimitiveVertexDataUnpacked extends PrimitiveVertexData {
//   private _inputLayout: InputLayout;
//
//   get inputLayout(): InputLayout {
//     return this._inputLayout;
//   }
//
//   constructor(verticesCount: number) {
//     super(PrimitiveVertexDataUnpacked.VERTEX_SIZE, verticesCount);
//     this._inputLayout = new InputLayout([
//       new InputLayoutElement(0, VertexElementUsage.Position,
//         VertexElementFormat.Vector2f, 0),
//       new InputLayoutElement(0, VertexElementUsage.Color,
//         VertexElementFormat.Vector4f, Float32Array.BYTES_PER_ELEMENT * 2)
//     ]);
//   }
//
//   setVertices(vertices: PrimitiveVertex[]): void {
//     const cnt = vertices.length;
//     for (let i = 0; i < cnt; ++i) {
//       const v = vertices[i];
//       this.setVertex(i, v.pos, v.color);
//     }
//   }
//
//   setVertex(i: number, v: Vector2, color: Color4): void {
//     const offset = i * VERTEX_SIZE_IN_FLOATS;
//
//     this.floatData[offset] = v.x;
//     this.floatData[offset + 1] = v.y;
//
//     this.floatData[offset + 2] = color.r;
//     this.floatData[offset + 3] = color.g;
//     this.floatData[offset + 4] = color.b;
//     this.floatData[offset + 5] = color.a;
//   }
//
//   static readonly VERTEX_SIZE =
//     Float32Array.BYTES_PER_ELEMENT * 2 + Float32Array.BYTES_PER_ELEMENT * 4;
//   static readonly VERTEX_SIZE_IN_FLOATS = VERTEX_SIZE >> 2;
// }
