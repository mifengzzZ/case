import GameControlCom from "./GameControlCom";
import GoldObjPoolMgr from "./pool/GoldObjPoolMgr";
import PosUtil from "../convertUtils/PosUtil";
import EnemyObjPoolMgr from "./pool/EnemyObjPoolMgr";
import Enemy from "./component/Enemy";
import Player from "./role/Player";
import { ROLE_STATE } from "./RoleState";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

interface LoadResolve {
    path: string;
    asset: any;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameControl {
    private static _ins: GameControl = null;
    public static get ins(): GameControl {
        if (!this._ins) {
            this._ins = new GameControl();
        }
        return this._ins;
    }

    private _com: GameControlCom = null;
    public set com(com: GameControlCom) {
        this._com = com;
    }
    public get com(): GameControlCom {
        return this._com;
    }

    private _eventList: Array<Object> = [];

    private _role: Player = null;
    public set role(player: Player) {
        this._role = player;
    }
    public get role(): Player {
        return this._role;
    }

    /** 奖励对象 */
    private _awardObjGroup: cc.TiledObjectGroup = null;
    public get awardObjGroup(): cc.TiledObjectGroup {
        return this._awardObjGroup;
    }

    /** 敌人对象 */
    private _enemyObjGroup: cc.TiledObjectGroup = null;
    public get enemyObjGroup(): cc.TiledObjectGroup {
        return this._enemyObjGroup;
    }

    /** 主角对象 */
    private _playerObjGroup: cc.TiledObjectGroup = null;
    public get playerObjGroup(): cc.TiledObjectGroup {
        return this._playerObjGroup;
    }

    /** 限制跳跃高度对象 */
    private _topblockObjGroup: cc.TiledObjectGroup = null;
    public get topblockObjGroup(): cc.TiledObjectGroup {
        return this._topblockObjGroup;
    }

    /** 土砖对象 */
    private _brickObjGroup: cc.TiledObjectGroup = null;
    public get brickObjGroup(): cc.TiledObjectGroup {
        return this._brickObjGroup;
    }

    /** 阻挡Y层 */
    private _barrierLayer: cc.TiledLayer = null;
    public get barrierLayer(): cc.TiledLayer {
        return this._barrierLayer;
    }

    /** 阻挡X层 */
    private _blockLayer: cc.TiledLayer = null;
    public get blockLayer(): cc.TiledLayer {
        return this._blockLayer;
    }

    /** 地图特效(比floor层级高) */
    private _floorEffectTop: cc.TiledLayer = null;
    public get floorEffectTop(): cc.TiledLayer {
        return this._floorEffectTop;
    }

    /** 地图特效(比floor层级低) */
    private _floorEffectDown: cc.TiledLayer = null;
    public get floorEffectDown(): cc.TiledLayer {
        return this._floorEffectDown;
    }

    /** 控制一次只能碎一个土块 */
    private _gravel: boolean = false;
    public set gravel(v: boolean) {
        this._gravel = v;
    }
    public get gravel(): boolean {
        return this._gravel;
    }

    private _score: number = 0;

    _resCfg: Array<Object> = [
        { dir: 'tiledmap/caimogu/LW3_Assets', type: cc.SpriteAtlas, bundle: "resources" },
        { dir: 'tiledmap/caimogu/player/role', type: cc.SpriteAtlas, bundle: "resources" },
        { dir: 'tiledmap/caimogu/dust/duskSign', type: cc.Prefab, bundle: "resources" },
        { dir: 'tiledmap/caimogu/dust/duskLand', type: cc.Prefab, bundle: "resources" },
        { dir: 'tiledmap/caimogu/dust/duskSky', type: cc.Prefab, bundle: "resources" },
        { dir: 'tiledmap/caimogu/music/effect/Jump', type: cc.AudioClip, bundle: "resources" },
        { dir: 'tiledmap/caimogu/music/effect/Land', type: cc.AudioClip, bundle: "resources" },
        { dir: 'tiledmap/caimogu/effect/goldeffect', type: cc.Prefab, bundle: "resources" },
        { dir: 'tiledmap/caimogu/brick/adobe', type: cc.Prefab, bundle: "resources" },
        { dir: 'tiledmap/caimogu/music/effect/DestroyItemBlock', type: cc.AudioClip, bundle: "resources" },
        { dir: 'tiledmap/caimogu/brick/adobe_death', type: cc.Prefab, bundle: "resources" },
    ];

    private _sRes: Map<string, any> = new Map();
    public get sRes(): Map<string, any> {
        return this._sRes;
    }
    private addSRes(key: string, value: any) {
        this._sRes[key] = value;
    }

    onLoad() {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        // Enabled draw collider bounding box
        manager.enabledDrawBoundingBox = true;

        this.com.resetGame.on(cc.Node.EventType.TOUCH_END, this.resetGame, this);
    }

    async start() {
        for (let index = 0; index < this._resCfg.length; index++) {
            const e = this._resCfg[index];
            let res: LoadResolve = await this.loadingResources(e);
            this.addSRes(res.path, res.asset);
        }
        console.log('所有资源: ', this.sRes);

        this.initCls();
        this.initMapView();

        cc.director.getScheduler().enableForTarget(this);
        cc.director.getScheduler().scheduleUpdate(this, this.update.bind(this), false);
    }

    async loadingResources(url: Object): Promise<LoadResolve> {
        return new Promise((resolve, reject) => {
            try {
                let lastProgres: number = 0;
                cc.assetManager.loadAny(url, (finished: number, total: number, item: cc.AssetManager.RequestItem) => {
                    let progress: number = finished / total;
                    if (progress > 1) {
                        progress = 1;
                    } else if (progress < 0) {
                        progress = 0;
                    }
                    if (lastProgres > progress) {
                        return;
                    }
                    lastProgres = progress;
                }, (err: Error, data: any) => {
                    if (err) {
                        console.error("加载失败<>>>", url, data, err);
                        return;
                    }
                    if (data === null || data === undefined) {
                        console.error("单个资源加载错误>>>>>", url, data)
                        return;
                    }
                    let result: LoadResolve = { path: url['dir'], asset: data };
                    resolve(result);
                });
            } catch (e) {
                console.log("资源加载出现异常", url, e);
            }
        });
    }

    private initCls() {
        GoldObjPoolMgr.ins.template = this.com.goldPre;
        EnemyObjPoolMgr.ins.template = this.com.enemy1Pre;
    }

    /**
     * 重置对象层锚点和坐标为opengl坐标原点
     * @param node 
     */
    private resetObjectGroupLayer(node: cc.Node) {
        node.anchorX = 0;
        node.anchorY = 0;
        node.x = 0;
        node.y = 0;
    }

    private initMapView(reset?: boolean) {
        this._awardObjGroup = this.com.tiledMap.getObjectGroup('award');
        this._enemyObjGroup = this.com.tiledMap.getObjectGroup('enemy');
        this._playerObjGroup = this.com.tiledMap.getObjectGroup('player');
        this._topblockObjGroup = this.com.tiledMap.getObjectGroup('topblock');
        this._brickObjGroup = this.com.tiledMap.getObjectGroup('brick');
        this.resetObjectGroupLayer(this._awardObjGroup.node);
        this.resetObjectGroupLayer(this._enemyObjGroup.node);
        this.resetObjectGroupLayer(this._playerObjGroup.node);
        this.resetObjectGroupLayer(this._topblockObjGroup.node);
        this.resetObjectGroupLayer(this._brickObjGroup.node);
        this._barrierLayer = this.com.tiledMap.getLayer('barrier');
        this._barrierLayer.node.active = false;
        this._blockLayer = this.com.tiledMap.getLayer('block');
        this._blockLayer.node.active = false;
        this._floorEffectTop = this.com.tiledMap.getLayer('floorEffect');
        this.resetObjectGroupLayer(this._floorEffectTop.node);
        this._floorEffectDown = this.com.tiledMap.getLayer('groundEffect');
        this.resetObjectGroupLayer(this._floorEffectDown.node);

        let awardObjArray: Array<Object> = this._awardObjGroup.getObjects();
        for (let index = 0; index < awardObjArray.length; index++) {
            const element = awardObjArray[index];
            let gold = GoldObjPoolMgr.ins.get();
            gold.setPosition(cc.v2(element['x'], element['y']));
            this._awardObjGroup.node.addChild(gold);
        }

        let enemyObjArray: Array<Object> = this._enemyObjGroup.getObjects();
        for (let index = 0; index < enemyObjArray.length; index++) {
            console.log(index);
            const element = enemyObjArray[index];
            let enemy = EnemyObjPoolMgr.ins.get();
            enemy.setPosition(cc.v2(element['x'], element['y']));
            this._enemyObjGroup.node.addChild(enemy);
            enemy.getComponent(Enemy).setTiledMapInfo(this.com.tiledMap, this.barrierLayer, this.blockLayer);
        }

        if (reset) {
            let roleObjArr: Array<Object> = this._playerObjGroup.getObjects();
            this.role.node.setPosition(roleObjArr[0]['x'], roleObjArr[0]['y']);
            this.role.setState(ROLE_STATE.IDLE);
        } else {
            let roleObjArr: Array<Object> = this._playerObjGroup.getObjects();
            let r: cc.Node = cc.instantiate(this.com.role);
            this.role = r.getComponent(Player);
            r.setPosition(roleObjArr[0]['x'], roleObjArr[0]['y']);
            this._playerObjGroup.node.addChild(r);
            this._eventList.push(this.role);
        }

        /** 限制跳跃的碰撞体 */
        let topblockObjArr: Array<Object> = this._topblockObjGroup.getObjects();
        for (let index = 0; index < topblockObjArr.length; index++) {
            const element = topblockObjArr[index];
            let topblockColider = new cc.Node();
            topblockColider.setContentSize(element['width'], element['height']);
            topblockColider.setPosition(element['x'], element['y']);
            let box: cc.BoxCollider = topblockColider.addComponent(cc.BoxCollider);
            box.size = cc.size(element['width'], element['height']);
            box.offset.x += element['width'] / 2;
            topblockColider.group = 'topblock';
            topblockColider.anchorX = 0;
            topblockColider.anchorY = 1;
            this.topblockObjGroup.node.addChild(topblockColider);
        }

        /** 创建土砖 */
        let brickObjArr: Array<Object> = this.brickObjGroup.getObjects();
        for (let index = 0; index < brickObjArr.length; index++) {
            const element = brickObjArr[index];
            let adobe = cc.instantiate(this.sRes['tiledmap/caimogu/brick/adobe']);
            adobe.x = element['x'];
            adobe.y = element['y'];
            this.brickObjGroup.node.addChild(adobe);
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.com.gameoverNode.active = true;
    }

    resetGame() {
        this.com.gameoverNode.active = false;
        GoldObjPoolMgr.ins.clear();
        EnemyObjPoolMgr.ins.clear();
        this._topblockObjGroup.node.destroyAllChildren();
        this._brickObjGroup.node.destroyAllChildren();
        this._floorEffectTop.node.destroyAllChildren();
        this._floorEffectDown.node.destroyAllChildren();
        this.com.mapCameraNode.setPosition(0, 0);
        this.initMapView();
        this._score = 0;
        this.refreshScore();
    }

    refreshScore(score?: number) {
        this._score += score;
        this.com.scoreLabel.string = this._score.toString();
    }

    update(dt) {
        this.role.customUpdate(dt);
    }

    unScheduler() {
        cc.director.getScheduler().unscheduleAllForTarget(this);
    }

    /** 地图摄像机移动 */
    mapCameraMove(rolePos: cc.Vec2) {
        if (rolePos.x > this.com.node.getContentSize().width / 2) {
            if (rolePos.x > (this.com.tiledMap.getMapSize().width * this.com.tiledMap.getTileSize().width) - (this.com.node.getContentSize().width / 2)) {
                this.com.mapCameraNode.x = (this.com.tiledMap.getMapSize().width * this.com.tiledMap.getTileSize().width) - this.com.node.getContentSize().width;
            } else {
                this.com.mapCameraNode.x = rolePos.x - (this.com.node.getContentSize().width / 2);
            }
        } else {
            this.com.mapCameraNode.x = 0;
        }
    }

    dispatchEvent(event: any) {
        for (let index = 0; index < this._eventList.length; index++) {
            if (this._eventList[index] && this._eventList[index]['onEvent']) {
                this._eventList[index]['onEvent'](event);
            }
        }
        this._eventList
    }

}
