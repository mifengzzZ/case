// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import PosUtil from "../../convertUtils/PosUtil";
import EnemyObjPoolMgr from "../pool/EnemyObjPoolMgr";

enum ENEMY_RUN_TRACK {
    /** 范围内来回运动 */
    SCOPE,
};

enum ENEMY_STATE {
    /** 存活 */
    DEFAULT,
    /** 死亡 */
    DEATH,
};

const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {

    private _anim: cc.Animation = null;
    private _barrierLayer: cc.TiledLayer = null;
    private _blockLayer: cc.TiledLayer = null;
    private _tiledMap: cc.TiledMap = null;

    private _runTrack: ENEMY_RUN_TRACK = ENEMY_RUN_TRACK.SCOPE;
    @property({ type: cc.Enum(ENEMY_RUN_TRACK), tooltip: CC_DEV && '敌人运行轨迹类型: \nSCOPE-平行来回移动' })
    set runTrack(val: ENEMY_RUN_TRACK) {
        this._runTrack = val;
    }
    get runTrack(): ENEMY_RUN_TRACK {
        return this._runTrack;
    }

    @property private _speedY: number = 0;
    @property({ tooltip: CC_DEV && 'Y移动速度' })
    set speedY(v: number) {
        this._speedY = v;
    }
    get speedY(): number {
        return this._speedY;
    }

    @property private _speedX: number = 0;
    @property({ tooltip: CC_DEV && 'X移动速度' })
    set speedX(v: number) {
        this._speedX = v;
    }
    get speedX(): number {
        return this._speedX;
    }

    private _state: ENEMY_STATE = ENEMY_STATE.DEFAULT;
    set state(v: ENEMY_STATE) {
        this._state = v;
    }
    get state(): ENEMY_STATE {
        return this._state;
    }

    onLoad() {
        this._anim = this.node.getComponent(cc.Animation);
    }

    start() {
        this.startAnim();
        this.patrol();
    }

    /**
     * 保存阻挡根节点
     */
    setTiledMapInfo(tiledMap: cc.TiledMap, barrier: cc.TiledLayer, block: cc.TiledLayer) {
        this._barrierLayer = barrier;
        this._blockLayer = block;
        this._tiledMap = tiledMap;
    }

    private startAnim() {
        this._anim.play('beetle_run', 1);
    }

    private patrol() {
        if (this.runTrack === ENEMY_RUN_TRACK.SCOPE) {

        }
    }

    private deathX(tilePoint: cc.Vec2) {
        this.state = ENEMY_STATE.DEATH;
        let off = tilePoint.x < 0 ? -this.node.getContentSize().width / 2 : this.node.getContentSize().width / 2;
        this.node.x += off;
        EnemyObjPoolMgr.ins.put(this.node);
    }

    private deathY(tilePoint: cc.Vec2) {
        this.state = ENEMY_STATE.DEATH;
        this.node.y -= this.node.getContentSize().height;
        EnemyObjPoolMgr.ins.put(this.node);
    }

    // onCollisionEnter(other, self) {
    //     console.log(other, self);
    // }

    private run() {
        if (this.node.scale > 0) {
            this.node.x -= this.speedX;
        } else {
            this.node.x += this.speedX;
        }
    }

    update(dt) {
        if (this.state === ENEMY_STATE.DEATH) return;

        let y: number = this.node.y;
        let x: number = this.node.x;
        let tilePoint = PosUtil.openglToTile(this._tiledMap, cc.v2(x, y));

        if (tilePoint.y < this._tiledMap.getMapSize().height) {
            if (tilePoint.x >= 0 && tilePoint.x < this._tiledMap.getMapSize().width) {
                let gidY = this._barrierLayer.getTileGIDAt(tilePoint);
                if (gidY === 0) {
                    this.node.y -= this.speedY;
                }
            }
        } else {
            this.deathY(tilePoint);
        }

        if (this.state === ENEMY_STATE.DEFAULT) {
            if (tilePoint.x >= 0 && tilePoint.x < this._tiledMap.getMapSize().width) {
                tilePoint.y += -1;
                let gidX = this._blockLayer.getTileGIDAt(tilePoint);
                if (gidX === 0) {
                    this.run();
                } else {
                    this.node.scaleX = this.node.scaleX === 1 ? -1 : 1;
                    this.run();
                }
            } else {
                this.deathX(tilePoint);
            }
        }
    }
}
