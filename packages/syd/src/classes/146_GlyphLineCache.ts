import { Matrix3 } from './57_Matrix3';
import { GlyphCache } from './117_GlyphCache';

export class GlyphLineCache {
  transform: Matrix3 | null = null; // can be null
  glyphs: GlyphCache[];

  constructor(transform: Matrix3 | null, glyphs: GlyphCache[]) {
    this.transform = transform;
    this.glyphs = glyphs;
  }
}
