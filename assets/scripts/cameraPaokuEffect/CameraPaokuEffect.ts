// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraPaokuEffect extends cc.Component {

    @property({type: cc.Camera, tooltip: '3D摄像机'})
    camera3D: cc.Camera = null;

    @property({ type: cc.Node, tooltip: '添加Map的根节点' })
    mapNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: '添加Map上物品根节点' })
    mapItemNode: cc.Node = null;

    @property({ type: cc.Integer, tooltip: 'Map其实Z值' })
    mapStartValue: number = 0;

    @property({ type: cc.Integer, tooltip: '地图之间的间隔Z值' })
    mapSpaceValue: number = 0;

    @property({ type: cc.Integer, tooltip: 'Map移动速度(update持续移动)' })
    mapSpeedValue: number = 0;

    @property({ type: cc.Integer, tooltip: '移动一端所需要的时间(非持续移动)' })
    mapTimeValue: number = 0;

    @property({ type: cc.Prefab, tooltip: '地图预制体' })
    mapPre: cc.Prefab = null;

    @property({ type: [cc.Prefab], tooltip: '地图上的台阶' })
    taijiePreArr: Array<cc.Prefab> = [];

    @property({ type: cc.Node, tooltip: '返回主场景' })
    backNode: cc.Node = null;

    /** 地图节点 */
    private _mapArr: Array<cc.Node> = [];

    /** 地图上的物品 */
    private _mapItemNodeArr: Array<cc.Node> = [];

    /** 假数据测试 */
    private _mapTaiJieData: Array<Object> = [];

    /** item y 差值 */
    private _maoTaijieOffY: number = 1.6; //1.6;

    onLoad() {
        this._mapTaiJieData.push({ pre: 0, name: '测试1' });
    }

    start() {
        this.initMap();

        this.backNode.on(cc.Node.EventType.TOUCH_END, this.onClickBack, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onClickBack() {
        cc.director.loadScene('main');
    }

    onTouchEnd(event: cc.Touch) {
        // 根据点击的点获取一条由屏幕射向屏幕内的射线
        let ray: cc.geomUtils.Ray = this.camera3D.getRay(event.getLocation());
        // 根据传入的根节点向下检测,并返回检测结果
        // 返回的信息包含normal法线向量、穿过的碰撞体等
        let results = cc.geomUtils.intersect['raycast'](this.node, ray, this.geomUtilsIntersectHandler.bind(this), null);
        for (let i = 0; i < results.length; i++) {
            if (results[i].node.name === 'touchNode' && results[i].node.parent && results[i].node.parent['userdata'].zIndex === 5) {
                console.log('results[i].node[\'userdata\'] : ', results[i].node.parent['userdata'].zIndex);
                break;
            }
        }

        // this.nextFloor();
    }

    geomUtilsIntersectHandler(modelRay, node, distance) {
        return distance;
    }

    /** 初始化地图 */
    protected initMap() {
        for (let i = 0; i < 4; i++) {
            let node: cc.Node = cc.instantiate(this.mapPre);
            node.setPosition(cc.v3(0, 0, this.mapStartValue + i * this.mapSpaceValue));
            this.mapNode.addChild(node, i);
            this._mapArr.push(node);
            node['userdata'] = { mz: 0, maxMZ: 10, zIndex: i };
        }

        for (let i = 0; i < 6; i++) {
            let node: cc.Node = new cc.Node();
            node.is3DNode = true;
            node.setPosition(cc.v3(0, this._maoTaijieOffY, -14.5 + i * 8.5));
            node.scale = 0.7;
            this.mapItemNode.addChild(node, i);
            this._mapItemNodeArr.push(node);
            node['userdata'] = { mz: 0, maxMZ: 8.5, zIndex: i, obj: [] };
            // 地图上台阶
            for (let index = 0; index < 3; index++) {
                let taijie: cc.Node = cc.instantiate(this.taijiePreArr[0]);
                taijie.setPosition(cc.v3(-8.5 + index * 8.5, -3, -4));
                taijie['userdata'] = {zIndex: i, idx: index};
                node.addChild(taijie);
                node['userdata'].obj.push(taijie);
            }
        }
    }

    /** 进入下一层 */
    nextFloor() {
        for (let index = 0; index < this._mapArr.length; index++) {
            const node = this._mapArr[index];
            node['userdata'].mz += 5;
            if (index === (this._mapArr.length - 1)) {
                cc.tween(node).to(0.5, { position: cc.v3(0, 0, node.z + 5) }).call(this.updateMapNodezIndex.bind(this)).start();
            } else {
                cc.tween(node).to(0.5, { position: cc.v3(0, 0, node.z + 5) }).start();
            }
        }

        for (let index = 0; index < this._mapItemNodeArr.length; index++) {
            const node = this._mapItemNodeArr[index];
            node['userdata'].mz = 8.5;
            if (node['userdata'].zIndex > 4) {
                cc.tween(node).to(0.5, { position: cc.v3(0, -1.1, node.z + 8.5) }).call(this.updateMapItemNodeIndex.bind(this)).start();
            } else {
                cc.tween(node).to(0.5, { position: cc.v3(0, this._maoTaijieOffY, node.z + 8.5) }).start();
            }
        }
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

    updateMapItemNodeIndex() {
        if (!(this._mapItemNodeArr[0]['userdata'].mz >= 8.5)) {
            return;
        }
        for (let index = 0; index < this._mapItemNodeArr.length; index++) {
            const itemRootNode = this._mapItemNodeArr[index];
            itemRootNode['userdata'].mz = 0;
            if (itemRootNode['userdata'].zIndex > 4) {
                itemRootNode['userdata'].zIndex = 0;
                itemRootNode.z = -14.5;
                itemRootNode.y = this._maoTaijieOffY;
            } else {
                itemRootNode['userdata'].zIndex += 1;
            }
            itemRootNode.zIndex = itemRootNode['userdata'].zIndex;
        }
    }

    // update(dt) {
    //     let speedZ = this.mapSpeedValue * dt / 50;
    //     for (let index = 0; index < this._mapArr.length; index++) {
    //         const node = this._mapArr[index];
    //         let tempMz = node['userdata'].mz + speedZ;
    //         if (tempMz >= node['userdata'].maxMZ) {
    //             let m = speedZ - (tempMz - node['userdata'].maxMZ);
    //             node.z += m;
    //             node['userdata'].mz += m;
    //         } else {
    //             node.z += speedZ;
    //             node['userdata'].mz += speedZ;
    //         }
    //     }

    //     speedZ = this.mapSpeedValue * dt / 25;
    //     for (let index = 0; index < this._mapItemNodeArr.length; index++) {
    //         const itemRootNode = this._mapItemNodeArr[index];
    //         let tempMz = itemRootNode['userdata'].mz + speedZ;
    //         if (tempMz >= itemRootNode['userdata'].maxMZ) {
    //             let m = speedZ - (tempMz - itemRootNode['userdata'].maxMZ);
    //             itemRootNode.z += m;
    //             itemRootNode['userdata'].mz += m;
    //         } else {
    //             itemRootNode.z += speedZ;
    //             if (itemRootNode['userdata'].zIndex > 4) {
    //                 itemRootNode.y -= (speedZ / 4);
    //             }
    //             itemRootNode['userdata'].mz += speedZ;
    //         }
    //     }

    //     this.updateMapItemNodeIndex();
    //     this.updateMapNodezIndex();
    // }

}
