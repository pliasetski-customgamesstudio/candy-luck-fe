import { BuildContext } from './104_BuildContext';
import { Rect } from './112_Rect';
import { TtfFontResource } from './120_TtfFontResource';
import { SpriteResource } from './121_SpriteResource';
import { StateLink } from './143_StateLink';
import { TextureResource } from './174_TextureResource';
import { CheckBox } from './221_CheckBox';
import { VideoSceneObject } from './222_VideoSceneObject';
import { ScreenAlignmentObject } from './226_ScreenAlignmentObject';
import { TextureSceneObject } from './232_TextureSceneObject';
import { EmotionParticlesSceneObject } from './234_EmotionParticlesSceneObject';
import { StateMachineBuilder } from './239_StateMachineBuilder';
import { IResourceCache } from './23_IResourceCache';
import { TileSceneObject } from './256_TileSceneObject';
import { NinePatchSceneObject } from './257_NinePatchSceneObject';
import { SceneObjectFactory } from './262_SceneObjectFactory';
import { TtfTextSceneObject } from './265_TtfTextSceneObject';
import { BitmapTextSceneObject } from './266_BitmapTextSceneObject';
import { RenderTargetSceneObject } from './267_RenderTargetSceneObject';
import { RuleBuilder } from './272_RuleBuilder';
import { ProgressBar } from './276_ProgressBar';
import { ActionBuilder } from './284_ActionBuilder';
import { TtfTextInputSceneObject } from './286_TtfTextInputSceneObject';
import { SceneObject } from './288_SceneObject';
import { SceneObjectMirror } from './289_SceneObjectMirror';
import { IntervalAction } from './50_IntervalAction';
import { OutputLink } from './58_OutputLink';
import { GlowSceneObject } from './72_GlowSceneObject';
import { Log } from './81_Log';
import { Action } from './84_Action';
import { SceneDescription } from './91_SceneDescription';
import { AudioResource } from './97_AudioResource';
import { BlendResource } from './154_BlendResource';
import { parseValue } from './globalFunctions';
import { Effect } from './89_Effect';
import { BuildedNode } from './138_BuildedNode';
import { Mask } from './211_Mask';
import { SpriteSceneObject } from './220_SpriteSceneObject';
import { SoundSceneObject } from './169_SoundSceneObject';
import { BitmapFontResource } from './126_BitmapFontResource';
import { VideoResource } from './92_VideoResource';
import { Button } from './260_Button';
import { SceneObjectType } from './SceneObjectType';

export const T_SceneBuilder = Symbol('SceneBuilder');
export class SceneBuilder {
  private readonly _sceneObjectFactory: SceneObjectFactory;
  private readonly _coordinateSystem: Rect;

  constructor(sceneObjectFactory: SceneObjectFactory, coordinateSystem: Rect) {
    this._sceneObjectFactory = sceneObjectFactory;
    this._coordinateSystem = coordinateSystem;
  }

  build(resourceCache: IResourceCache, sceneResource: SceneDescription): SceneObject | null {
    const nodesDesc = sceneResource.nodes;
    const actionsDesc = sceneResource.actions;
    const states = sceneResource.states;
    const context = new BuildContext();

    const result = this._buildSceneObject(
      context,
      resourceCache,
      nodesDesc,
      nodesDesc[nodesDesc.length - 1]
    );

    for (let i = 0; i < context.links.length; ++i) {
      const link = context.links[i];
      for (let j = 0; j < link.outputs.length; ++j) {
        const output = link.outputs[j];
        const textureSceneObject = context.objects[output].object as TextureSceneObject;
        textureSceneObject.source = link.source;
      }
    }

    const stateMachines: StateLink[] = [];
    for (let i = 0; i < context.objects.length; ++i) {
      const object = context.objects[i];
      const nodeActions = object.description['actions'] as number[];
      if (!object.actions && nodeActions) {
        object.actions = new Array<Action>(nodeActions.length);
        for (let j = 0; j < nodeActions.length; ++j) {
          object.actions[j] = ActionBuilder.BuildAction(
            context.objects,
            object,
            actionsDesc,
            actionsDesc[nodeActions[j]]
          );
        }
        const namedActions = object.description['namedActions'];
        if (namedActions) {
          const animations: Record<string, IntervalAction> = {};
          Object.keys(namedActions).forEach((k: string) => {
            const v = namedActions[k];
            animations[k] = object.actions![v] as IntervalAction;
          });
          object.object.animations = animations;
        }
      }
      const stateMachineIndex = object.description['stateMachine'];
      if (stateMachineIndex) {
        const desc = states[stateMachineIndex];
        const stateMachine = StateMachineBuilder.Build(
          object.object,
          object.actions!,
          states,
          desc
        );
        object.object.stateMachine = stateMachine;
        stateMachines.push(new StateLink(stateMachine, desc, object.actions!));
      }
    }

    const ruleBuilder = new RuleBuilder(
      sceneResource.signals,
      sceneResource.rules,
      sceneResource.transitions,
      context.objects
    );

    for (let i = 0; i < stateMachines.length; ++i) {
      const l = stateMachines[i];
      StateMachineBuilder.BuildTransitions(l.state, states, l.description, l.actions, ruleBuilder);
    }

    return result;
  }

  private _buildSceneObject(
    context: BuildContext,
    resourceCache: IResourceCache,
    nodes: Record<string, any>[],
    description: Record<string, any>
  ): SceneObject | null {
    const type = description['type'];
    const properties = description['properties'];
    let result: SceneObject | null = null;

    switch (type) {
      case SceneObjectType.Sprite:
        result = this._buildSpriteSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Culling:
      case SceneObjectType.Node:
        result = new SceneObject();
        break;
      case SceneObjectType.RenderTarget:
        const renderTarget = this._buildRenderTargetSceneObject(resourceCache, properties);
        const outputs = description['outputs'] as number[];
        context.links.push(new OutputLink(renderTarget, outputs));
        result = renderTarget;
        break;
      case SceneObjectType.ScreenAlignment:
        result = new ScreenAlignmentObject(this._coordinateSystem);
        break;
      case SceneObjectType.Glow:
        result = this._buildGlowSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Mask:
        result = this._buildMaskSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Button:
        result = this._buildButton(resourceCache, properties);
        break;
      case SceneObjectType.Text:
        result = this._buildBitmapTextSceneObject(resourceCache, properties, false);
        break;
      case SceneObjectType.MultilineText:
        result = this._buildBitmapTextSceneObject(resourceCache, properties, true);
        break;
      case SceneObjectType.TtfTextEdit:
      case SceneObjectType.TextEdit:
        result = this._buildTtfTextInputSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Ttf:
        result = this._buildTtfTextSceneObject(resourceCache, properties, false);
        break;
      case SceneObjectType.MultilineTtf:
        result = this._buildTtfTextSceneObject(resourceCache, properties, true);
        break;
      case SceneObjectType.Sound:
        result = this._buildSoundSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Stream:
        result = this._buildStreamedSoundSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.NinePatch:
        result = this._buildNinePatchSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Tile:
        result = this._buildTileSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Particles2:
        result = this._buildEmotionParticlesSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.ProgressBar:
        result = this._buildProgressBarSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Checkbox:
        result = this._buildCheckBoxSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.VideoSprite:
        result = this._buildVideoSceneObject(resourceCache, properties);
        break;
      case SceneObjectType.Texture:
        result = this._buildTextureSceneObject(resourceCache, properties);
        break;
    }

    if (!result) {
      Log.Error(`SceneBuilder unknown object type: ${type}. Ignoring.`);
      return null;
    }

    const childs = description['children'] as number[];

    if (childs) {
      this._buildChilds(context, resourceCache, result, nodes, childs);
    }

    if (properties) {
      this._applyProperties(result, type, properties);
    }

    const blend = description['blend'];
    if (blend) {
      this._buildBlend(resourceCache, result, blend);
    }

    const effect = description['effect'];
    if (effect) {
      result.effect = this._buildEffect(effect as string[]);
    }

    context.objects.push(new BuildedNode(result, description, type));

    return result;
  }

  private _buildEffect(effects: string[]): Effect {
    let result = 0;
    for (let i = 0; i < effects.length; ++i) {
      const type = effects[i];
      switch (type) {
        case 'Mask':
          result |= Effect.Mask1;
          break;
        case 'Contrast':
        case 'Brightness':
        case 'Hue':
        case 'Saturation':
          result |= Effect.ColorAdjust;
          break;
        case 'ColorModulation':
          result |= Effect.Color;
          break;
        case 'ColorOffset':
          result |= Effect.ColorOffset;
          break;
        default:
          Log.Warning(`SceneBuilder: unknown effect ${type}`);
      }
    }

    return result;
  }

  private _buildEmotionParticlesSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): EmotionParticlesSceneObject {
    const resource = properties['SpriteName'];
    const spriteResource = resourceCache.getResource<SpriteResource>(
      SpriteResource.TypeId,
      resource
    );
    if (!spriteResource) {
      Log.Error(
        `[SceneBuilder][EmotionParticlesSceneObject] can't resolve sprite resource ${resource}`
      );
    }
    return new EmotionParticlesSceneObject(spriteResource!);
  }

  private _buildProgressBarSceneObject(
    _resourceCache: IResourceCache,
    _properties: Record<string, any>
  ): ProgressBar {
    return new ProgressBar();
  }

  private _buildCheckBoxSceneObject(
    _resourceCache: IResourceCache,
    _properties: Record<string, any>
  ): CheckBox {
    return new CheckBox();
  }

  private _buildVideoSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): VideoSceneObject | null {
    const videoName = properties['VideoName'];
    const videoResource = resourceCache.getResource<VideoResource>(VideoResource.TypeId, videoName);
    if (!videoResource?.data) {
      Log.Warning(`Trying to create Video object with not initialized data: ${videoName}`);
      return null;
    }
    return new VideoSceneObject(videoResource);
  }

  private _buildTextureSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): SceneObject {
    const result = new TextureSceneObject();
    if (properties) {
      const textureName = properties['TextureName'];
      if (textureName) {
        const textureResource = resourceCache.getResource(
          TextureResource.TypeId,
          textureName
        ) as TextureResource;
        result.source = textureResource;
      }
    }
    return result;
  }

  private _buildMaskSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): SceneObject {
    const result = new SceneObject();
    const textureName = properties['TextureName'];
    const textureResource = resourceCache.getResource<TextureResource>(
      TextureResource.TypeId,
      textureName
    );
    result.mask = new Mask(textureResource!);
    return result;
  }

  private _buildGlowSceneObject(
    _resourceCache: IResourceCache,
    _properties: Record<string, any>
  ): SceneObject {
    return new GlowSceneObject();
  }

  private _buildRenderTargetSceneObject(
    _resourceCache: IResourceCache,
    _properties: Record<string, any>
  ): RenderTargetSceneObject {
    return this._sceneObjectFactory.createRenderTargetSceneObject();
  }

  private _buildButton(_resourceCache: IResourceCache, _properties: Record<string, any>): Button {
    return new Button();
  }

  private _buildNinePatchSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): NinePatchSceneObject {
    const resource = properties['SpriteName'];
    const spriteResource = resourceCache.getResource<SpriteResource>(
      SpriteResource.TypeId,
      resource
    );
    if (!spriteResource) {
      Log.Error(`[SceneBuilder] can't resolve sprite resource ${resource}`);
    }
    return new NinePatchSceneObject(spriteResource!);
  }

  private _buildTileSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): TileSceneObject {
    const resource = properties['SpriteName'];
    const spriteResource = resourceCache.getResource<SpriteResource>(
      SpriteResource.TypeId,
      resource
    );
    if (!spriteResource) {
      Log.Error(`[SceneBuilder] can't resolve sprite resource ${resource}`);
    }
    return new TileSceneObject(spriteResource!);
  }

  private _buildBitmapTextSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>,
    isMulti: boolean
  ): BitmapTextSceneObject {
    const resource = properties['FontName'];
    const fontResource = resourceCache.getResource<BitmapFontResource>(
      BitmapFontResource.TypeId,
      resource
    );
    const bitmapTextSceneObject = new BitmapTextSceneObject(fontResource!);
    bitmapTextSceneObject.multiLineText = isMulti;
    return bitmapTextSceneObject;
  }

  private _buildSoundSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): SceneObject {
    const resource = properties['SoundName'];
    const res = resourceCache.getResource<AudioResource>(AudioResource.TypeId, resource);
    if (!res) {
      Log.Error(`audio buffer is null: ${resource.toString()}`);
      const fakeResource = new AudioResource(resource);
      return this._sceneObjectFactory.createSoundSceneObject(fakeResource);
    }
    return this._sceneObjectFactory.createSoundSceneObject(res);
  }

  private _buildStreamedSoundSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): SoundSceneObject {
    const resource = properties['SoundName'];
    const res = resourceCache.getResource<AudioResource>(AudioResource.TypeId, resource);
    if (!res) {
      Log.Error(`audio buffer is null: ${resource.toString()}`);
      const fakeResource = new AudioResource(resource);
      return this._sceneObjectFactory.createSoundSceneObject(fakeResource);
    }
    return this._sceneObjectFactory.createSoundSceneObject(res);
  }

  private _buildTtfTextSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>,
    isMulti: boolean
  ): TtfTextSceneObject {
    const resource = properties['FontName'];
    const fontResource = resourceCache.getResource<TtfFontResource>(
      TtfFontResource.TypeId,
      resource
    );
    const result = this._sceneObjectFactory.createTtfTextSceneObject(fontResource!);
    result.multiLineText = isMulti;
    return result;
  }

  private _buildTtfTextInputSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): TtfTextInputSceneObject {
    const resource = properties['FontName'];
    const fontResource = resourceCache.getResource<TtfFontResource>(
      TtfFontResource.TypeId,
      resource
    );
    return this._sceneObjectFactory.createTtfTextInputSceneObject(fontResource!);
  }

  private _buildSpriteSceneObject(
    resourceCache: IResourceCache,
    properties: Record<string, any>
  ): SceneObject {
    const resource = properties['SpriteName'];
    const spriteResource = resourceCache.getResource<SpriteResource>(
      SpriteResource.TypeId,
      resource
    );
    if (!spriteResource) {
      Log.Error(`[SceneBuilder] can't resolve sprite resource ${resource}`);
    }
    return new SpriteSceneObject(spriteResource!);
  }

  private _buildChilds(
    context: BuildContext,
    resourceCache: IResourceCache,
    sceneObject: SceneObject,
    nodes: Record<string, any>[],
    childs: number[]
  ): void {
    for (let i = 0; i < childs.length; ++i) {
      const child = this._buildSceneObject(context, resourceCache, nodes, nodes[childs[i]]);
      sceneObject.addChild(child!);
    }
  }

  private _buildBlend(
    resourceCache: IResourceCache,
    sceneObject: SceneObject,
    description: Record<string, any>
  ): void {
    let enabled = description['enabled'];
    if (enabled === undefined) enabled = true;
    let source = description['sourceFactor'];
    let dest = description['destinationFactor'];
    if (!source) source = 'One';
    if (!dest) dest = 'One';
    const resource = enabled ? `${source}_${dest}` : 'disabled';
    const b = resourceCache.getResource<BlendResource>(BlendResource.TypeId, resource);
    if (!b) {
      Log.Trace(`[SceneBuilder] can't get blend resource: ${resource}`);
    }
    sceneObject.blend = b!;
  }

  private _applyProperties(
    sceneObject: SceneObject,
    type: SceneObjectType,
    params: Record<string, any>
  ): void {
    Object.entries(params).forEach(([k, v]) => {
      const info = SceneObjectMirror.GetPropertyInfo(type, k);
      if (info) {
        const value = parseValue(info.parseType, v, info.defaultValue);
        info.set(sceneObject, value);
      } else {
        Log.Warning(`SceneBuilder unknown property ${k} in [${sceneObject}]. Ignoring.`);
      }
    });
  }
}
