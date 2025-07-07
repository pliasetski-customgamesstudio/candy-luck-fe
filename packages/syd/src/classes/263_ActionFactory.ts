import { Color4 } from './10_Color4';
import { Rect } from './112_Rect';
import { InterpolateCopyAction } from './130_InterpolateCopyAction';
import { Vector2 } from './15_Vector2';
import { InterpolateAction } from './24_InterpolateAction';
import { DiscreteAction } from './34_DiscreteAction';
import { DimensionSourceScale } from './38_DimensionSourceScale';
import { Size } from './3_Size';
import { HorizontalAlignment } from './73_HorizontalAlignment';
import { InterpolateInplaceAction } from './76_InterpolateInplaceAction';
import { lerp, lerpi } from './globalFunctions';
import { VerticalAlignment } from './66_VerticalAlignment';
import { DimensionSource } from './131_DimensionSource';
import { PropertyType } from './14_PropertyInfo';

export class ActionFactory {
  static CreateInterpolateDouble(): InterpolateCopyAction<number> {
    return new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
  }

  static CreateInterpolateVector2(): InterpolateInplaceAction<Vector2> {
    return new InterpolateInplaceAction<Vector2>((v) => v.clone()).withInterpolateFunction(
      Vector2.lerpInplace
    );
  }

  static CreateInterpolateVector2Copy(): InterpolateCopyAction<Vector2> {
    return new InterpolateCopyAction<Vector2>().withInterpolateFunction(Vector2.lerp);
  }

  static CreateInterpolateInt(): InterpolateCopyAction<number> {
    return new InterpolateCopyAction<number>().withInterpolateFunction(lerpi);
  }

  static CreateInterpolate(type: PropertyType): InterpolateAction<any> | null {
    // TODO: check why we need PropertyType.Size here???
    if (type === PropertyType.Vector2 || type === PropertyType.Size) {
      return new InterpolateInplaceAction<Vector2>((v) => v.clone()).withInterpolateFunction(
        Vector2.lerpInplace
      );
    } else if (type === PropertyType.Int || type === PropertyType.Double) {
      return new InterpolateCopyAction<number>().withInterpolateFunction(lerp);
    } else if (type === PropertyType.Color4 || type === PropertyType.Color4i) {
      return new InterpolateInplaceAction<Color4>((v) => v.clone()).withInterpolateFunction(
        Color4.LerpInplace
      );
    }

    return null;
  }

  static CreateDiscrete(type: PropertyType): DiscreteAction<any> | null {
    if (type === PropertyType.Vector2) {
      return new DiscreteAction<Vector2>();
    }

    if (type === PropertyType.Int || type === PropertyType.Double) {
      return new DiscreteAction<number>();
    }

    if (type === PropertyType.Color4 || type === PropertyType.Color4i) {
      return new DiscreteAction<Color4>();
    }

    if (type === PropertyType.Bool) {
      return new DiscreteAction<boolean>();
    }

    if (type === PropertyType.Size) {
      return new DiscreteAction<Size>();
    }

    if (type === PropertyType.String) {
      return new DiscreteAction<string>();
    }

    if (type === PropertyType.HorizontalAlignment) {
      return new DiscreteAction<HorizontalAlignment>();
    }

    if (type === PropertyType.VerticalAlignment) {
      return new DiscreteAction<VerticalAlignment>();
    }

    if (type === PropertyType.DimensionSourceScale) {
      return new DiscreteAction<DimensionSourceScale>();
    }

    if (type === PropertyType.DimensionSource) {
      return new DiscreteAction<DimensionSource>();
    }

    if (type === PropertyType.Rect) {
      return new DiscreteAction<Rect>();
    }

    return null;
  }
}
