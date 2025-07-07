import { ScrollBehavior } from './142_ScrollBehavior';
import { Vector2 } from './15_Vector2';
import { IFramePulse } from './20_IFramePulse';

export class BounceableScrollBehavior extends ScrollBehavior {
  private _delta: Vector2 = new Vector2(0, 0);
  private _currPos: Vector2 = new Vector2(0, 0);
  private _acceleration: Vector2 = new Vector2(0, 0);
  private _state: BounceState = BounceState.Idle;
  private _hScrolled: boolean = false;
  private _vScrolled: boolean = false;
  private _frameDt: number = 0.0;

  springStiffness: number;
  damping: number;
  resistance: number;
  scrollThreshold: number;

  constructor(updater: IFramePulse) {
    super();
    this.springStiffness = 6.0;
    this.damping = 2.0;
    this.resistance = 200.0;
    this.scrollThreshold = 0.01;
    updater.framePulsate.listen((time) => this._onUpdate(time));
  }

  private static readonly accelEps: number = 0.1;

  cancel(): void {
    this._acceleration = new Vector2(0, 0);
    this._state = BounceState.Idle;
  }

  down(position: Vector2): void {
    this._currPos = position.clone();
    this._acceleration = new Vector2(0, 0);
    this._state = BounceState.Moved;
    this._frameDt = 0.0;
  }

  move(position: Vector2, dx: number, dy: number, _dt: number): void {
    if (this._state === BounceState.Moved) {
      const d: Vector2 = new Vector2(0, 0);
      if (this._hScrolled) {
        d.x = this._calculateResistance(position.x, dx, this._delta.x, 0.0) * dx;
      }
      if (this._vScrolled) {
        d.y = this._calculateResistance(position.y, dy, this._delta.y, 0.0) * dy;
      }

      this._currPos = position.clone().add(d);

      const idt: number = 1000.0 / Math.max(this._frameDt, 1.0);
      this._acceleration = this._acceleration.add(d.mulNum(idt));

      this.onChangePosition(new Vector2(-this._currPos.x, -this._currPos.y));
    }
  }

  setParams(scrollSize: Vector2, contentSize: Vector2): void {
    this._delta.x = contentSize.x <= scrollSize.x ? 0.0 : scrollSize.x - contentSize.x;
    this._delta.y = contentSize.y <= scrollSize.y ? 0.0 : scrollSize.y - contentSize.y;
    this._hScrolled = contentSize.x > scrollSize.x;
    this._vScrolled = contentSize.y > scrollSize.y;
  }

  setOffset(offset: Vector2): void {
    this._currPos = offset.clone().mulNum(-1.0);
    this.onChangePosition(new Vector2(-this._currPos.x, -this._currPos.y));
  }

  up(position: Vector2, dx: number, dy: number, dt: number): void {
    if (this._state === BounceState.Moved) {
      const idt: number = 1000.0 / Math.max(dt, 1.0);
      const d: Vector2 = new Vector2(0, 0);
      if (this._hScrolled) {
        d.x = this._calculateResistance(position.x, dx, this._delta.x, 0.0) * dx * idt;
      }
      if (this._vScrolled) {
        d.y = this._calculateResistance(position.y, dy, this._delta.y, 0.0) * dy * idt;
      }

      this._acceleration = this._acceleration.add(d);

      this._state = BounceState.Scrolled;
    }
  }

  wheel(position: Vector2, dx: number, dy: number, _dt: number): void {
    this._state = BounceState.Scrolled;
    const d: Vector2 = new Vector2(0, 0);
    if (this._hScrolled) {
      d.x = this._calculateResistance(position.x, dx, this._delta.x, 0.0) * dx;
    }
    if (this._vScrolled) {
      d.y = this._calculateResistance(position.y, dy, this._delta.y, 0.0) * dy;
    }
    this._acceleration = this._acceleration.add(d);
  }

  private _onUpdate(time?: number): void {
    if (time) {
      if (this._state === BounceState.Moved) {
        this._frameDt = time;
        this._acceleration.mulNum(0.5);
      } else if (this._state === BounceState.Scrolled) {
        if (this._decelerate(time)) {
          this._state = BounceState.Idle;
          this.onScrollFinished();
        }
      }
    }
  }

  private _calculateResistance(v: number, direction: number, min: number, max: number): number {
    let diff: number;
    if (v > max && direction > 0.0) {
      diff = v - max;
    } else if (v < min && direction < 0.0) {
      diff = min - v;
    } else {
      return 1.0;
    }
    return this.resistance > diff ? (this.resistance - diff) / this.resistance : 0.0;
  }

  private _calculate(
    pos: number,
    accel: number,
    min: number,
    max: number,
    dt: number
  ): [boolean, number, number] {
    const resistance: number = this._calculateResistance(pos, accel, min, max);
    accel = this._calculateSpring(accel, 0.0, 0.0, this.damping, dt) * resistance;

    pos += accel * dt;

    const spring: number = pos - this._calculateSpring(pos, min, max, this.springStiffness, dt);
    pos -= spring;

    if (Math.abs(accel) < BounceableScrollBehavior.accelEps) {
      if (Math.abs(pos) < BounceableScrollBehavior.accelEps) {
        pos = 0.0;
        accel = 0.0;
        return [false, pos, accel];
      }
      if (Math.abs(min - pos) < BounceableScrollBehavior.accelEps) {
        pos = min;
        accel = 0.0;
        return [false, pos, accel];
      }
      if (Math.abs(spring) < BounceableScrollBehavior.accelEps) {
        return [false, pos, accel];
      }
    }
    return [true, pos, accel];
  }

  private static _spring(v: number, t: number, stiffness: number, dt: number): number {
    const dx: number = t - v;
    return v + dx * dt * stiffness;
  }

  private _calculateSpring(
    v: number,
    min: number,
    max: number,
    stiffness: number,
    dt: number
  ): number {
    if (v > max) {
      return BounceableScrollBehavior._spring(v, max, stiffness, dt);
    }
    if (v < min) {
      return BounceableScrollBehavior._spring(v, min, stiffness, dt);
    }
    return v;
  }

  private _decelerate(dt: number): boolean {
    dt = Math.max(dt, 0.001);
    const hScrolling: [boolean, number, number] = this._calculate(
      this._currPos.x,
      this._acceleration.x,
      this._delta.x,
      0.0,
      dt
    );
    this._currPos.x = hScrolling[1];
    this._acceleration.x = hScrolling[2];
    const vScrolling: [boolean, number, number] = this._calculate(
      this._currPos.y,
      this._acceleration.y,
      this._delta.y,
      0.0,
      dt
    );
    this._currPos.y = vScrolling[1];
    this._acceleration.y = vScrolling[2];
    this.onChangePosition(this._currPos.clone().mulNum(-1.0));
    return !(hScrolling[0] || vScrolling[0]);
  }
}

export enum BounceState {
  Idle,
  Moved,
  Scrolled,
}
