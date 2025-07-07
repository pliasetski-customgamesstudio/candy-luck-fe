import { Log } from './81_Log';
import { EPSILON, sign } from './globalFunctions';

export type TimeFunction = (time: number, start: number, end: number) => number;

export class TimeFunctionBuilder {
  static BuildTimeFunction(type: string, params: number[]): TimeFunction {
    if (type === 'CubicBezier') {
      const inverse = TimeFunctionBuilder.GetInverseCubicBezierOnUnitInterval(params[0], params[1]);
      const bezier = TimeFunctionBuilder.GetCubicBezierOnUnitInterval(params[2], params[3]);
      return (time: number, _start: number, _end: number) => bezier(inverse(time));
    } else if (type === 'ParametricQuadIn') {
      return TimeFunctionBuilder.ParametricQuadIn(params[0]);
    } else if (type === 'ParametricQuadOut') {
      return TimeFunctionBuilder.ParametricQuadOut(params[0]);
    } else if (type === 'QuadOut') {
      return TimeFunctionBuilder.QuadOut();
    } else if (type === 'QuadIn') {
      return TimeFunctionBuilder.QuadIn();
    }

    Log.Error('[TimeFunctionBuilder] unknown function type: ' + type + '. ignoring.');
    return (t: number, _s: number, _dx: number) => t;
  }

  static ParametricQuadIn(a: number): TimeFunction {
    return (t: number, _start: number, _end: number) => a * t * t - a * t + t;
  }

  static ParametricQuadOut(a: number): TimeFunction {
    return (t: number, _start: number, _end: number) => -a * t * t + a * t + t;
  }

  static QuadOut(): TimeFunction {
    return (t: number, _start: number, _end: number) => -t * (t - 2.0);
  }

  static QuadIn(): TimeFunction {
    return (t: number, _start: number, _end: number) => t * t;
  }

  static GetCubicBezierOnUnitInterval(cp1: number, cp2: number): (t: number) => number {
    const a = 3.0 * cp1 - 3.0 * cp2 + 1.0;
    const b = -6.0 * cp1 + 3.0 * cp2;
    const c = 3.0 * cp1;
    return (t: number) => {
      const t2 = t * t;
      const t3 = t2 * t;
      return a * t3 + b * t2 + c * t;
    };
  }

  static GetInverseCubicBezierOnUnitInterval(cp1: number, cp2: number): (t: number) => number {
    const a = 3.0 * cp1 - 3.0 * cp2 + 1.0;
    const b = -6.0 * cp1 + 3.0 * cp2;
    const c = 3.0 * cp1;

    if (Math.abs(a) < EPSILON) {
      if (Math.abs(b) < EPSILON) {
        return (t: number) => t;
      }
      const c2 = c * c;
      const b_4 = 4.0 * b;
      const a_inv = 1.0 / (2.0 * b);
      const ac = c / (2.0 * b);
      return (t: number) => Math.sqrt(c2 + b_4 * t) * a_inv - ac;
    }
    const b2 = b * b;
    const a2 = a * a;
    const b3 = b2 * b;
    const cden = 3.0 * a * c - b2;
    const p = cden / (3.0 * a2);
    const res_c0 = -b / (3.0 * a);

    if (Math.abs(p) < 0.001) {
      const q_c0 = (2.0 * b3 - 9 * a * b * c) / (27.0 * a2 * a);
      const q_c1 = -1.0 / a;
      return (t: number) => {
        const q = q_c0 + q_c1 * t;
        const res = res_c0 - sign(q) * Math.pow(Math.abs(q), 1.0 / 3.0);
        if (res < 0.0) return 0.0;
        return res > 1.0 ? 1.0 : res;
      };
    } else if (p > 0.0) {
      const res_c1 = -2.0 * Math.sqrt(p / 3.0);
      const r = Math.sqrt(3.0 / p);
      const arc_p0 = (-(9.0 * a * b * c - 2.0 * b3) * r) / (6.0 * a * cden);
      const arc_p1 = (-9.0 * a * r) / (2.0 * cden);
      return (t: number) => {
        const x = arc_p0 + arc_p1 * t;
        const result = res_c1 * Math.sinh(Math.log(x + Math.sqrt(x * x + 1.0)) / 3.0) + res_c0;
        if (result < 0.0) return 0.0;
        if (result > 1.0) return 1.0;
        return result;
      };
    } else {
      const res_c1 = 2.0 * Math.sqrt(-p / 3.0);
      const r = Math.sqrt(-3.0 / p);
      const arc_p0 = (-(9.0 * a * b * c - 2.0 * b3) * r) / (6.0 * a * cden);
      const arc_p1 = (-9.0 * a * r) / (2.0 * cden);
      const d_a = 9.0 * cp1 - 9.0 * cp2 + 3.0;
      const d_b = -12.0 * cp1 + 6.0 * cp2;
      const d_c = 3.0 * cp1;
      let d_det = d_b * d_b - 4 * d_a * d_c;
      d_det = Math.sqrt(d_det);
      const d_r1 = (-d_b + d_det) / (2.0 * d_a);
      const d_r2 = (-d_b - d_det) / (2.0 * d_a);
      let root_number = (-2.0 * Math.PI) / 3.0;
      if (d_r1 <= 0.0 && d_r2 <= 0.0) {
        root_number = 0.0;
      } else if (d_r1 >= 1.0 && d_r2 >= 1.0) {
        root_number *= 2.0;
      }
      return (t: number) => {
        const C = arc_p0 + arc_p1 * t;
        let result: number;
        if (C < 1.0 && C > -1.0) {
          result = res_c1 * Math.cos(Math.acos(C) / 3.0 + root_number) + res_c0;
        } else {
          const y = sign(C) * Math.cosh(Math.log(Math.abs(C) + Math.sqrt(C * C - 1.0)) / 3.0);
          result = res_c1 * y + res_c0;
        }

        if (result < 0.0) return t;
        if (result > 1.0) return t;

        return result;
      };
    }
  }
}
