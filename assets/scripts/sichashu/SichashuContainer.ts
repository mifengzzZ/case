import SichashuItemm from "./SichashuItemm";



// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SichashuContainer extends cc.Component {

    @property(cc.Prefab)
    protected itemPrefab: cc.Prefab = null;
    
    /**
     * 在世界坐标系下的包围盒
     */
    public get rect() {
        return this.node.getBoundingBoxToWorld();
    }

    /**
     * 物体
     */
    public get items() {
        return this.node.getComponentsInChildren(SichashuItemm);
    }

    protected onLoad () {
        this.registerEvent();
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
        const posInWorld = event.getLocation(),
            posInNode = this.node.convertToNodeSpaceAR(posInWorld);
        this.addItem(posInNode);
    }

    /**
     * 添加物体
     */
    public addItem(pos?: cc.Vec2 | cc.Vec3) {
        const node = cc.instantiate(this.itemPrefab);
        node.setParent(this.node);
        if (!pos) {
            const node = this.node,
                x = (node.width * Math.random()) - (node.width/2),
                y = (node.height * Math.random() - (node.height/2));
            pos = cc.v2(x, y);
        }
        node.setPosition(pos);
    }

    /**
     * 清空所有物体
     */
    public clearItems() {
        this.node.removeAllChildren();
    }

    // update (dt) {}
}
