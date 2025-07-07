export abstract class WebGL {
  static readonly MAX_TEXTURE_UNITS = 16;

  // To suppress missing implicit constructor warnings.
  private constructor() {
    throw new Error('Not supported');
  }

  static readonly STATIC_DRAW = 0x88e4;

  static readonly DYNAMIC_DRAW = 0x88e8;

  static readonly STREAM_DRAW = 0x88e0;

  static readonly ELEMENT_ARRAY_BUFFER = 0x8893;

  static readonly ZERO = 0;

  static readonly ONE = 1;

  static readonly SRC_ALPHA = 0x0302;

  static readonly ONE_MINUS_SRC_ALPHA = 0x0303;

  static readonly ONE_MINUS_SRC_COLOR = 0x0301;
}
