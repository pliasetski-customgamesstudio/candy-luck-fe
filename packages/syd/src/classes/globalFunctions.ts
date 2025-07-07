import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { Vector2 } from './15_Vector2';
import { DimensionSourceScale } from './38_DimensionSourceScale';
import { TextFormattingMode } from './51_TextFormattingMode';
import { VerticalAlignment } from './66_VerticalAlignment';
import { HorizontalAlignment } from './73_HorizontalAlignment';
import { DimensionSource } from './131_DimensionSource';
import { PropertyType } from './14_PropertyInfo';

export const EPSILON: number = 1e-15;

export function clamp(x: number, lower: number, upper: number): number {
  return Math.max(lower, Math.min(upper, x));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutCubicInterpolate(x0: number, dx: number, r: number): number {
  return (dx - x0) * (1 - Math.pow(1 - r, 3)) + x0;
}

export function lerpi(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function abs(v: number): number {
  return v > 0.0 ? v : -v;
}

export function sign(v: number): number {
  return v >= 0.0 ? 1.0 : -1.0;
}

/// Returns the hyperbolic sine of x.
export function sinh(x: number): number {
  return (Math.exp(2 * x) - 1) / (2 * Math.exp(x));
}

/// Returns hyperbolic cosine of x.
export function cosh(x: number): number {
  return (Math.exp(2 * x) + 1) / (2 * Math.exp(x));
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180.0;
}

export function toDegrees(radians: number): number {
  return (radians * 180.0) / Math.PI;
}

export function linearOnUnitInterval(r: number, _x0: number, _dx: number): number {
  return r;
}

export function easeInQuad(r: number, x0: number, dx: number): number {
  return dx * r * r + x0;
}

export function easeOutQuad(r: number, x0: number, dx: number): number {
  return -dx * r * (r - 2) + x0;
}

export function easeInOut(r: number, x0: number, dx: number): number {
  r *= 2;
  if (r < 1) return dx * 0.5 * r * r + x0;
  return -dx * 0.5 * ((r - 1) * (r - 3) - 1) + x0;
}

export function easeInCubic(r: number, x0: number, dx: number): number {
  return dx * r * r * r + x0;
}

export function easeOutCubic(r: number, x0: number, dx: number): number {
  return dx * ((r = r - 1) * r * r + 1) + x0;
}

export function easeInOutCubic(r: number, x0: number, dx: number): number {
  r *= 2;
  if (r < 1) return (dx / 2) * r * r * r + x0;
  return (dx / 2) * ((r -= 2) * r * r + 2) + x0;
}

export function easeInQuart(r: number, x0: number, dx: number): number {
  return dx * r * r * r * r + x0;
}

export function easeOutQuart(r: number, x0: number, dx: number): number {
  return -dx * ((r = r - 1) * r * r * r - 1) + x0;
}

export function easeInOutQuart(r: number, x0: number, dx: number): number {
  r *= 2;
  if (r < 1) return (dx / 2) * r * r * r * r + x0;
  return (-dx / 2) * ((r -= 2) * r * r * r - 2) + x0;
}

export function easeInQuint(r: number, x0: number, dx: number): number {
  return dx * r * r * r * r * r + x0;
}

export function easeOutQuint(r: number, x0: number, dx: number): number {
  return dx * ((r = r - 1) * r * r * r * r + 1) + x0;
}

export function easeInOutQuint(r: number, x0: number, dx: number): number {
  r *= 2;
  if (r < 1) return (dx / 2) * r * r * r * r * r + x0;
  return (dx / 2) * ((r -= 2) * r * r * r * r + 2) + x0;
}

export function easeInExpo(r: number, x0: number, dx: number): number {
  return r === 0 ? x0 : dx * Math.pow(2, 10 * (r - 1)) + x0;
}

export function easeOutExpo(r: number, x0: number, dx: number): number {
  return r === 1 ? x0 + dx : dx * (-Math.pow(2, -10 * r) + 1) + x0;
}

export function easeInOutExpo(r: number, x0: number, dx: number): number {
  if (r === 0) return x0;
  if (r === 1) return x0 + dx;
  r *= 2;
  if (r < 1) return (dx / 2) * Math.pow(2, 10 * (r - 1)) + x0;
  return (dx / 2) * (-Math.pow(2, -10 * --r) + 2) + x0;
}

export function easeInSine(r: number, x0: number, dx: number): number {
  return -dx * Math.cos(r * (Math.PI / 2)) + dx + x0;
}

export function easeOutSine(r: number, x0: number, dx: number): number {
  return dx * Math.sin(r * (Math.PI / 2)) + x0;
}

export function easeInOutSine(r: number, x0: number, dx: number): number {
  return (-dx / 2) * Math.cos(Math.PI * r) - 1 + x0;
}

export function easeInCirc(r: number, x0: number, dx: number): number {
  return -dx * (Math.sqrt(1 - r * r) - 1) + x0;
}

export function easeOutCirc(r: number, x0: number, dx: number): number {
  return dx * Math.sqrt(1 - (r = r - 1) * r) + x0;
}

export function easeInOutCirc(r: number, x0: number, dx: number): number {
  r *= 2;
  if (r < 1) return (-dx / 2) * (Math.sqrt(1 - r * r) - 1) + x0;
  return (dx / 2) * (Math.sqrt(1 - r * (r -= 2)) + 1) + x0;
}

export function easeInElastic(r: number, x0: number, dx: number): number {
  if (r === 0) return x0;
  if (r === 1) return x0 + dx;
  const p = 0.3;
  const a = dx;
  const s = p / 4;
  const postFix = a * Math.pow(2, 10 * (r -= 1));
  return -(postFix * Math.sin(((r - s) * (2 * Math.PI)) / p)) + x0;
}

export function easeOutElastic(r: number, x0: number, dx: number): number {
  if (r === 0) return x0;
  if (r === 1) return x0 + dx;
  const p = 0.3;
  const a = dx;
  const s = p / 4;
  return a * Math.pow(2, -10 * r) * Math.sin(((r - s) * (2 * Math.PI)) / p) + dx + x0;
}

export function easeInOutElastic(r: number, x0: number, dx: number): number {
  if (r === 0) return x0;
  if (r === 1) return x0 + dx;
  const p = 0.3 * 1.5;
  const a = dx;
  const s = p / 4;
  r *= 2;
  let postFix;
  if (r < 1) {
    postFix = a * Math.pow(2, 10 * (r -= 1));
    return -0.5 * (postFix * Math.sin((r * s * (2 * Math.PI)) / p)) + x0;
  }
  postFix = a * Math.pow(2, -10 * (r -= 1));
  return postFix * Math.sin(((r - s) * (2 * Math.PI)) / p) * 0.5 + dx + x0;
}

export function easeInBounce(r: number, x0: number, dx: number): number {
  return dx - easeOutBounce(1 - r, 0.0, dx) + x0;
}

export function easeOutBounce(r: number, x0: number, dx: number): number {
  if (r < 1 / 2.75) {
    return dx * (7.5625 * r * r) + x0;
  } else if (r < 2 / 2.75) {
    const postFix = (r -= 1.5 / 2.75);
    return dx * (7.5625 * postFix * r + 0.75) + x0;
  } else if (r < 2.5 / 2.75) {
    const postFix = (r -= 2.25 / 2.75);
    return dx * (7.5625 * postFix * r + 0.9375) + x0;
  } else {
    const postFix = (r -= 2.625 / 2.75);
    return dx * (7.5625 * postFix * r + 0.984375) + x0;
  }
}

export function easeInOutBounce(r: number, x0: number, dx: number): number {
  r *= 2;
  if (r < 1) return easeInBounce(r, 0.0, dx) * 0.5 + x0;
  return easeOutBounce(r - 1, 0.0, dx) * 0.5 + dx * 0.5 + x0;
}

export function easeInBack(r: number, x0: number, dx: number): number {
  const s = 1.70158;
  const postFix = r;
  return dx * postFix * r * ((s + 1) * r - s) + x0;
}

export function easeOutBack(r: number, x0: number, dx: number): number {
  const s = 1.70158;
  return dx * ((r = r - 1) * r * ((s + 1) * r + s) + 1) + x0;
}

export function easeInOutBack(r: number, x0: number, dx: number): number {
  const s = 1.70158 * 1.525;
  r *= 2;

  if (r < 1) return (dx / 2) * (r * r * ((s + 1) * r - s)) + x0;
  const postFix = (r -= 2);
  return (dx / 2) * (postFix * r * ((s + 1) * r + s) + 2) + x0;
}

export function easeOutOnUnitInterval(r: number, _x0: number, _dx: number): number {
  if (r === 0) return 0.0;
  if (r === 1) return 1.0;
  const p = 0.3;
  const s = p / 4;
  return Math.pow(2, -10 * r) * Math.sin(((r - s) * (2 * Math.PI)) / p) + 1;
}

export function parseValue(type: PropertyType, json: any, defaultValue: any): any {
  if (json === undefined || json === '' || json === null) {
    return defaultValue;
  }

  if (type === PropertyType.Vector2) {
    return parseVector2(json, defaultValue);
  }

  if (type === PropertyType.Size) {
    return parseSize(json, defaultValue);
  }

  if (type === PropertyType.Color4) {
    return parseColor4(json, defaultValue);
  }

  if (type === PropertyType.Color4i) {
    return parseColor4i(json, defaultValue);
  }

  if (type === PropertyType.Rect) {
    return parseRect(json, defaultValue);
  }

  if (type === PropertyType.Int || type === PropertyType.Double) {
    return Number(json);
  }

  if (type === PropertyType.HorizontalAlignment) {
    if (json === 'Center') return HorizontalAlignment.Center;
    if (json === 'Left') return HorizontalAlignment.Left;
    if (json === 'Right') return HorizontalAlignment.Right;
  }

  if (type === PropertyType.VerticalAlignment) {
    if (json === 'Center') return VerticalAlignment.Center;
    if (json === 'Top') return VerticalAlignment.Top;
    if (json === 'Bottom') return VerticalAlignment.Bottom;
  }

  if (type === PropertyType.DimensionSource) {
    if (json === 'ProportionalSize') return DimensionSource.ProportionalSize;
    if (json === 'Size') return DimensionSource.Size;
    if (json === 'Frame') return DimensionSource.Frame;
  }

  if (type === PropertyType.DimensionSourceScale) {
    if (json === 'Both') return DimensionSourceScale.Both;
    if (json === 'UpOnly') return DimensionSourceScale.UpOnly;
    if (json === 'DownOnly') return DimensionSourceScale.DownOnly;
  }

  if (type === PropertyType.TextFormattingMode) {
    if (json === 'Default') return TextFormattingMode.Default;
    if (json === 'AdjustToScale') return TextFormattingMode.AdjustToScale;
  }

  return json;
}

export function parseRect(json: { [key: string]: any }, defValue: Rect): Rect {
  const pos = parseVector2(json, defValue.lt);
  const size = parseSize(json, defValue.size);

  return Rect.fromSize(pos, size);
}

export function parseInt(json: { [key: string]: any }, name: string, defValue: number): number {
  const v = json[name];
  return v !== undefined ? v : defValue;
}

export function parseDouble(json: { [key: string]: any }, name: string, defValue: number): number {
  const v = json[name];
  return v !== undefined ? Number(v) : defValue;
}

export function parseVector2(json: { [key: string]: any }, defaultValue: Vector2): Vector2 {
  const x = parseDouble(json, 'x', defaultValue.x);
  const y = parseDouble(json, 'y', defaultValue.y);
  return new Vector2(x, y);
}

export function parseColor4(json: { [key: string]: any }, defaultValue: Color4): Color4 {
  const rc = json['r'];
  const gc = json['g'];
  const bc = json['b'];
  const ac = json['a'];

  const r = rc !== undefined ? Number(rc) : defaultValue.r;
  const g = gc !== undefined ? Number(gc) : defaultValue.g;
  const b = bc !== undefined ? Number(bc) : defaultValue.b;
  const a = ac !== undefined ? Number(ac) : defaultValue.a;

  return new Color4(r, g, b, a);
}

export function parseColor4i(json: { [key: string]: any }, defaultValue: Color4): Color4 {
  const BYTE_TO_FLOAT = 1.0 / 255.0;

  const rc = json['r'];
  const gc = json['g'];
  const bc = json['b'];
  const ac = json['a'];

  const r = rc !== undefined ? rc * BYTE_TO_FLOAT : defaultValue.r;
  const g = gc !== undefined ? gc * BYTE_TO_FLOAT : defaultValue.g;
  const b = bc !== undefined ? bc * BYTE_TO_FLOAT : defaultValue.b;
  const a = ac !== undefined ? ac * BYTE_TO_FLOAT : defaultValue.a;

  return new Color4(r, g, b, a);
}

export function parseSize(json: { [key: string]: any }, defValue: Vector2): Vector2 {
  const w = parseDouble(json, 'w', defValue.x);
  const h = parseDouble(json, 'h', defValue.y);
  return new Vector2(w, h);
}

export function toCanvasTextAlign(ha: HorizontalAlignment): CanvasTextAlign {
  switch (ha) {
    case HorizontalAlignment.Left:
      return 'left';
    case HorizontalAlignment.Center:
      return 'center';
    case HorizontalAlignment.Right:
      return 'right';
    default:
      return 'center';
  }
}

export function toCanvasTextBaseline(va: VerticalAlignment): CanvasTextBaseline {
  switch (va) {
    case VerticalAlignment.Top:
      return 'top';
    case VerticalAlignment.Center:
      return 'middle';
    case VerticalAlignment.Bottom:
      return 'bottom';
    default:
      return 'middle';
  }
}

export function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

export function isFullscreenMode() {
  return !!document.fullscreenElement;
  // Probably won't need all this old-browser support logic
  // || !!document.msFullscreenElement
  // || !!document.mozFullScreen
  // || !!document.webkitIsFullScreen;
}

export const PIXEL_RATIO: number = (function () {
  // const ctx = document.createElement('canvas').getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  // var bsr = ctx.webkitBackingStorePixelRatioo ||
  //         ctx.mozBackingStorePixelRatio ||
  //         ctx.msBackingStorePixelRatio ||
  //         ctx.oBackingStorePixelRatio ||
  //         ctx.backingStorePixelRatio || 1;
  const bsr = 1; // Probably won't need all this old-browser support logic

  return dpr / bsr;
})();

export function truncateToDouble(value: number): number {
  // Check if the value is a finite number
  if (!isFinite(value)) {
    return value;
  }

  // Handle the edge case for negative numbers slightly greater than -1
  if (value > -1.0 && value < 0.0) {
    return -0.0;
  }

  // Truncate the fractional part
  return value >= 0 ? Math.floor(value) : Math.ceil(value);
}
