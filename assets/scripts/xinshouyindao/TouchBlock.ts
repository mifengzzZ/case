// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchBlock extends cc.Component {

    @property({ type: cc.Node, tooltip: '可被点击的节点' })
    target: cc.Node = null;

    //** 放行状态 */
    protected isPassAll: boolean = false;

    //** 拦截状态 */
    protected isBlockAll: boolean = false;

    protected onLoad() {
        this.registerEvent();
    }

    protected start() {
        this.reset();
    }

    registerEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEvent, this);
    }

    unregisterEvent() {
        // 移除目标节点上的所有注册事件
        this.node.targetOff(this);
    }

    onTouchEvent(event: cc.Event.EventTouch) {
        // 全部放行状态
        if (this.isPassAll) {
            return;
        }
        // 拦截状态并且无目标
        if (this.isBlockAll || !this.target) {
            // 立即停止当前事件的传递，事件甚至不会被分派到所连接的当前目标。
            event.stopPropagationImmediate();
            return;
        }
        // 点击是否命中目标节点
        // getBoundingBoxToWorld 返回节点在世界坐标系下的对齐轴向的包围盒(AABB)
        const targetRect = this.target.getBoundingBoxToWorld();
        // contains 当前矩形是否包含指定坐标点
        const isContains = targetRect.contains(event.getLocation());
        if (!isContains) {
            event.stopPropagationImmediate();
            return;
        }
        this.node.getChildByName('shoushiroot').active = false;
        this.node.active = false;
        this.node.getComponent('HollowOut').setNodeSize();
        this.passAll();
    }

    blockAll() {
        this.isBlockAll = true;
        this.isPassAll = false;
    }

    passAll() {
        this.isPassAll = true;
        this.isBlockAll = false;
    }

    setTarget(node: cc.Node) {
        this.target = node;
        this.isBlockAll = false;
        this.isPassAll = false;
    }

    setSwallowTouches(swallow: boolean) {
        this.node._touchListener && this.node._touchListener.setSwallowTouches(swallow);
    }

    reset() {
        this.setSwallowTouches(false);
    }

    onDestroy() {
        this.unregisterEvent();
    }
}
