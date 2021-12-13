// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraPaokuEffect extends cc.Component {

    @property({type: cc.Node, tooltip: '添加Map的根节点'})
    mapNode: cc.Node = null;

    @property({type: Number, tooltip: 'Map其实Z值'})
    mapStartValue: Number = 0;

    @property({type: Number, tooltip: '地图之间的间隔Z值'})
    mapSpaceValue: number = 0;

    @property({type: Number, tooltip: 'Map移动速度(update持续移动)'})
    mapSpeedValue: Number = 0;

    @property({type: Number, tooltip: '移动一端所需要的时间(非持续移动)'})
    mapTimeValue: Number = 0;

    @property({type: cc.Prefab, tooltip: '地图预制体'})
    mapPre: cc.Prefab = null;

    /** 地图节点 */
    private _mapArr: Array<cc.Node> = [];
    /** 地图对象池 */
    private _mapNodePool: cc.NodePool = null;

    // onLoad () {}

    start () {
        this._mapNodePool = new cc.NodePool();
    }

    protected creatorMap(): cc.Node {
        let node: cc.Node = cc.instantiate(this.mapPre);

        return ;
    }

    update(dt) {
        console.log('dt : ', dt);
    }

}
