import SichashuItemm from "./SichashuItemm";


// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SichashuDraggableItem extends SichashuItemm {

    /**
     * 拖拽位置偏移
     */
    protected dragOffset: cc.Vec2 = null;

    protected onLoad () {
        this.registerEvent();
    }

    protected lateUpdate() {
        
    }

    protected registerEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onTouchStart(event: cc.Event.EventTouch) {
        // 记录偏移
        const posInNode = this.node.getParent().convertToNodeSpaceAR(event.getLocation());
        this.dragOffset = posInNode.sub(this.node.getPosition());
    }

    protected onTouchMove(event: cc.Event.EventTouch) {
        if (!this.dragOffset) {
            return;
        }
        // 移动节点
        const posInWorld = event.getLocation(),
            posInNode = this.node.getParent().convertToNodeSpaceAR(posInWorld);
        this.node.setPosition(posInNode.sub(this.dragOffset));
    }

    protected onTouchCancel(event: cc.Event.EventTouch) {
        this.onTouchEnd(event);
    }

    protected onTouchEnd(event: cc.Event.EventTouch) {
        if (!this.dragOffset) {
            return;
        }
        // 重置状态
        this.dragOffset = null;
    }

    // update (dt) {}
}
