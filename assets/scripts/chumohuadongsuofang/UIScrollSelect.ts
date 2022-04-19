
const {ccclass, property} = cc._decorator;

export enum EventType {
    SCROLL_START,
    SCROLL_ING,
    SCROLL_END
}

@ccclass
export default class UIScrollSelect extends cc.Component {

    public static EventType = EventType;

    /** 内容根节点-带mask组件 */
    @property({ type: cc.Node })
    content: cc.Node = null;

    /** 内容节点之间的横向距离 */
    @property({
        tooltip: '单个控件之间的距离'
    })
    deltaX: number = 0;

    /** 中心点的缩放大小 */
    @property({
        tooltip: '中心点的缩放比例'
    })
    centerScale: number = 1.0;

    /** 两边的缩放大小 */
    @property({
        tooltip:'边缘点的缩放比例'
    })
    minScale: number = 1.0;

    /** 滑动速度 */
    @property({
        tooltip: '滚动时的速度'
    })
    scrollSpeed: number = 300;

    /** 点击Item回调 */
    @property({
        type: cc.Component.EventHandler,
        tooltip: "选择后的回调"
    })
    selectEvents: Array<cc.Component.EventHandler> = [];

    /** 所有Item节点 */
    private childs: Array<cc.Node> = [];

    /** 移动方向 */
    private _toMoveX: number = 1;

    /** 保存处理触摸的Touch是同一个 */
    private _touchId: any = null;

    /** 是否已经触摸 */
    private isTouching: boolean = false;

    /** 是否已经滑动 */
    private hasTouchMove: boolean = false;

    /** 记录当前在哪个位置 */
    private currentIndex: number = 0;

    private isTestX: boolean = false;
    private dx: number = 0;
    private moveAim: number = 0;

    onLoad() {

        // 从锚点开始依次排列item,相隔deltaX像素
        this.childs = [];
        for(var i = 0; i < this.content.children.length; i++){
            this.childs[i] = this.content.children[i];
            this.childs[i].x = this.deltaX * (i - 1);
        }

        for(var i = 0; i < this.childs.length; i++) {
            this._checkChildX(this.childs[i], this.childs[i].x);
        }

        // 更新层级
        for(var i = 0; i < this.childs.length; i++) {
            this.childs[i].zIndex = 9999 - i;
        }

        this.isTouching = false;
        this.hasTouchMove = false;
        this.isTestX = false;
        this._touchId = null;

        this.currentIndex = 0;
        this.scrollTo(0,false);
    }

    /** 滚动到指定节点 
     * @param anim 是否带移动动画
    */
    scrollTo(idx:number,anim:boolean=true){
        if(idx < 0 && idx >= this.childs.length){
            return console.error(this.node.name+'->移动超出边界面')
        }
        this.currentIndex = idx;
        this.moveAim = idx;
        if(!anim){
            for(var i=0; i<this.childs.length; i++){
                this._checkChildX(this.childs[i],(i-idx) *this.deltaX)
            }
        } else {
            this.isTestX = true
            cc.Component.EventHandler.emitEvents(this.selectEvents, {target :this,
                type :EventType.SCROLL_START,
                index : this.currentIndex});
        }
    }
    /** 向左滚一个点 */
    scrollToLeft(){
        this._toMoveX = 1
        this.scrollTo((this.currentIndex-1+this.childs.length)%this.childs.length)
    }
    
    /** 向左滚一个点 */
    scrollToRight(){
        this._toMoveX = -1
        this.scrollTo((this.currentIndex+1+this.childs.length)%this.childs.length)
    }

    /**
     * @param child 当前item
     * @param x 当前item.x的值 + 滑动偏移量
     */
    _checkChildX(child, x) {
        // 处理首部和尾部的Item交换
        if(x > this.childs.length/2 * this.deltaX) {
            x -= this.childs.length * this.deltaX;
        } else if (x < -this.childs.length/2 * this.deltaX) {
            x += this.childs.length * this.deltaX;
        }
        // 更新Item坐标
        child.x = x;
        // 根据距离计算缩放比例
        let dx = Math.abs(x);
        child.scale = (1 - this.minScale) - (dx / (this.content.getContentSize().width/2));
    }

    start() {
        // 内容节点添加触摸事件
        this.content.on(cc.Node.EventType.TOUCH_START,this._onTouch,this);
        this.content.on(cc.Node.EventType.TOUCH_MOVE,this._onTouch,this);
        this.content.on(cc.Node.EventType.TOUCH_END,this._onTouchEnd,this);
        this.content.on(cc.Node.EventType.TOUCH_CANCEL,this._onTouchEnd,this);
    }

    /**
     * 触摸点击
     * @param event
     */
    _onTouch(event) {
        // 如果本次触摸的Touch不同直接退出
        if(this._touchId != null && event.touch != this._touchId){
            return;
        }

        // 当触摸屏幕时
        if (event.type == cc.Node.EventType.TOUCH_START) {
            this.isTouching = true;
            this.hasTouchMove = false
            this._touchId = event.touch;

            this.isTestX = false;

            // 以屏幕左下角为原点
            this.dx = event.getStartLocation().x;

            // 触摸事件
            let evt = {
                target: this,
                type: EventType.SCROLL_START,
                index: this.currentIndex
            }
            cc.Component.EventHandler.emitEvents(this.selectEvents, evt);

            return;
        }

        // 开始滑动,并且计算出触摸点与滑动之后的间距
        this.hasTouchMove = true;
        var dx = event.getLocation().x - this.dx

        // 移动计算
        this._move(dx);

        // 保存下一次触摸滑动的x坐标
        this.dx = event.getLocation().x

        // 滑动事件
        var evt = {
            target :this,
            type :EventType.SCROLL_ING,
            dx:this.dx
        }
        cc.Component.EventHandler.emitEvents(this.selectEvents, evt);

    }

    /**
     * 触摸结束
     * @param event
     */
    _onTouchEnd(event) {
        // 如果本次触摸的Touch不同直接退出
        if(this._touchId != null && event.touch != this._touchId) {
            return;
        }

        // 是否在触摸重置
        this.isTouching = false;

        // touchID重置
        if(event.type == cc.Node.EventType.TOUCH_END || event.type == cc.Node.EventType.TOUCH_CANCEL) {
            this._touchId = null;
        }

        // 相对于本地节点坐标content(mask)
        let lo = this.node.convertToNodeSpaceAR(event.getLocation());
        console.log('lo.x : ', lo.x);
        // 是否有触摸滑动
        console.log('this.hasTouchMove : ', this.hasTouchMove);
        if(!this.hasTouchMove) {
            // 处理没滑动的情况

            // 计算点击的是第几个Item
            let mx = Math.ceil((lo.x - this.deltaX / 2) / this.deltaX);

            if(mx === 0){
                // 当前Item不变
                var event1 = {
                    target :this,
                    type :EventType.SCROLL_END,
                    index : this.currentIndex
                }
                cc.Component.EventHandler.emitEvents(this.selectEvents, event1);
            } else {
                // 跳转至触摸的Item
                this.moveAim = (this.currentIndex + mx + this.childs.length) % this.childs.length
                this._toMoveX = mx > 0 ? -1 : 1
                this.isTestX = true;
            }

            return;
        }

        // 处理滑动的情况
        let max = this.deltaX;
        let minidx = 0;
        
        for(let i = 0; i < this.childs.length; i++) {
            if (Math.abs(this.childs[i].x) <= max) {
                max = Math.abs(this.childs[i].x);
                minidx = i;
            }
        }
        this.moveAim = minidx;
        this._toMoveX = this.childs[minidx].x >= 0 ? -1 : 1;
        this.isTestX = true;
    }

    /**
     * 移动
     * @param dt
     */
    _move(dt) {
        for(var i = 0; i < this.childs.length; i++) {
            this._checkChildX(this.childs[i], this.childs[i].x + dt);
        }
    }
    
    update(dt) {
        if (this.isTouching || !this.isTestX) {
            return;
        }

        var stepx = this._toMoveX * dt * this.scrollSpeed;

        let lx = this.childs[this.moveAim].x;

        // 根据时间线dt去移动item的x位置
        for (var i = 0; i < this.childs.length; i++) {
            this._checkChildX(this.childs[i], this.childs[i].x + stepx);
        }

        // 获取第1个的item.x的值
        var x = this.childs[0].x;

        // Math.round 四舍五入 -1.6=-2  -1.5=-1   1.5=2   1.4=1
        // 当前第1个在idx位置
        var idx = Math.round(x / this.deltaX);

        
        var tox = this.deltaX * idx;

        let cx = this.childs[this.moveAim].x;

        if (lx * cx < 0 && Math.abs(cx) < this.deltaX) {

            this.isTestX = false;

            for(let i = 0; i < this.childs.length; i++) {
                if (Math.abs(this.childs[i].x) <= Math.abs(stepx)) {
                    this.currentIndex = i;
                    break;
                }
            }

            for (var i = 0; i < this.childs.length; i++) {
                this._checkChildX(this.childs[i], this.childs[i].x + tox - x);
            }

            var event = {
                target :this,
                type :EventType.SCROLL_END,
                index : this.currentIndex
            }
            cc.Component.EventHandler.emitEvents(this.selectEvents, event);
        }

    }

}
