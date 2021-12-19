// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, executionOrder } = cc._decorator;

export enum HollowOutShape {
    /** 矩形 */
    Rect = 1,
    /** 圆形 */
    Circle
}

@ccclass
@requireComponent(cc.Sprite)
@executeInEditMode
@disallowMultiple
@executionOrder(-10)
export default class HollowOut extends cc.Component {

    @property
    protected _effect: cc.EffectAsset = null;
    @property({ type: cc.EffectAsset, tooltip: CC_DEV && 'Effect 资源', readonly: true })
    public get effect() {
        return this._effect;
    }
    public set effect(v: cc.EffectAsset) {
        this._effect = v;
        this.init();
    }

    @property
    _shape: HollowOutShape = HollowOutShape.Rect;
    @property({ type: cc.Enum(HollowOutShape), tooltip: '镂空形状' })
    public get shape() {
        return this._shape;
    }
    public set shape(v: HollowOutShape) {
        this._shape = v;
        this.updateProperties();
    }

    @property
    _center: cc.Vec2 = cc.v2();
    @property({ tooltip: '中心坐标' })
    public get center() {
        return this._center;
    }
    public set center(v: cc.Vec2) {
        this._center = v;
        this.updateProperties();
    }

    @property
    _width: number = 300;
    @property({ tooltip: '宽', visible() { return this._shape === HollowOutShape.Rect; } })
    public get width() {
        return this._width;
    }
    public set width(v: number) {
        this._width = v;
        this.updateProperties();
    }

    @property
    _height: number = 300;
    @property({ tooltip: '高', visible() { return this._shape === HollowOutShape.Rect; } })
    public get height() {
        return this._height;
    }
    public set height(v: number) {
        this._height = v;
        this.updateProperties();
    }

    @property
    _round: number = 1;
    @property({ tooltip: '圆角半径', visible() { return this._shape === HollowOutShape.Rect; } })
    public get round() {
        return this._round;
    }
    public set round(v: number) {
        this._round = v;
        this.updateProperties();
    }

    @property
    _radius: number = 200;
    @property({ tooltip: '半径', visible() { return this._shape === HollowOutShape.Circle; } })
    public get radius() {
        return this._radius;
    }
    public set radius(v: number) {
        this._radius = v;
        this.updateProperties();
    }

    @property
    _feather: number = 0.5;
    @property({ tooltip: '边缘虚化宽度', visible() { return this._shape === HollowOutShape.Circle || this.round > 0; } })
    public get feather() {
        return this._feather;
    }
    public set feather(v: number) {
        this._feather = v;
        this.updateProperties();
    }

    protected sprite: cc.Sprite = null;

    protected material: cc.Material = null;

    protected tweenRes: () => void = null;

    protected onLoad() {
        this.init();
    }

    protected resetInEditor() {
        this.init();
    }

    protected async init() {
        if (!this._effect) return;
        // 使用自定义 effect 需要禁用纹理的packable属性,因为动态合图之后无法正确获取纹理的UV坐标

        const sprite = this.sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame && (sprite.spriteFrame.getTexture().packable = false);
        this.material = cc.Material.create(this._effect);
        sprite.setMaterial(0, this.material);
        this.updateProperties();
    }

    /**
     * 更新材质属性
     */
    protected updateProperties() {
        switch (this._shape) {
            case HollowOutShape.Rect:
                this.rect(this._center, this._width, this._height, this._round, this._feather);
                break;
            case HollowOutShape.Circle:
                this.circle(this._center, this._radius, this._feather);
                break;
        }
    }

    public rect(center?: cc.Vec2, width?: number, height?: number, round?: number, feather?: number) {
        // 保存类型
        this._shape = HollowOutShape.Rect;
        // 确认参数
        if (center != null) {
            this._center = center;
        }
        if (width != null) {
            this._width = width;
        }
        if (height != null) {
            this._height = height;
        }
        if (round != null) {
            this._round = (round >= 0) ? round : 0;
            const min = Math.min(this._width / 2, this._height / 2);
            this._round = (this._round <= min) ? this._round : min;
        }
        if (feather != null) {
            this._feather = (feather >= 0) ? feather : 0;
            this._feather = (this._feather <= this._round) ? this._feather : this._round;
        }
        // 更新材质
        const material = this.material;
        material.setProperty('size', this.getNodeSize());
        material.setProperty('center', this.getCenter(this._center));
        material.setProperty('width', this.getWidth(this._width));
        material.setProperty('height', this.getHeight(this._height));
        material.setProperty('round', this.getRound(this._round));
        material.setProperty('feather', this.getFeather(this._feather));
    }

    /**
     * 圆形镂空
     * @param center 中心坐标
     * @param radius 半径
     * @param feather 边缘虚化宽度
     */
    public circle(center?: cc.Vec2, radius?: number, feather?: number) {
        // 保存类型
        this._shape = HollowOutShape.Circle;
        // 确认参数
        if (center != null) {
            this._center = center;
        }
        if (radius != null) {
            this._radius = radius;
        }
        if (feather != null) {
            this._feather = (feather >= 0) ? feather : 0;
        }
        // 更新材质
        const material = this.material;
        material.setProperty('size', this.getNodeSize());
        material.setProperty('center', this.getCenter(this._center));
        material.setProperty('width', this.getWidth(this._radius * 2));
        material.setProperty('height', this.getHeight(this._radius * 2));
        material.setProperty('round', this.getRound(this._radius));
        material.setProperty('feather', this.getFeather(this._feather));
    }

    /**
     * 缓动镂空（矩形）
     * @param time 时间
     * @param center 中心坐标
     * @param width 宽
     * @param height 高
     * @param round 圆角半径
     * @param feather 边缘虚化宽度
     */
    public rectTo(time: number, center: cc.Vec2, width: number, height: number, round: number = 0, feather: number = 0): Promise<void> {
        return new Promise(res => {
            // 保存类型
            this._shape = HollowOutShape.Rect;
            // 停止进行中的缓动
            cc.Tween.stopAllByTarget(this);
            this.unscheduleAllCallbacks();
            // 完成上一个期约
            this.tweenRes && this.tweenRes();
            this.tweenRes = res;
            // 确认参数
            round = Math.min(round, width / 2, height / 2);
            feather = Math.min(feather, round);
            // 缓动
            cc.tween<HollowOut>(this)
                .to(time, {
                    center: center,
                    width: width,
                    height: height,
                    round: round,
                    feather: feather
                })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this.tweenRes) {
                            this.tweenRes();
                            this.tweenRes = null;
                        }
                    });
                })
                .start();
        });
    }

    /**
     * 缓动镂空（圆形）
     * @param time 时间
     * @param center 中心坐标
     * @param radius 半径
     * @param feather 边缘虚化宽度
     */
    public circleTo(time: number, center: cc.Vec2, radius: number, feather: number = 0): Promise<void> {
        return new Promise(res => {
            // 保存类型
            this._shape = HollowOutShape.Circle;
            // 停止进行中的缓动
            cc.Tween.stopAllByTarget(this);
            this.unscheduleAllCallbacks();
            // 完成上一个期约
            this.tweenRes && this.tweenRes();
            this.tweenRes = res;
            // 缓动
            cc.tween<HollowOut>(this)
                .to(time, {
                    center: center,
                    radius: radius,
                    feather: feather
                })
                .call(() => {
                    this.scheduleOnce(() => {
                        if (this.tweenRes) {
                            this.tweenRes();
                            this.tweenRes = null;
                        }
                    });
                })
                .start();
        });
    }

    /**
     * 取消所有挖孔
     */
    public reset() {
        this.rect(cc.v2(), 0, 0, 0, 0);
    }

    /**
     * 挖孔设为节点大小（就整个都挖没了）
     */
    public setNodeSize() {
        const node = this.node,
            width = node.width,
            height = node.height;
        this._radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        this.rect(node.getPosition(), width, height, 0, 0);
    }

    /**
     * 获取节点尺寸
     */
    protected getNodeSize() {
        return cc.v2(this.node.width, this.node.height);
    }

    /**
     * 获取中心点
     * @param center 
     */
    protected getCenter(center: cc.Vec2) {
        const node = this.node,
            width = node.width,
            height = node.height;
        const x = (center.x + (width / 2)) / width,
            y = (-center.y + (height / 2)) / height;
        return cc.v2(x, y);
    }

    /**
     * 获取挖孔宽度
     * @param width 
     */
    protected getWidth(width: number) {
        return width / this.node.width;
    }

    /**
     * 获取挖孔高度
     * @param height 
     */
    protected getHeight(height: number) {
        return height / this.node.width;
    }

    /**
     * 获取圆角半径
     * @param round 
     */
    protected getRound(round: number) {
        return round / this.node.width;
    }

    /**
     * 获取边缘虚化宽度
     * @param feather 
     */
    protected getFeather(feather: number) {
        return feather / this.node.width;
    }

    // update (dt) {}
}
