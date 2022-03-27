// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Cloud extends cc.Component {

    @property(cc.Node)
    mapNode: cc.Node = null;

    @property
    private _speed: number = 0;
    @property({ tooltip: CC_DEV && '移动速度' })
    public set speed(v: number) {
        this._speed = v;
    }
    public get speed(): number {
        return this._speed;
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    update(dt) {
        if (this.node.x < (-this.node.getContentSize().width / 2)) {
            this.node.x = this.mapNode.width + this.node.getContentSize().width / 2;
        } else {
            this.node.x -= this.speed;
        }
    }

}
