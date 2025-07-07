import { PropertyInfo, PropertyType } from './14_PropertyInfo';
import { SceneObject } from './288_SceneObject';
import { EmotionParticlesSceneObject } from './234_EmotionParticlesSceneObject';
import { ProgressBar } from './276_ProgressBar';
import { Vector2 } from './15_Vector2';
import { MethodInfo } from './2_MethodInfo';
import { GlowSceneObject } from './72_GlowSceneObject';
import { BitmapTextSceneObject } from './266_BitmapTextSceneObject';
import { TextSceneObject } from './225_TextSceneObject';
import { VerticalAlignment } from './66_VerticalAlignment';
import { DimensionSourceScale } from './38_DimensionSourceScale';
import { TextFormattingMode } from './51_TextFormattingMode';
import { Rect } from './112_Rect';
import { CheckBox } from './221_CheckBox';
import { ButtonState } from './27_ButtonState';
import { ButtonBase } from './271_ButtonBase';
import { Color4 } from './10_Color4';
import { ImageAdjust } from './55_ImageAdjust';
import { HorizontalAlignment } from './73_HorizontalAlignment';
import { DimensionSource } from './131_DimensionSource';
import { SoundSceneObject } from './169_SoundSceneObject';
import { EmotionParticleSystemParams } from './122_EmotionParticleSystemParams';
import { VideoSceneObject } from './222_VideoSceneObject';
import { RenderTargetSceneObject } from './267_RenderTargetSceneObject';
import { TextureSceneObject } from './232_TextureSceneObject';
import { TtfTextSceneObject } from './265_TtfTextSceneObject';
import { ScreenAlignmentObject } from './226_ScreenAlignmentObject';
import { TtfTextInputSceneObject } from './286_TtfTextInputSceneObject';
import { CgsEvent } from './12_Event';
import { SceneObjectType } from './SceneObjectType';

export class SceneObjectMirror {
  private static _propertyMap: Record<string, PropertyInfo<any, any>>;
  public static _propertyMapByType: Record<string, Record<string, PropertyInfo<any, any>>>;
  private static _methodMap: Record<string, MethodInfo<any>>;

  static GetPropertyInfo(
    type: SceneObjectType,
    propertyName: string
  ): PropertyInfo<any, any> | null {
    if (!SceneObjectMirror._propertyMap) {
      SceneObjectMirror._InitPropertyMap();
      SceneObjectMirror._InitPropertyMapByType();
    }
    const properties = SceneObjectMirror._propertyMapByType[type];
    if (properties) {
      const property = properties[propertyName];
      if (property) {
        return property;
      }
    }
    return SceneObjectMirror._propertyMap[propertyName] ?? null;
  }

  static GetMethodInfo(methodName: string): MethodInfo<any> | null {
    if (!SceneObjectMirror._methodMap) {
      SceneObjectMirror._InitMethodMap();
    }
    return SceneObjectMirror._methodMap[methodName] ?? null;
  }

  private static _InitPropertyMap(): void {
    SceneObjectMirror._propertyMap = {};
    SceneObjectMirror._propertyMap['Id'] = new PropertyInfo<SceneObject, string>(
      (o, v) => (o.id = v),
      '',
      PropertyType.String
    );
    SceneObjectMirror._propertyMap['Position'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.position = v),
      Vector2.Zero,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['Origin'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.pivot = v),
      Vector2.Zero,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['Scale'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.scale = v),
      Vector2.One,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['Skew'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.skew = v),
      Vector2.Zero,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['DrawOrder'] = new PropertyInfo<SceneObject, number>(
      (o, v) => (o.z = v),
      0,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMap['BlockEvents'] = new PropertyInfo<SceneObject, boolean>(
      (o, v) => (o.blockEvents = v),
      false,
      PropertyType.Bool
    );
    SceneObjectMirror._propertyMap['Touchable'] = new PropertyInfo<SceneObject, boolean>(
      (o, v) => (o.touchable = v),
      false,
      PropertyType.Bool
    );
    SceneObjectMirror._propertyMap['TouchArea'] = new PropertyInfo<SceneObject, Rect>(
      (o, v) => (o.touchArea = v),
      Rect.Empty,
      PropertyType.Rect
    );
    SceneObjectMirror._propertyMap['TimeScale'] = new PropertyInfo<SceneObject, number>(
      (o, v) => (o.timeScale = v),
      1.0,
      PropertyType.Double
    );

    SceneObjectMirror._propertyMap['Bounds'] = new PropertyInfo<SceneObject, Rect>(
      (o, v) => (o.bounds = v),
      Rect.Empty,
      PropertyType.Rect
    );

    SceneObjectMirror._propertyMap['Size'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.size = v),
      Vector2.Zero,
      PropertyType.Vector2,
      PropertyType.Size
    );

    SceneObjectMirror._propertyMap['Hidden'] = new PropertyInfo<SceneObject, boolean>(
      (o, v) => {
        o.active = !v;
        o.visible = !v;
      },
      false,
      PropertyType.Bool
    );

    // Button
    SceneObjectMirror._propertyMap['Down'] = new PropertyInfo<ButtonBase, boolean>(
      (o, v) => {
        if (o instanceof CheckBox) {
          o.checked = v;
        } else {
          o.state = v ? ButtonState.Down : ButtonState.Normal;
        }
      },
      false,
      PropertyType.Bool
    );

    SceneObjectMirror._propertyMap['Color'] = new PropertyInfo<SceneObject, Color4>(
      (o, v) => (o.color = v),
      Color4.White,
      PropertyType.Color4,
      PropertyType.Color4i
    );
    SceneObjectMirror._propertyMap['Saturation'] = new PropertyInfo<SceneObject, number>(
      (o, v) => (o.imageAdjust.saturation = v),
      ImageAdjust.Default.saturation,
      PropertyType.Double
    );
    SceneObjectMirror._propertyMap['Contrast'] = new PropertyInfo<SceneObject, number>(
      (o, v) => (o.imageAdjust.contrast = v),
      ImageAdjust.Default.contrast,
      PropertyType.Double
    );
    SceneObjectMirror._propertyMap['Brightness'] = new PropertyInfo<SceneObject, number>(
      (o, v) => (o.imageAdjust.brightness = v),
      ImageAdjust.Default.brightness,
      PropertyType.Double
    );
    SceneObjectMirror._propertyMap['Hue'] = new PropertyInfo<SceneObject, number>(
      (o, v) => (o.imageAdjust.hue = v),
      ImageAdjust.Default.hue,
      PropertyType.Double
    );

    SceneObjectMirror._propertyMap['ColorOffset'] = new PropertyInfo<SceneObject, Color4>(
      (o, v) => (o.imageAdjust.colorOffset = v),
      ImageAdjust.Default.colorOffset,
      PropertyType.Color4
    );

    // MaskSceneObject
    SceneObjectMirror._propertyMap['TextureName'] = new PropertyInfo<SceneObject, string>(
      () => {},
      '',
      PropertyType.String
    );
    SceneObjectMirror._propertyMap['MaskSourceFrame'] = new PropertyInfo<SceneObject, Rect>(
      (o, v) => (o.mask.sourceFrame = v),
      Rect.Empty,
      PropertyType.Rect
    );

    SceneObjectMirror._propertyMap['MaskScale'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.mask.scale = v),
      Vector2.One,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['MaskPosition'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.mask.position = v),
      Vector2.Zero,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['MaskOrigin'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.mask.pivot = v),
      Vector2.Zero,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['MaskSize'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.mask.size = v),
      Vector2.Zero,
      PropertyType.Vector2,
      PropertyType.Size
    );
    SceneObjectMirror._propertyMap['MaskSkew'] = new PropertyInfo<SceneObject, Vector2>(
      (o, v) => (o.mask.skew = v),
      Vector2.Zero,
      PropertyType.Vector2
    );

    // SpriteSceneObject && VideoSceneObject
    SceneObjectMirror._propertyMap['Frame'] = new PropertyInfo<any, number>(
      (o, v) => (o.frame = v),
      0,
      PropertyType.Int
    );

    // TextSceneObject
    SceneObjectMirror._propertyMap['FontName'] = new PropertyInfo<TextSceneObject, string>(
      () => {},
      '',
      PropertyType.String
    );
    SceneObjectMirror._propertyMap['Text'] = new PropertyInfo<TextSceneObject, string>(
      (o, v) => (o.text = v),
      '',
      PropertyType.String
    );
    SceneObjectMirror._propertyMap['Format'] = new PropertyInfo<TextSceneObject, string>(
      (o, v) => (o.format = v),
      '',
      PropertyType.String
    );
    SceneObjectMirror._propertyMap['HAlignment'] = new PropertyInfo<
      TextSceneObject,
      HorizontalAlignment
    >((o, v) => (o.halign = v), HorizontalAlignment.Left, PropertyType.HorizontalAlignment);
    SceneObjectMirror._propertyMap['VAlignment'] = new PropertyInfo<
      TextSceneObject,
      VerticalAlignment
    >((o, v) => (o.valign = v), VerticalAlignment.Top, PropertyType.VerticalAlignment);
    SceneObjectMirror._propertyMap['FontSize'] = new PropertyInfo<TextSceneObject, number>(
      (o, v) => (o.fontSize = v),
      14,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMap['LineSpacing'] = new PropertyInfo<TextSceneObject, number>(
      (o, v) => (o.lineSpacing = v),
      0,
      PropertyType.Int
    );

    // BitmapTextSceneObject
    SceneObjectMirror._propertyMap['DimensionSource'] = new PropertyInfo<
      TextSceneObject,
      DimensionSource
    >(
      (o, v) => (o.textRenderParams.dimensionSource = v),
      DimensionSource.Frame,
      PropertyType.DimensionSource
    );
    SceneObjectMirror._propertyMap['DimensionSourceScale'] = new PropertyInfo<
      TextSceneObject,
      DimensionSourceScale
    >(
      (o, v) => (o.textRenderParams.dimensionSourceScale = v),
      DimensionSourceScale.Both,
      PropertyType.DimensionSourceScale
    );
    SceneObjectMirror._propertyMap['Spacing'] = new PropertyInfo<BitmapTextSceneObject, number>(
      (o, v) => (o.textRenderParams.letterSpacing = v),
      0,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMap['TextFormattingMode'] = new PropertyInfo<
      TextSceneObject,
      TextFormattingMode
    >(
      (o, v) => (o.textFormattingMode = v),
      TextFormattingMode.Default,
      PropertyType.TextFormattingMode
    );

    // SoundSceneObject
    SceneObjectMirror._propertyMap['SoundName'] = new PropertyInfo<SceneObject, string>(
      () => {},
      '',
      PropertyType.String
    );

    // SoundObject
    SceneObjectMirror._propertyMap['Volume'] = new PropertyInfo<SoundSceneObject, number>(
      (o, v) => (o.volume = v),
      1.0,
      PropertyType.Double
    );
    SceneObjectMirror._propertyMap['Loop'] = new PropertyInfo<any, boolean>(
      (o, v) => (o.loop = v),
      false,
      PropertyType.Bool
    );

    SceneObjectMirror._propertyMap['SpriteName'] = new PropertyInfo<SceneObject, string>(
      () => {},
      '',
      PropertyType.String
    );

    // TileSceneObject && TextureSceneObject
    SceneObjectMirror._propertyMap['Offset'] = new PropertyInfo<any, Vector2>(
      (o, v) => (o.offset = v),
      Vector2.Zero,
      PropertyType.Vector2
    );
    SceneObjectMirror._propertyMap['SourceDimension'] = new PropertyInfo<
      TextureSceneObject,
      Vector2
    >((o, v) => (o.dimensionSource = v), Vector2.Zero, PropertyType.Vector2, PropertyType.Size);

    // ProgressBar
    SceneObjectMirror._propertyMap['ActionId'] = new PropertyInfo<ProgressBar, string>(
      (o, v) => (o.actionId = v),
      '',
      PropertyType.String
    );

    // VideoSceneObject
    SceneObjectMirror._propertyMap['VideoName'] = new PropertyInfo<VideoSceneObject, string>(
      () => {},
      '',
      PropertyType.String
    );

    // RenderTargetSceneObject
    SceneObjectMirror._propertyMap['Width'] = new PropertyInfo<RenderTargetSceneObject, number>(
      (o, v) => (o.width = v),
      0,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMap['Height'] = new PropertyInfo<RenderTargetSceneObject, number>(
      (o, v) => (o.height = v),
      0,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMap['CoordinateSystem'] = new PropertyInfo<
      RenderTargetSceneObject,
      Rect
    >((o, v) => (o.coordinateSystem = v), Rect.Empty, PropertyType.Rect);

    SceneObjectMirror._propertyMap['Active'] = new PropertyInfo<SceneObject, boolean>(
      (o, v) => (o.active = v),
      false,
      PropertyType.Bool
    );
    SceneObjectMirror._propertyMap['Visible'] = new PropertyInfo<SceneObject, boolean>(
      (o, v) => (o.visible = v),
      false,
      PropertyType.Bool
    );
  }

  private static _InitPropertyMapByType(): void {
    SceneObjectMirror._propertyMapByType = {};
    const emotion: Record<string, PropertyInfo<any, any>> = {};

    emotion['ParticlesFlags'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      () => {},
      0,
      PropertyType.Int
    );

    emotion['Duration'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.duration = v),
      EmotionParticleSystemParams.Default.duration,
      PropertyType.Double
    );

    emotion['MaxCount'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.maxCount = v),
      EmotionParticleSystemParams.Default.maxCount,
      PropertyType.Int
    );

    emotion['EmitterPosition'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.emitterPosition = v),
      EmotionParticleSystemParams.Default.emitterPosition,
      PropertyType.Vector2
    );

    emotion['PosVariance'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.positionVariance = v),
      EmotionParticleSystemParams.Default.positionVariance,
      PropertyType.Vector2
    );

    emotion['EmitAngle'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.angle = v),
      EmotionParticleSystemParams.Default.angle,
      PropertyType.Double
    );
    emotion['AngleVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.angleVariance = v),
      EmotionParticleSystemParams.Default.angleVariance,
      PropertyType.Double
    );

    emotion['LifeTime'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.lifeTime = v),
      EmotionParticleSystemParams.Default.lifeTime,
      PropertyType.Double
    );
    emotion['LifeTimeVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.lifeTimeVariance = v),
      EmotionParticleSystemParams.Default.lifeTimeVariance,
      PropertyType.Double
    );

    emotion['EmissionRate'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.emissionRate = v),
      EmotionParticleSystemParams.Default.emissionRate,
      PropertyType.Double
    );

    emotion['Gravity'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.gravity = v),
      EmotionParticleSystemParams.Default.gravity,
      PropertyType.Vector2
    );

    emotion['StartRotate'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.startRotate = v),
      EmotionParticleSystemParams.Default.startRotate,
      PropertyType.Double
    );
    emotion['StartRotateVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.startRotateVariance = v),
      EmotionParticleSystemParams.Default.startRotateVariance,
      PropertyType.Double
    );

    emotion['EndRotate'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.endRotate = v),
      EmotionParticleSystemParams.Default.endRotate,
      PropertyType.Double
    );
    emotion['EndRotateVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.endRotateVariance = v),
      EmotionParticleSystemParams.Default.endRotateVariance,
      PropertyType.Double
    );

    emotion['Speed'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.speed = v),
      EmotionParticleSystemParams.Default.speed,
      PropertyType.Double
    );
    emotion['SpeedVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.speedVariance = v),
      EmotionParticleSystemParams.Default.speedVariance,
      PropertyType.Double
    );

    emotion['TangentialAccel'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.tangentialAccel = v),
      EmotionParticleSystemParams.Default.tangentialAccel,
      PropertyType.Double
    );
    emotion['TangentialAccelVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.tangentialAccelVariance = v),
      EmotionParticleSystemParams.Default.tangentialAccelVariance,
      PropertyType.Double
    );

    emotion['RadialAccel'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.radialAccel = v),
      EmotionParticleSystemParams.Default.radialAccel,
      PropertyType.Double
    );
    emotion['RadialAccelVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.radialAccelVariance = v),
      EmotionParticleSystemParams.Default.radialAccelVariance,
      PropertyType.Double
    );

    emotion['StartSize'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.startSize = v),
      EmotionParticleSystemParams.Default.startSize,
      PropertyType.Vector2
    );
    emotion['StartSizeVariance'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.startSizeVariance = v),
      EmotionParticleSystemParams.Default.startSizeVariance,
      PropertyType.Vector2
    );

    emotion['EndSize'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.endSize = v),
      EmotionParticleSystemParams.Default.endSize,
      PropertyType.Vector2
    );
    emotion['EndSizeVariance'] = new PropertyInfo<EmotionParticlesSceneObject, Vector2>(
      (o, v) => (o.particleSystemParams.endSizeVariance = v),
      EmotionParticleSystemParams.Default.endSizeVariance,
      PropertyType.Vector2
    );

    emotion['StartColor'] = new PropertyInfo<EmotionParticlesSceneObject, Color4>(
      (o, v) => (o.particleSystemParams.startColor = v),
      EmotionParticleSystemParams.Default.startColor,
      PropertyType.Color4
    );
    emotion['StartColorVariance'] = new PropertyInfo<EmotionParticlesSceneObject, Color4>(
      (o, v) => (o.particleSystemParams.startColorVariance = v),
      EmotionParticleSystemParams.Default.startColorVariance,
      PropertyType.Color4
    );

    emotion['EndColor'] = new PropertyInfo<EmotionParticlesSceneObject, Color4>(
      (o, v) => (o.particleSystemParams.endColor = v),
      EmotionParticleSystemParams.Default.endColor,
      PropertyType.Color4
    );
    emotion['EndColorVariance'] = new PropertyInfo<EmotionParticlesSceneObject, Color4>(
      (o, v) => (o.particleSystemParams.endColorVariance = v),
      EmotionParticleSystemParams.Default.endColorVariance,
      PropertyType.Color4
    );

    emotion['StartFrame'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.startFrame = v),
      EmotionParticleSystemParams.Default.startFrame,
      PropertyType.Double
    );
    emotion['StartFrameVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.startFrameVariance = v),
      EmotionParticleSystemParams.Default.startFrameVariance,
      PropertyType.Double
    );

    emotion['FrameSpeed'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.frameSpeed = v),
      EmotionParticleSystemParams.Default.frameSpeed,
      PropertyType.Double
    );
    emotion['FrameSpeedVariance'] = new PropertyInfo<EmotionParticlesSceneObject, number>(
      (o, v) => (o.particleSystemParams.frameSpeedVariance = v),
      EmotionParticleSystemParams.Default.frameSpeedVariance,
      PropertyType.Double
    );

    SceneObjectMirror._propertyMapByType[SceneObjectType.Particles2] = emotion;

    const glow: Record<string, PropertyInfo<GlowSceneObject, any>> = {};
    glow['DimensionSource'] = new PropertyInfo<GlowSceneObject, DimensionSource>(
      () => {},
      DimensionSource.Frame,
      PropertyType.DimensionSource
    );
    glow['CoordinateSystem'] = new PropertyInfo<GlowSceneObject, Rect>(
      () => {},
      Rect.Empty,
      PropertyType.Rect
    );
    glow['GlowStrength'] = new PropertyInfo<GlowSceneObject, number>(
      () => {},
      0.0,
      PropertyType.Double
    );
    glow['GlowColor'] = new PropertyInfo<GlowSceneObject, Color4>(
      () => {},
      Color4.White,
      PropertyType.Color4
    );
    glow['BlurWidth'] = new PropertyInfo<GlowSceneObject, number>(
      () => {},
      0.0,
      PropertyType.Double
    );
    glow['BlurHeight'] = new PropertyInfo<GlowSceneObject, number>(
      () => {},
      0.0,
      PropertyType.Double
    );
    SceneObjectMirror._propertyMapByType[SceneObjectType.Glow] = glow;

    const alignment: Record<string, PropertyInfo<ScreenAlignmentObject, any>> = {};
    alignment['HAlignment'] = new PropertyInfo<ScreenAlignmentObject, HorizontalAlignment>(
      (o, v) => (o.halign = v),
      HorizontalAlignment.None,
      PropertyType.HorizontalAlignment
    );
    alignment['VAlignment'] = new PropertyInfo<ScreenAlignmentObject, VerticalAlignment>(
      (o, v) => (o.valign = v),
      VerticalAlignment.None,
      PropertyType.VerticalAlignment
    );
    SceneObjectMirror._propertyMapByType[SceneObjectType.ScreenAlignment] = alignment;

    const ttfLineSpacing: Record<string, PropertyInfo<TtfTextSceneObject, any>> = {};
    ttfLineSpacing['Spacing'] = new PropertyInfo<TtfTextSceneObject, number>(
      (o, v) => (o.textRenderParams.letterSpacing = v),
      0,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMapByType[SceneObjectType.Ttf] = ttfLineSpacing;

    const ttfInputLineSpacing: Record<string, PropertyInfo<TtfTextInputSceneObject, any>> = {};
    ttfInputLineSpacing['Spacing'] = new PropertyInfo<TtfTextInputSceneObject, number>(
      (o, v) => (o.textRenderParams.letterSpacing = v),
      0,
      PropertyType.Int
    );
    SceneObjectMirror._propertyMapByType[SceneObjectType.TtfTextEdit] = ttfInputLineSpacing;
    SceneObjectMirror._propertyMapByType[SceneObjectType.TextEdit] = ttfInputLineSpacing;
  }

  private static _InitMethodMap(): void {
    SceneObjectMirror._methodMap = {};
    // SoundObject
    SceneObjectMirror._methodMap['Play'] = new MethodInfo<SoundSceneObject>((o) => o.play());
    SceneObjectMirror._methodMap['Stop'] = new MethodInfo<SoundSceneObject>((o) => o.stop());
    SceneObjectMirror._methodMap['Reset'] = new MethodInfo<any>((o) => o.reset());
    SceneObjectMirror._methodMap['SendSMEventAsync'] = new MethodInfo<SceneObject>(
      (o, p1) => new Promise(() => o.stateMachine?.dispatchEvent(p1 as CgsEvent))
    );
    SceneObjectMirror._methodMap['SendEventAsync'] = new MethodInfo<SceneObject>(
      (o, p1) => new Promise(() => o.sendEvent(p1 as CgsEvent))
    );
  }
}
