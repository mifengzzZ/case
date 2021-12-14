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

    @property({type: cc.Node, tooltip: '添加Map上物品根节点'})
    mapItemNode: cc.Node = null;

    @property({type: cc.Integer, tooltip: 'Map其实Z值'})
    mapStartValue: number = 0;

    @property({type: cc.Integer, tooltip: '地图之间的间隔Z值'})
    mapSpaceValue: number = 0;

    @property({type: cc.Integer, tooltip: 'Map移动速度(update持续移动)'})
    mapSpeedValue: number = 0;

    @property({type: cc.Integer, tooltip: '移动一端所需要的时间(非持续移动)'})
    mapTimeValue: number = 0;

    @property({type: cc.Prefab, tooltip: '地图预制体'})
    mapPre: cc.Prefab = null;

    @property({type: [cc.Prefab], tooltip: '地图上的台阶'})
    taijiePreArr: Array<cc.Prefab> = [];

    /** 地图节点 */
    private _mapArr: Array<cc.Node> = [];

    /** 地图上的物品 */
    private _mapItemNodeArr: Array<cc.Node> = [];

    /** 假数据测试 */
    private _mapTaiJieData: Array<Object> = [];

    onLoad () {
        this._mapTaiJieData.push({pre: 0, name: '测试1'});
    }

    start () {
        this.initMap();

        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchEnd(event: cc.Event) {
        console.log('event : ', event);
    }

    /** 初始化地图 */
    protected initMap() {
        for (let i = 0; i < 4; i++) {
            let node: cc.Node = cc.instantiate(this.mapPre);
            node.setPosition(cc.v3(0, 0, this.mapStartValue + i*this.mapSpaceValue));
            this.mapNode.addChild(node, i);
            this._mapArr.push(node);
            node['userdata'] = {mz: 0, maxMZ: 10, zIndex: i};

            // 地图上台阶
            // if (i == 3) {
            //     for (let index = 0; index < 3; index++) {
            //         let taijie: cc.Node = cc.instantiate(this.taijiePreArr[0]);
            //         taijie.setPosition(cc.v3(-7 + index*7, -3, -3));
            //         node.addChild(taijie);
            //     }   
            // }
        }

        // let node: cc.Node = new cc.Node();
        // node.is3DNode = true;
        // node.setPosition(cc.v3(this._mapArr[3].x, this._mapArr[3].y, this._mapArr[3].z));
        // this.mapItemNode.addChild(node, 3);
        // let taijie: cc.Node = cc.instantiate(this.taijiePreArr[0]);
        // taijie.setPosition(cc.v3(0, -3, -3));
        // node.addChild(taijie);


        // for (let i = 0; i < this._mapArr.length; i++) {

        //     let node: cc.Node = new cc.Node();
        //     node.is3DNode = true;
        //     node.setPosition(cc.v3(this._mapArr[i].x, this._mapArr[i].y, this._mapArr[i].z));
        //     this.mapItemNode.addChild(node, i);
        //     this._mapItemNodeArr.push(node);
        //     // node['userdata'] = {mz: 0, maxMZ: 10, zIndex: i, obj: []};

        //     // 地图上台阶
        //     for (let index = 0; index < 3; index++) {
        //         let taijie: cc.Node = cc.instantiate(this.taijiePreArr[0]);
        //         taijie.setPosition(cc.v3(-7 + index*7, -3, -3));
        //         node.addChild(taijie);
        //         // node['userdata'].obj.push(taijie);
        //     }   
        // }



    }

    /** 检测是否需要更新地图上的zIndex(只要有一个mz的值满足条件) */
    updateMapNodezIndex() {
        if (!(this._mapArr[0]['userdata'].mz >= 10)) {
            return;
        }
        for (let index = 0; index < this._mapArr.length; index++) {
            const node = this._mapArr[index];
            node['userdata'].mz = 0;
            if (node['userdata'].zIndex > 2) {
                node['userdata'].zIndex = 0;
                node.z = this.mapStartValue;
            } else {
                node['userdata'].zIndex += 1;
            }
            node.zIndex = node['userdata'].zIndex;
        }
    }

    update(dt) {
        let speedZ = this.mapSpeedValue * dt / 100;
        for (let index = 0; index < this._mapArr.length; index++) {
            const node = this._mapArr[index];
            let tempMz = node['userdata'].mz + speedZ;
            if (tempMz >= node['userdata'].maxMZ) {
                let m = speedZ - (tempMz - node['userdata'].maxMZ);
                node.z += m;
                node['userdata'].mz += m;
            } else {
                node.z += speedZ;
                node['userdata'].mz += speedZ;
            }
        }
        this.updateMapNodezIndex();
    }

}
