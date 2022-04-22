// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

enum LAYOUT_TYPE {
    /** 不循环且叠层,只显示右边一半,以中心点最大向左右两边依次缩小(骁之翼) */
    NOLOOP,
    /** 循环且不叠层,以中心点最大向左右两边依次缩小 */
    LOOP,
};
cc.Enum(LAYOUT_TYPE);

const {ccclass, property} = cc._decorator;

@ccclass
export default class TouchScrollViewCom extends cc.Component {

    /** 内容根节点 */
    @property({ type: cc.Node })
    content: cc.Node = null;

    /** 模式选择 */
    @property({ type: LAYOUT_TYPE, tooltip: '模式选择：\n1.NOLOOP 不循环且叠层,依次缩放,只显示一半' })
    protected layoutType: LAYOUT_TYPE = LAYOUT_TYPE.NOLOOP;

    /** item prefab */
    @property({ type: cc.Prefab})
    itemPre: cc.Prefab = null;

    /** 所有Item节点 */
    private _childs: Array<cc.Node> = [];

    /** 内容节点之间的横向距离 */
    @property
    protected _deltaX: number = 85;
    @property({ tooltip: '内容节点之间的横向距离' })
    public get deltaX(): number {
        return this._deltaX;
    }
    public set deltaX(v: number) {
        this._deltaX = v;
    }
    /** 最大缩放大小 */
    @property
    protected _maxScale: number = 1.0;
    @property({ tooltip: '最大缩放大小' })
    public get maxScale(): number {
        return this._maxScale;
    }
    public set maxScale(v: number) {
        this._maxScale = v;
    }
    /** 最小缩放大小 */
    @property
    protected _minScale: number = 0;
    @property({ tooltip: '最大缩放大小' })
    public get minScale(): number {
        return this._minScale;
    }
    public set minScale(v: number) {
        this._minScale = v;
    }
    /** 滚动速度 */
    @property
    protected _toAnimSpeed: number = 1000;
    @property({ tooltip: '滚动速度' })
    public get toAnimSpeed(): number {
        return this._toAnimSpeed;
    }
    public set toAnimSpeed(v: number) {
        this._toAnimSpeed = v;
    }
    /** x=0左右两边尺寸 */
    @property
    protected _scaleWidth: number = 500;
    @property({ tooltip: '中心点边距', visible: function () { return (this as any).layoutType === LAYOUT_TYPE.NOLOOP; } })
    public get scaleWidth(): number {
        return this._scaleWidth;
    }
    public set scaleWidth(v: number) {
        this._scaleWidth = v;
    }

    /** 确保触摸是同一个 */
    private _touchID: any = null;
    /** 是否已经触摸 */
    private _isTouching: boolean = false;
    /** 有没有移动 */
    private _isTouchMove: boolean = true;
    /** 触摸点x坐标 */
    private _dx: number = 0;
    /** 滚动的目标位置 */
    private _toAnimIdx: number = 0;
    /** 滚动的方向 */
    private _animDir: number = 1;
    /** 开始update滚动 */
    private _updateAnim: boolean = false;
    /** 当前的index */
    private _curIndex: number = 0;
    /** 回调 */
    private _handler: Function = null;
    
    public getChilds(): cc.Node[] {
        return this._childs;
    }

    init(func: Function, refreshItemHandler: Function, count: number) {
        this._curIndex = 0;
        this._handler = func;
        this._childs = [];
        this.content.destroyAllChildren();
        if (this.layoutType === LAYOUT_TYPE.LOOP) {
            this.content.setContentSize(cc.size(count * this._deltaX, this.content.height));
            this._scaleWidth = this.node.width/2;
        }
        for (var i = 0; i < count; i++) {
            this._childs[i] = cc.instantiate(this.itemPre);
            if (this.layoutType === LAYOUT_TYPE.NOLOOP) {
                this._childs[i].x = this._deltaX * i;
            } else if (this.layoutType === LAYOUT_TYPE.LOOP) {
                if (this._deltaX * i > this.content.width / 2) {
                    this._childs[i].x = this._deltaX * i - this.content.width; 
                } else {
                    this._childs[i].x = this._deltaX * i;
                }
            }
            this.content.addChild(this._childs[i]);
            refreshItemHandler(i, this._childs[i]);
            if (this.layoutType === LAYOUT_TYPE.NOLOOP) {
                this._childs[i].zIndex = count - i;
                this._childs[i].getChildByName('touch').on(cc.Node.EventType.TOUCH_END, this.onClick, this);
                this._childs[i].getChildByName('touch')['userdata'] = { index: i };   
            }
            if (this.layoutType === LAYOUT_TYPE.NOLOOP || this.layoutType === LAYOUT_TYPE.LOOP) {
                let dx = Math.abs(this._childs[i].x);
                let bl = Math.abs(dx/this._scaleWidth) > 1 ? 1 : Math.abs(dx/this._scaleWidth); 
                this._childs[i].scale = (1 - bl) * (this._maxScale - this._minScale) + this._minScale;
            }
        }
        this.registerEvent();
    }
    
    private registerEvent() {
        this.content.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.content.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.content.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.content.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onClick(touch: cc.Event.EventTouch) {
        if (this._isTouchMove) return;
        if (this._curIndex === touch.target['userdata'].index) return;
        this._toAnimIdx = touch.target['userdata'].index;
        this._curIndex = this._toAnimIdx;
        this._animDir = -1;
        this._updateAnim = true;
    }

    private onTouch(event: cc.Event.EventTouch) {
        if (this._touchID !== null && event.touch !== this._touchID) {
            return;
        }

        this._isTouching = true;
        this._isTouchMove = false;
        this._touchID = event.touch;
        this._dx = event.touch.getStartLocation().x;
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        if (this._touchID !== null && event.touch !== this._touchID) {
            return;
        }
        this._isTouchMove = true;
        var dt = event.getLocation().x - this._dx;
        this.move(dt);
        this._dx = event.getLocation().x;
        if (this.layoutType === LAYOUT_TYPE.NOLOOP) {
            this.updateZIndex();   
        }
    }

    private updateZIndex() {
        for (let index = 0; index < this._childs.length; index++) {
            const node = this._childs[index];
            if (node.x > -this._deltaX/2 && node.x < this._deltaX/2) {
                node.zIndex = 999;
            } else {
                node.zIndex = 0;
            }
        }
    }

    private onTouchEnd(event: cc.Event.EventTouch) {
        if (this._touchID !== null && this._touchID !== event.touch) {
            return;
        }

        this._isTouching = false;
        if (event.type === cc.Node.EventType.TOUCH_END || event.type === cc.Node.EventType.TOUCH_CANCEL) {
            this._touchID = null;
        }
    
        let l = this.content.convertToNodeSpaceAR(event.getLocation());
        if (!this._isTouchMove) {
            console.log('不做处理');
            return;
        }

        let minIdx = 0;
        let minSum = Math.abs(this._childs[0].x);
        for (let index = 1; index < this._childs.length; index++) {
            if (Math.abs(this._childs[index].x) < minSum) {
                minSum = Math.abs(this._childs[index].x);
                minIdx = index;
            }
        }
        if (this._childs[minIdx].x > 0) {
            this._animDir = -1;
        } else if (this._childs[minIdx].x < 0) {
            this._animDir = 1;
        }
        if (this._childs[minIdx].x !== 0) {
            this._updateAnim = true;
            this._toAnimIdx = minIdx;
            this._curIndex = this._toAnimIdx;
        }
    }

    /** 移动所有子节点 */
    private move(dt: number) {
        for (let index = 0; index < this._childs.length; index++) {
            const node = this._childs[index];
            this._moveChildx(node, node.x + dt);
        }
    }
    _moveChildx(node: cc.Node, x: number) {
        if (this.layoutType === LAYOUT_TYPE.NOLOOP) {
            node.x = x;
            let dx = Math.abs(x);
            node.scale = (1 - dx/this._scaleWidth) * (this._maxScale - this._minScale) + this._minScale;   
        } else if (this.layoutType === LAYOUT_TYPE.LOOP) {
            if (x > this.content.width/2) {
                x -= this.content.width;
            } else if (x < (-this.content.width/2)) {
                x += this.content.width;
            }
            node.x = x;
            let dx = Math.abs(node.x);
            let bl = Math.abs(dx/this._scaleWidth) > 1 ? 1 : Math.abs(dx/this._scaleWidth);
            node.scale = (1 - bl) * (this._maxScale - this._minScale) + this._minScale;   
        }
    }

    update (dt) {
        if (this._isTouching || !this._updateAnim) {
            return;
        }

        let stepX = this._animDir * dt * this._toAnimSpeed;

        // 确保移动的值不能超出0
        let tx = this._childs[this._toAnimIdx].x + stepX;
        if (this._childs[this._toAnimIdx].x < 0) {
            if (tx >= 0) {
                stepX -= tx;
            }
        } else if (this._childs[this._toAnimIdx].x > 0) {
            if (tx <= 0) {
                stepX = -(Math.abs(stepX) - Math.abs(tx));
            }
        }
        
        for (let index = 0; index < this._childs.length; index++) {
            const node = this._childs[index];
            this._moveChildx(node, node.x + stepX);
        }

        if (this.layoutType === LAYOUT_TYPE.NOLOOP) {
            this.updateZIndex();   
        }

        if (this._childs[this._toAnimIdx].x === 0) {
            this._updateAnim = false;
            if (this._handler) this._handler(this._toAnimIdx);
        }
    }

}
