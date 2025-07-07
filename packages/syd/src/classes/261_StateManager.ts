import { BatchStates } from './246_BatchStates';
import { Effect, HasEffect } from './89_Effect';
import { BlendState } from './63_BlendState';
import { RasterizerState } from './65_RasterizerState';
import { Color4 } from './10_Color4';
import { ImageAdjust } from './55_ImageAdjust';
import { Mask } from './211_Mask';
import { Vector2 } from './15_Vector2';
import { Matrix3 } from './57_Matrix3';

export type StateType =
  | BlendState
  | Effect
  | Color4
  | ImageAdjust
  | Mask
  | Matrix3
  | Vector2
  | RasterizerState;

export class StateManager {
  private _batchStates: BatchStates[] = [];

  static readonly persistentEffects: number =
    Effect.Transform | Effect.Video | Effect.Texture0 | Effect.PremultAlpha;

  private _batchState: BatchStates | null = null;

  get blend(): BlendState | null {
    return this._batchState?.blend ?? null;
  }

  get rasterizer(): RasterizerState | null {
    return this._batchState?.rasterizer ?? null;
  }

  get color(): Color4 {
    return this._batchState?.color ?? Color4.White;
  }

  get effect(): number {
    return this._batchState?.effect ?? 0;
  }

  get imageAdjust(): ImageAdjust | null {
    return this._batchState?.imageAdjust ?? null;
  }

  get mask1(): Mask | null {
    return this._batchState?.mask1 ?? null;
  }

  get mask2(): Mask | null {
    return this._batchState?.mask2 ?? null;
  }

  get transform(): Matrix3 | null {
    if (this._batchState?.transforms && this._batchState.transforms.length > 0) {
      return this._batchState.transforms[this._batchState.transforms.length - 1];
    }
    return null;
  }

  get offset(): Vector2 {
    if (this._batchState?.offsets && this._batchState.offsets.length > 0) {
      return this._batchState.offsets[this._batchState.offsets.length - 1];
    }
    return Vector2.Zero;
  }

  get hasColor(): boolean {
    return (this._batchState?.colors?.length ?? 0) > 0;
  }

  addState(): void {
    this._batchState = new BatchStates();
    this._batchStates.push(this._batchState);
  }

  removeState(): void {
    if (this._batchStates.length > 0) {
      this._batchStates.pop();
      this._batchState =
        this._batchStates.length > 0 ? this._batchStates[this._batchStates.length - 1] : null;
    }
  }

  pushState(state: StateType): void {
    if (this._batchState) {
      if (typeof state === 'number' && HasEffect(state)) {
        if (this._batchState.effects.length === 0) {
          this._batchState.effects.push(state);
        } else {
          const persistedEffects =
            (state & StateManager.persistentEffects) === 0
              ? this._batchState.effects[this._batchState.effects.length - 1] &
                StateManager.persistentEffects
              : this._batchState.effects[this._batchState.effects.length - 1];
          this._batchState.effects.push(persistedEffects | state);
        }
        this._batchState.effect = this._batchState.effects[this._batchState.effects.length - 1];
      } else if (state instanceof BlendState) {
        this._batchState.blends.push(state);
        this._batchState.blend = state;
      } else if (state instanceof Color4) {
        if (this._batchState.colors.length === 0) {
          this._batchState.colors.push(state);
        } else {
          this._batchState.colors.push(
            this._batchState.colors[this._batchState.colors.length - 1].multiply(state)
          );
        }
        this._batchState.color = this._batchState.colors[this._batchState.colors.length - 1];
      } else if (state instanceof ImageAdjust) {
        if (this._batchState.imageAdjusts.length === 0) {
          this._batchState.imageAdjusts.push(state);
        } else {
          this._batchState.imageAdjusts.push(
            ImageAdjust.Combine(
              this._batchState.imageAdjusts[this._batchState.imageAdjusts.length - 1],
              state
            )
          );
        }
        this._batchState.imageAdjust =
          this._batchState.imageAdjusts[this._batchState.imageAdjusts.length - 1];
      } else if (state instanceof Mask) {
        if (this._batchState.offsets.length > 0) {
          state.worldTransform.tx +=
            this._batchState.offsets[this._batchState.offsets.length - 1].x;
          state.worldTransform.ty +=
            this._batchState.offsets[this._batchState.offsets.length - 1].y;
        }

        if (this._batchState.transforms.length > 0) {
          const transformed = Matrix3.undefined();
          Matrix3.Multiply(
            state.worldTransform,
            this._batchState.transforms[this._batchState.transforms.length - 1],
            transformed
          );
          state.worldTransform = transformed;
        }

        this._batchState.masks.push(state);
        if (this._batchState.mask1) {
          this._batchState.mask2 = state;
        } else {
          this._batchState.mask1 = state;
        }
      } else if (state instanceof Matrix3) {
        this._batchState.transforms.push(state);
      } else if (state instanceof Vector2) {
        this._batchState.offsets.push(state);
      } else if (state instanceof RasterizerState) {
        this._batchState.rasterizer = state;
        this._batchState.rasterizers.push(state);
      }
    }
  }

  setState(state: StateType): void {
    if (this._batchState) {
      if (typeof state === 'number' && HasEffect(state)) {
        this._batchState.effects.push(state);
        this._batchState.effect = state;
      } else if (state instanceof BlendState) {
        this._batchState.blends.push(state);
        this._batchState.blend = state;
      } else if (state instanceof Color4) {
        this._batchState.colors.push(state);
        this._batchState.color = state;
      } else if (state instanceof ImageAdjust) {
        this._batchState.imageAdjusts.push(state);
        this._batchState.imageAdjust = state;
      } else if (state instanceof Mask) {
        this._batchState.masks.push(state);
        this._batchState.mask1 = state;
      } else if (state instanceof Matrix3) {
        this._batchState.transforms.push(state);
      } else if (state instanceof Vector2) {
        this._batchState.offsets.push(state);
      }
    }
  }

  popState(state: StateType): void {
    if (this._batchState) {
      if (typeof state === 'number' && HasEffect(state)) {
        this._batchState.effects.pop();
        this._batchState.effect =
          this._batchState.effects.length > 0
            ? this._batchState.effects[this._batchState.effects.length - 1]
            : 0;
      } else if (state instanceof BlendState) {
        this._batchState.blends.pop();
        this._batchState.blend =
          this._batchState.blends.length > 0
            ? this._batchState.blends[this._batchState.blends.length - 1]
            : null;
      } else if (state instanceof Color4) {
        this._batchState.colors.pop();
        this._batchState.color =
          this._batchState.colors.length > 0
            ? this._batchState.colors[this._batchState.colors.length - 1]
            : Color4.White;
      } else if (state instanceof ImageAdjust) {
        this._batchState.imageAdjusts.pop();
        this._batchState.imageAdjust =
          this._batchState.imageAdjusts.length > 0
            ? this._batchState.imageAdjusts[this._batchState.imageAdjusts.length - 1]
            : null;
      } else if (state instanceof Mask) {
        this._batchState.masks.pop();
        this._batchState.mask1 =
          this._batchState.masks.length > 0
            ? this._batchState.masks[this._batchState.masks.length - 1]
            : null;
        this._batchState.mask2 = null;
      } else if (state instanceof Matrix3) {
        this._batchState.transforms.pop();
      } else if (state instanceof Vector2) {
        this._batchState.offsets.pop();
      } else if (state instanceof RasterizerState) {
        this._batchState.rasterizers.pop();
        this._batchState.rasterizer =
          this._batchState.rasterizers.length > 0
            ? this._batchState.rasterizers[this._batchState.rasterizers.length - 1]
            : null;
      }
    }
  }
}
