// TODO: Do we really need this?

// export type ExecuteCondition = (overlay: OverlayButton) => boolean;
//
// /**
//  * Hardcoded initial position as [-15.0, -15.0] to prevent drawing an overlay button in the region, which is available
//  * to user, before the normal initialization.<br />
//  * Behaves as static overlay button if _coordinateSystem is not specified in the constructor. <br />
//  * TODO: Should be investigated
//  */
//
// export class OverlayButton extends SceneObject {
//   private _canvas: HTMLCanvasElement;
//   private _lastCanvasWidth: number;
//   private _lastCanvasHeight: number;
//   private _coordinateSystem: Rect;
//   private _transform: Matrix3;
//   private _div: HTMLDivElement;
//   private _b: HTMLButtonElement;
//   private _condition: ExecuteCondition;
//   private _url: string;
//   private _divOnClickSubscription: StreamSubscription;
//   private _clicked: EventDispatcher<OverlayButton>;
//
//   constructor(canvas: HTMLCanvasElement, coordinateSystem?: Rect, url?: string) {
//     super();
//     this._canvas = canvas;
//     this._coordinateSystem = coordinateSystem;
//     this._url = url;
//     this._clicked = new EventDispatcher<OverlayButton>();
//   }
//
//   get div(): HTMLDivElement {
//     return this._div;
//   }
//
//   get condition(): ExecuteCondition {
//     return this._condition;
//   }
//
//   set condition(val: ExecuteCondition) {
//     this._condition = val;
//   }
//
//   get zIndex(): string {
//     return this._div.style.zIndex;
//   }
//   //
//   set zIndex(value: string) {
//     this._div.style.zIndex = value;
//   }
//
//   initializeImpl(): void {
//     const parent = this.parent;
//     const x = (!parent.touchArea ? parent.size.x : parent.touchArea.size.x);
//     const y = (!parent.touchArea ? parent.size.y : parent.touchArea.size.y);
//
//     if (this._coordinateSystem) {
//       parent.eventReceived.listen(e => this._mouseEventHandler(e));
//     }
//
//     this._div = new HTMLDivElement();
//     this._div.className = 'overlay';
//     this._div.style.display = (!this._coordinateSystem) ? ('block') : ('none');
//     this._div.style.position = 'absolute';
//     this._div.style.cursor = 'pointer';
//     if (!this._coordinateSystem) {
//       this._div.style.width = `${x}px`;
//       this._div.style.height = `${y}px`;
//     } else {
//       this._div.style.top = '-15px';
//       this._div.style.left = '-15px';
//       this._div.style.width = '15px';
//       this._div.style.height = '15px';
//     }
//
//     this._b = new HTMLButtonElement();
//     this._b.style.border = 'none';
//     this._b.style.outline = 'none';
//     this._b.style.background = 'rgba(0,0,0,0)';
//     this._b.style.cursor = 'pointer';
//     this._b.style.display = 'block';
//     if (!this._coordinateSystem) {
//       this._b.style.width = `${x}px`;
//       this._b.style.height = `${y}px`;
//     } else {
//       this._b.style.width = '15px';
//       this._b.style.height = '15px';
//     }
//
//     this._div.append(this._b);
//
//     if (this._url) {
//       this._b.onclick = (e) => {
//         if (!this._condition || this._condition(this)) {
//           window.open(this._url.toString(), '_blank');
//         }
//       };
//     }
//
//     this._divOnClickSubscription = this._b.onclick = this.fireClicked;
//
//     this._canvas.parentNode.appendChild(this._div);
//   }
//
//   private _mouseEventHandler(event: CgsEvent): void {
//     if (event instanceof MousePointerMoveEvent) {
//       const isInside = this.parent.isInPoint(event.event.location);
//       this.active = isInside;
//       if (isInside) {
//         const location = event.event.location;
//         const reversedTransformLocation = this._calculateTransformationMatrix(this._coordinateSystem.clone())
//           .transformVector(location);
//         this._div.style.top = `${reversedTransformLocation.y - 5}px`;
//         this._div.style.left = `${reversedTransformLocation.x - 5}px`;
//       }
//     }
//   }
//
//   private _calculateTransformationMatrix(coordinateSystem: Rect): Matrix3 {
//     const projection = Matrix3.undefined();
//
//     const scale = Matrix3.undefined().fromScale(
//       this._canvas.width / coordinateSystem.width,
//       this._canvas.height / coordinateSystem.height
//     );
//     const translate = Matrix3.undefined().fromTranslation(
//       -coordinateSystem.lt.x, -coordinateSystem.lt.y
//     );
//
//     Matrix3.Multiply(translate, scale, projection);
//
//     return projection;
//   }
//
//   drawImpl(spriteBatch: SpriteBatch, transform: Matrix3): void {
//     if (!this._div) {
//       return;
//     }
//
//     const canvasHeight = this._canvas.height;
//     const canvasWidth = this._canvas.width;
//
//     if (
//       !this._coordinateSystem &&
//       (
//         canvasHeight != this._lastCanvasHeight ||
//         canvasWidth != this._lastCanvasWidth ||
//         !transform.equals(this._transform)
//       )
//     ) {
//       this._lastCanvasHeight = this._canvas.height;
//       this._lastCanvasWidth = this._canvas.width;
//       this._transform = transform;
//
//       const lt = transform.transformVector(this.parent.touchArea.lt);
//       const rb = transform.transformVector(this.parent.touchArea.rb);
//
//       const projection = this._calculateTransformationMatrix(spriteBatch.getCoordinateSystem());
//
//       const plt = projection.transformVector(lt);
//       const prb = projection.transformVector(rb);
//
//       this._div.style.top = `${plt.y + this._canvas.offsetTop}px`;
//       this._div.style.left = `${plt.x}px`;
//       this._div.style.height = `${(prb.y - plt.y)}px`;
//       this._div.style.width = `${(prb.x - plt.x)}px`;
//
//       if (this._b) {
//         this._b.style.top = this._div.style.top;
//         this._b.style.left = this._div.style.left;
//         this._b.style.height = this._div.style.height;
//         this._b.style.width = this._div.style.width;
//       }
//     }
//   }
//
//   deinitializeImpl(): void {
//     this._divOnClickSubscription.cancel();
//     this._div.remove();
//   }
//
//   fireClicked(e: any): void {
//     this._clicked.dispatchEvent(this);
//   }
//
//   activeChanged(active: boolean): void {
//     if (this._div) {
//       this._div.style.display = active ? 'block' : 'none';
//     }
//     super.activeChanged(active);
//   }
// }
