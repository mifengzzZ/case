import { ROLE_STATE } from "../RoleState";
import PosUtil from "../../convertUtils/PosUtil";
import GameControl from "../GameControl";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html



const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    /** 动画根节点 */
    @property({ type: cc.Node, tooltip: CC_DEV && '动画根节点' })
    animRoot: cc.Node = null;

    /** 状态 */
    private _state: ROLE_STATE = ROLE_STATE.IDLE;
    public get state(): ROLE_STATE {
        return this._state;
    }

    /** 所有动画列表 */
    private _clipList: Array<cc.AnimationClip> = [];

    /** 移动速度 */
    private _speedArr: Array<cc.Vec2> = [cc.v2(0, 0), cc.v2(-6.5, 0), cc.v2(6.5, 0)];
    private _speed: cc.Vec2 = this._speedArr[0];
    public set speed(v: cc.Vec2) {
        this._speed = v;
    }
    public get speed(): cc.Vec2 {
        return this._speed;
    }

    /** 角色自由落体速度 */
    @property
    private _speedY: number = 0;
    @property({ tooltip: CC_DEV && '角色自由落体速度' })
    public set speedY(v: number) {
        this._speedY = v;
    }
    public get speedY(): number {
        return this._speedY;
    }

    /** 角色跳跃高度 */
    @property
    private _jumpH: number = 0;
    @property({ tooltip: CC_DEV && '角色跳跃高度' })
    public set jumpH(v: number) {
        this._jumpH = v;
    }
    public get jumpH(): number {
        return this._jumpH;
    }

    /** 当前阶段跳 */
    private _stageCount: number = 0;
    public set stageCount(v: number) {
        this._stageCount = v;
    }
    public get stageCount(): number {
        return this._stageCount;
    }

    /** 跑步状态下出现灰尘的计时 */
    private _smoke: number = 0;

    /** 记录是否腾空过,用于落地灰尘 */
    private _vacate: boolean = false;

    onLoad() {
    }

    start() {
        this._clipList = this.animRoot.getComponent(cc.Animation).getClips();
        this.setState(ROLE_STATE.IDLE);
    }

    setState(state: ROLE_STATE) {
        this._state = state;
        switch (state) {
            case ROLE_STATE.IDLE:
                this.idle();
                break;
            case ROLE_STATE.WALK:
                this.walk();
                break;
            case ROLE_STATE.RUN:
                this.run();
                break;
            case ROLE_STATE.JUMP:
                this.jump();
                break;
            case ROLE_STATE.ATTACK:
                this.attack();
                break;
        }
    }

    private idle() {
        this.animRoot.getComponent(cc.Sprite).spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/player/role'].getSpriteFrame('4');
        this.animRoot.getComponent(cc.Animation).play(this._clipList[0].name);
    }

    private walk() {
    }

    private run() {
        this.animRoot.getComponent(cc.Animation).play(this._clipList[2].name);
    }

    private jump() {
        this.animRoot.getComponent(cc.Animation).stop();
        this.animRoot.getComponent(cc.Sprite).spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/player/role'].getSpriteFrame('3');
        let t = cc.tween;
        cc.audioEngine.playEffect(GameControl.ins.sRes['tiledmap/caimogu/music/effect/Jump'], false);
        let jump = t().by(0.3, { y: this.jumpH }, { easing: 'quartOut' });
        cc.tween(this.node).then(jump).call(() => {
            this._state = ROLE_STATE.FALL;
            this.animRoot.getComponent(cc.Sprite).spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/player/role'].getSpriteFrame('4');
        }).start();
    }

    private attack() {
    }

    /** 跑动时的灰尘动画 */
    private smokeAnim() {
        let node = cc.instantiate(GameControl.ins.sRes['tiledmap/caimogu/dust/duskSign']);
        let x = this.node.x - this.animRoot.getContentSize().width / 2 - 10;
        if (this.node.scaleX === -1) {
            x = this.node.x + this.animRoot.getContentSize().width / 2 + 10;
        }
        node.setPosition(x, this.node.y + 10);
        GameControl.ins.floorEffectTop.node.addChild(node);
    }

    /** 落地时的灰尘动画 */
    private smokeLandAnim() {
        cc.audioEngine.playEffect(GameControl.ins.sRes['tiledmap/caimogu/music/effect/Land'], false);
        let node = cc.instantiate(GameControl.ins.sRes['tiledmap/caimogu/dust/duskLand']);
        node.setPosition(this.node.x, this.node.y);
        GameControl.ins.floorEffectDown.node.addChild(node);
    }

    /** 二阶跳腾空动画 */
    private smokeSkyAnim() {
        let node = cc.instantiate(GameControl.ins.sRes['tiledmap/caimogu/dust/duskSky']);
        node.setPosition(this.node.x, this.node.y);
        GameControl.ins.floorEffectTop.node.addChild(node);
    }

    onCollisionEnter(other, self) {
        switch (other.node.group) {
            case 'topblock':
                this.animRoot.getComponent(cc.Animation).stop();
                this.node.stopAllActions();
                this._state = ROLE_STATE.FALL;
                this.animRoot.getComponent(cc.Sprite).spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/player/role'].getSpriteFrame('4');
                break;
        }

    }

    customUpdate(dt) {
        if (this._state === ROLE_STATE.DEATH) return;

        // 更新角色X移动(前方是否有阻挡)
        let off: cc.Vec2 = this.node.getPosition().add(this.speed);
        let moveEndTilePoint = PosUtil.openglToTile(GameControl.ins.com.tiledMap, cc.v2(off.x, off.y));
        if (moveEndTilePoint.x > 0 && moveEndTilePoint.x < GameControl.ins.com.tiledMap.getMapSize().width) {
            if (moveEndTilePoint.y > -1 && moveEndTilePoint.y < GameControl.ins.com.tiledMap.getMapSize().height) {
                let gidX = GameControl.ins.blockLayer.getTileGIDAt(moveEndTilePoint);
                if (gidX === 0) {
                    this.node.setPosition(off);
                    GameControl.ins.mapCameraMove(this.node.getPosition());
                }
            }
        }

        if (this._state === ROLE_STATE.JUMP) return;
        // 角色自由掉落
        let x: number = this.node.x;
        let y: number = this.node.y;
        let tilePoint = PosUtil.openglToTile(GameControl.ins.com.tiledMap, cc.v2(x, y));
        if (tilePoint.y > -1 && tilePoint.y < GameControl.ins.com.tiledMap.getMapSize().height) {
            if (tilePoint.x >= 0 && tilePoint.x < GameControl.ins.com.tiledMap.getMapSize().width) {
                let gidY = GameControl.ins.barrierLayer.getTileGIDAt(tilePoint);
                if (gidY === 0) {
                    if (this.animRoot.getComponent(cc.Sprite).spriteFrame.name !== '4') {
                        this.animRoot.getComponent(cc.Sprite).spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/player/role'].getSpriteFrame('4');
                    }
                    this.node.y -= this.speedY;
                    if (!this._vacate) {
                        this._vacate = true;
                    }
                } else {
                    // 修正Y的值,有可能出现-this.speedY过多导致在地表里行走
                    let openglPoint = PosUtil.tileToOpengl(GameControl.ins.com.tiledMap, tilePoint);
                    openglPoint.y += GameControl.ins.com.tiledMap.getTileSize().height / 2;
                    this.node.y = openglPoint.y;
                    // ---
                    // 如果处于跳跃状态,落地之后需要变回站立状态
                    if (this._state === ROLE_STATE.FALL) {
                        this.stageCount = 0;
                        if (this.speed.x === 0) {
                            this.setState(ROLE_STATE.IDLE);
                        } else {
                            this.setState(ROLE_STATE.RUN);
                        }
                        GameControl.ins.gravel = false;
                    }
                    if (this._vacate) {
                        this.smokeLandAnim();
                        this._vacate = false;
                    }
                }
            }
        } else {
            this._state = ROLE_STATE.DEATH;
            this.node.active = false;
            GameControl.ins.gameOver();
        }

        if (this._state === ROLE_STATE.RUN) {
            this._smoke += 0.1;
            if (this._smoke > 1) {
                this.smokeAnim();
                this._smoke = 0;
            }
        } else {
            this._smoke = 0;
        }
    }

    onEvent(event: any) {
        switch (event['state']) {
            case ROLE_STATE.RUN:
                if (event['dir'] === 1) {
                    this.node.scaleX = -1;
                } else if (event['dir'] === 2) {
                    this.node.scaleX = 1;
                }
                // 如果此时处于跳跃或者落体状态,只能修改方向和数值,不能改变状态
                if (this._state !== ROLE_STATE.JUMP && this._state !== ROLE_STATE.FALL) {
                    if (event['dir'] === 0) {
                        this.setState(ROLE_STATE.IDLE);
                    } else {
                        this.setState(ROLE_STATE.RUN);
                    }
                }
                this.speed = this._speedArr[event['dir']];
                break;
            case ROLE_STATE.JUMP:
                if (this.stageCount < 2) {
                    this.stageCount += 1;
                    if (this.stageCount === 2) {
                        this.smokeSkyAnim();
                    }
                    this.setState(ROLE_STATE.JUMP);
                }
                break;
            case ROLE_STATE.HEADIMPACT:
                this.animRoot.getComponent(cc.Animation).stop();
                this.node.stopAllActions();
                this._state = ROLE_STATE.FALL;
                this.animRoot.getComponent(cc.Sprite).spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/player/role'].getSpriteFrame('4');
                break;
        }
    }

}
