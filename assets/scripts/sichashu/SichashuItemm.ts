export enum ItemStatus {
    NONE = 1,
    CANDIDATE,
    COLLISION,
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class SichashuItemm extends cc.Component {

    /** 点击销毁 */
    protected clickToDestroy: boolean = true;

    /** 上一个状态 */
    public lastStatus: ItemStatus = ItemStatus.NONE;

    /** 当前状态 */
    public curStatus: ItemStatus = ItemStatus.NONE;

    /**
     * 获取当前节点在世界坐标系下的包围盒
     */
    public get rect() {
        return this.node.getBoundingBoxToWorld();
    }

    protected onLoad() {
        this.init();
        this.registerEvent();
    }
    
    /**
     * 初始化
     */
    protected init() {
        this.curStatus = this.lastStatus = ItemStatus.NONE;

        this.node.width = 115;
        this.node.height = 115;
    }

    /**
     * 事件注册
     */
    protected registerEvent() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    /**
     * 点击回调
     */
    protected onClick(event: cc.Event.EventTouch) {
        // 停止冒泡
        event.stopPropagation();
        if (this.clickToDestroy) {
            this.node.destroy();
        }
    }

    /**
     * 生命周期：延迟帧更新
     */
    protected lateUpdate() {
        if (this.curStatus !== this.lastStatus) {
            switch (this.curStatus) {
                case ItemStatus.NONE:
                    this.node.color = cc.Color.BLACK;
                    break;
                case ItemStatus.CANDIDATE:
                    this.node.color = cc.Color.GREEN;
                    break;
                case ItemStatus.COLLISION:
                    this.node.color = cc.Color.RED;
                    break;
            }
        }
    }

    /**
     * 更新状态
     */
    public updateStatus(newStatus: ItemStatus) {
        this.lastStatus = this.curStatus;
        this.curStatus = newStatus;
    }
}
