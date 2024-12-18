import SchedulerMgr from "../extensions/SchedulerMgr";
import HpLabelLayer from "./HpLabelLayer";
import RoleLayer from "./RoleLayer";
import { SPINE_EVENT_TYPE_TRACK_INDEX, SPINE_ROLE_ANIM_TYPE, SPINE_EVENT_NAME, SPINE_BATTCK_PLAY_TYPE, SPINE_ATTACK_STAGE } from "./SpineCfg";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BattleLayer extends cc.Component {

    // @property
    // protected _radius: number = 350;
    // @property({tooltip: '半径'})
    // public get radius(): number {
    //     return this._radius;
    // }
    // public set radius(v: number) {
    //     this._radius = v;
    // }

    /** 战斗场景各层级 */
    @property({ type: cc.Node, tooltip: '地图层' })
    mapLayer: cc.Node = null;
    @property({ type: cc.Node, tooltip: '角色层' })
    roleLayer: cc.Node = null;
    @property({ type: cc.Node, tooltip: '技能效果层' })
    skillEffectLayer: cc.Node = null;
    @property({ type: cc.Node, tooltip: '文字效果层' })
    hpLabelLayer: cc.Node = null;

    @property({ type: cc.Node, tooltip: '测试' })
    ceshi: cc.Node = null;

    /** 开始动画根节点 */
    @property(cc.Node)
    protected startRoot: cc.Node = null;

    /** 8 : 0 - 3 已方 4 - 7 敌方 */
    @property([cc.Node])
    protected heroArray: Array<cc.Node> = [];

    @property(cc.Node)
    backBtn: cc.Node = null;

    @property(cc.Node)
    startBtn: cc.Node = null;
    @property(cc.Node)
    stopBtn: cc.Node = null;
    @property(cc.Node)
    speedBtn: cc.Node = null;

    /** 当前播放的回合 */
    private _curFrameIdx: number = 0;
    /** 当前播放的帧数据 */
    private _frame: ss.Battle_spine_frame = null;
    /** 攻击者初始位置 */
    private _initPoint: cc.Vec2 = null;
    /** 播放速率 */
    private _speed: number = 0.8;
    /** 移动时间 */
    private _runTime: number = 0.25;
    /** 保存当前播放的状态 */
    private _playVideoState: number = -1;
    /** 角色是否已移动到其它层 */
    private _roleNodeMove: boolean = false;
    /** AOE hit效果只需添加一次 */
    private _hitAoeEffect: boolean = false;

    /** 回合数据 */
    private _frames: Array<ss.Battle_spine_frame> = [
        // 阿修罗
        // {
        //     attackindex: [0], bAttackindexList: [4],
        //     skill: {
        //         attackRoleOff: { offx: 10, offy: 20 },
        //         attackType: 0, attackName: 'attack', attackEffect: { path: 'AXiuLuo/AXiuLuo_attack' },
        //         hitEffect: { state: 0, path: 'AXiuLuo/AXiuLuo_attack_hit' },
        //         scene: { state: -1, },
        //         sceneBg: { state: -1, },
        //         mask: { state: -1, }
        //     }
        // },
        // {
        //     attackindex: [0], bAttackindexList: [4],
        //     skill: {
        //         attackType: 2, attackName: 'skill1', attackEffect: { path: 'AXiuLuo/AXiuLuo_skill1' },
        //         hitEffect: { state: 0, },
        //         scene: { state: 1, path: 'AXiuLuo/AXiuLuo_skill1_screen' },
        //         sceneBg: { state: 0, },
        //         mask: { state: 0, }
        //     }
        // },
        {
            attackindex: [0], bAttackindexList: [4],
            skill: {
                attackType: 5, attackName: 'skill2', attackEffect: { path: 'AXiuLuo/AXiuLuo_skill2' },
                hitEffect: { state: 0, path: 'AXiuLuo/AXiuLuo_skill2_aoe' },
                scene: { state: 1, path: 'AXiuLuo/AXiuLuo_skill2_screen', offy: 80 },
                sceneBg: { state: 1, path: 'AXiuLuo/AXiuLuo_skill2_screen_di' },
                mask: { state: 1, maskValue: 255 }
            }
        },
    ];

    /**
     * 动态加载的spine资源
     */
    private _loadSpineAssetList: Map<string, string> = new Map();
    private _asset: Map<string, sp.SkeletonData> = new Map();

    onLoad() {
        this.backBtn.on(cc.Node.EventType.TOUCH_END, this.onBack, this);
        this.startBtn.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.stopBtn.on(cc.Node.EventType.TOUCH_END, this.onStop, this);
        this.speedBtn.on(cc.Node.EventType.TOUCH_END, this.onDoubleSpeed, this);


        let tempCount = 0;
        for (let index = 0; index < this._frames.length; index++) {
            const element = this._frames[index];
            if (element.skill.attackEffect.path) {
                this._loadSpineAssetList.set(element.skill.attackEffect.path, 'battle/rolespine/' + element.skill.attackEffect.path);
            }
            if (element.skill.hitEffect.path) {
                this._loadSpineAssetList.set(element.skill.hitEffect.path, 'battle/rolespine/' + element.skill.hitEffect.path);
            }
            if (element.skill.scene.path) {
                this._loadSpineAssetList.set(element.skill.scene.path, 'battle/rolespine/' + element.skill.scene.path);
            }
            if (element.skill.sceneBg.path) {
                this._loadSpineAssetList.set(element.skill.sceneBg.path, 'battle/rolespine/' + element.skill.sceneBg.path);
            }
        }

        let count = this._loadSpineAssetList.size;
        this._loadSpineAssetList.forEach((value: string, key: string) => {
            try {
                //避免进度倒车现象!
                let lastProgres: number = 0;
                cc.assetManager.loadAny({ dir: value, type: sp.SkeletonData, bundle: "resources" }, (finished: number, total: number, item: cc.AssetManager.RequestItem) => {
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
                }, (err: Error, asset: sp.SkeletonData) => {
                    this._asset.set(key, asset);
                    tempCount += 1;
                    if (tempCount === count) {
                        console.log('加载完成 : ', this._asset);
                    }
                });
            } catch (e) {
                console.log("资源加载出现异常 : ", e);
            }
        });
    }

    start() {
        this.startRoot.active = false;
    }

    /** 开始动画 */
    protected startAnim() {
        if (this.startRoot.active) {
            return;
        }
        this.startRoot.getChildByName('ChuZhan').active = false;
        this.startRoot.getChildByName('ChuZhan_Text').active = false;
        this.startRoot.active = true;

        let skeleton: sp.Skeleton = this.startRoot.getChildByName('ChuZhan_tx').getComponent(sp.Skeleton);
        let trackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, 'enter', false);
        skeleton.timeScale = this._speed;
        this.scheduleOnce(() => {
            this.startRoot.getChildByName('ChuZhan').active = true;
            this.startRoot.getChildByName('ChuZhan_Text').active = true;
            skeleton = this.startRoot.getChildByName('ChuZhan').getComponent(sp.Skeleton);
            trackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.BATTLE_START_ANIM_END, 'enter', false);
            skeleton.setTrackCompleteListener(trackEntry, this.onTrackCompleteListener.bind(this));
            this.startRoot.getChildByName('ChuZhan_Text').getComponent(cc.Animation).play('chuzhanImg');
        }, trackEntry.animationEnd / this._speed - 1);

    }

    protected onBack() {
        cc.director.loadScene('main');
    }

    protected onStart() {
        this.startAnim();
    }

    protected onStop() {
    }

    protected onDoubleSpeed() {
        this._speed = this._speed === 0.8 ? 1.3 : 0.8;
        let str = this._speed === 0.8 ? 1 : 2;
        this.speedBtn.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = 'X' + str.toString();
    }

    /**
     * 监听Spine动画播放结束回调
     */
    protected onTrackCompleteListener(trackEntry: sp.spine.TrackEntry) {
        switch (trackEntry.trackIndex) {
            case SPINE_EVENT_TYPE_TRACK_INDEX.BATTLE_START_ANIM_END:
                this.startRoot.active = false;
                this.startFrames();
                break;
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /**
     * 受攻击特效
     */
    protected hitEffect() {
        for (let index = 0; index < this._frame.bAttackindexList.length; index++) {
            // 受攻击者动画
            let skeleton: sp.Skeleton = this.heroArray[this._frame.bAttackindexList[index]].getComponent(sp.Skeleton);
            let tempTrackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.HIT, false);
            skeleton.timeScale = this._speed;
            this.scheduleOnce(() => {
                skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
            }, tempTrackEntry.animationEnd / this._speed);
            // 受攻击者特效
            if (this._frame.skill.hitEffect.path) {
                // 击中效果只需要添加一次
                if (this._frame.skill.hitEffect.state === 0 && this._hitAoeEffect === false) {
                    let effectNode = this.creatorCarrySkeletonComNode(this._frame.skill.hitEffect.path);
                    effectNode.x = this.heroArray[this._frame.bAttackindexList[index]].getPosition().x;
                    effectNode.y = this.heroArray[this._frame.bAttackindexList[index]].getPosition().y + this.heroArray[this._frame.bAttackindexList[index]].height / 2;
                    this._hitAoeEffect = true;
                    this.setNodeOff(effectNode, this._frame.skill.hitEffect.offx, this._frame.skill.hitEffect.offy);
                    this.skillEffectLayer.addChild(effectNode);
                } else if (this._frame.skill.hitEffect.state === 1) {
                    let effectNode = this.creatorCarrySkeletonComNode(this._frame.skill.hitEffect.path);
                    effectNode.x = this.heroArray[this._frame.bAttackindexList[index]].getPosition().x;
                    effectNode.y = this.heroArray[this._frame.bAttackindexList[index]].getPosition().y + this.heroArray[this._frame.bAttackindexList[index]].height / 2;
                    this.setNodeOff(effectNode, this._frame.skill.hitEffect.offx, this._frame.skill.hitEffect.offy);
                    this.skillEffectLayer.addChild(effectNode);
                }
            }
            // 受攻击者掉血动画
            this.hpLabelLayer.getComponent(HpLabelLayer).addHpEffect(this.heroArray[this._frame.bAttackindexList[index]], -1000);
        }
    }

    /**
     * 监听Spine动画播放时帧事件
     */
    protected onTrackEventListener(trackEntry: sp.spine.TrackEntry, event: sp.spine.Event) {
        console.log('event.data.name : ', event.data.name);
        switch (event.data.name) {
            case SPINE_EVENT_NAME.ATTACK_HIT:
                this.hitEffect();
                break;
            case 'attackHit':
            case 'skill1Hit_tx':
            case 'skill1_2Hit':
            case 'skill2_2Hit':
            case 'skill2_3Hit':
            case 'skill2_4Hit':
            case 'skill2_5Hit':
            case 'skill2_6Hit':
            case 'skill2_7Hit':
            case 'skill2_8Hit':
            case 'skill2Hit':
            case 'skill1Hit':
                this.hitEffect();
                break;
            case SPINE_EVENT_NAME.ATTACK_1HIT:
            case 'skill1_1Hit_tx':
            case 'skill2_1Hit_tx':
                this.hitEffect();
                break;
        }
    }

    /**
     * 创建一个带sp.Skeleton组件的节点
     */
    creatorCarrySkeletonComNode(path: string): cc.Node {
        let node = new cc.Node();
        let skelCom: sp.Skeleton = node.addComponent(sp.Skeleton);
        skelCom.skeletonData = this._asset.get(path);
        skelCom.loop = false;
        skelCom.timeScale = this._speed;
        skelCom.premultipliedAlpha = false;
        skelCom.animation = 'animation';
        // 我方需翻转
        if (this._frame.attackindex[0] <= 3) {
            node.scaleX = -1;
        }
        return node;
    }

    /**
     * 播放跑动动画
     */
    protected playRoleRunAnim(node: cc.Node, x: number, y: number) {
        this._playVideoState = SPINE_ATTACK_STAGE.ROLE_RUN_STATE; 1
        this.checkAddPanoramicEff();
        this._initPoint = node.getPosition();
        let skeleton = node.getComponent(sp.Skeleton);
        skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.RUN, true);
        skeleton.timeScale = this._speed;
        cc.tween(node).to(this._runTime / this._speed, { x: x, y: y })
            .call(() => {
                this.playAttack();
            })
            .start();
    }

    /**
     * 检测是否需要添加其它全景效果
     */
    protected checkAddPanoramicEff() {
        if (this._frame.skill.mask.state === this._playVideoState) {
            this.roleNodeMoveFromParent(this.skillEffectLayer);
            // 遮罩Role
            this.roleLayer.getComponent(RoleLayer).setMaskColorVis(true, this._frame.skill.mask.maskValue);
        }
        if (this._frame.skill.scene.state === this._playVideoState) {
            // 全景效果
            if (this._frame.skill.scene.path) {
                let node: cc.Node = this.creatorCarrySkeletonComNode(this._frame.skill.scene.path);
                this.setNodeOff(node, this._frame.skill.scene.offx, this._frame.skill.scene.offy);
                this.skillEffectLayer.addChild(node);
            }
        }
        if (this._frame.skill.sceneBg.state === this._playVideoState) {
            this.roleNodeMoveFromParent(this.skillEffectLayer);
            if (this._frame.skill.sceneBg.path) {
                // 全屏背景效果
                let node = this.creatorCarrySkeletonComNode(this._frame.skill.sceneBg.path);
                node.scale = 1.6;
                node.zIndex = -999;
                this.setNodeOff(node, this._frame.skill.sceneBg.offx, this._frame.skill.sceneBg.offy);
                this.skillEffectLayer.addChild(node);
            }
        }
    }

    /**
     * 角色移动到其它目标节点
     */
    protected roleNodeMoveFromParent(parent: cc.Node) {
        if (this._roleNodeMove === false) {
            // 将攻击者与被攻击者加入特效层
            for (let index = 0; index < this._frame.attackindex.length; index++) {
                this.heroArray[this._frame.attackindex[index]].removeFromParent(false);
                parent.addChild(this.heroArray[this._frame.attackindex[index]]);
            }
            for (let index = 0; index < this._frame.bAttackindexList.length; index++) {
                this.heroArray[this._frame.bAttackindexList[index]].removeFromParent(false);
                parent.addChild(this.heroArray[this._frame.bAttackindexList[index]]);
            }
            this._roleNodeMove = true;
        }
    }

    /** 播放Frames */
    protected startFrames() {
        if (this._frames.length > 0 && this._frames.length > this._curFrameIdx) {
            this._frame = this._frames[this._curFrameIdx];
            switch (this._frame.skill.attackType) {
                case SPINE_BATTCK_PLAY_TYPE.NEAR_ATTACK:
                case SPINE_BATTCK_PLAY_TYPE.SIGN_NEAR_SKILL:
                    this.playRoleRunAnim(this.heroArray[this._frame.attackindex[0]],
                        this.getAttackRoleOff(this.heroArray[this._frame.bAttackindexList[0]].x - this.heroArray[this._frame.bAttackindexList[0]].width / 2 - 100),
                        this.heroArray[this._frame.bAttackindexList[0]].y);
                    break;
                case SPINE_BATTCK_PLAY_TYPE.REMOTE_ATTACK:
                case SPINE_BATTCK_PLAY_TYPE.AOR_REMOTE_SKILL:
                    this.playAttack();
                    break;
                case SPINE_BATTCK_PLAY_TYPE.AOE_CENTER_SKILL:
                    this.playRoleRunAnim(this.heroArray[this._frame.attackindex[0]], this.getAttackRoleOff(0), this.getAttackRoleOff(0));
                    break;
            }
        }
    }

    /** 获取攻击角色的偏移量 */
    getAttackRoleOff(off: number): number {
        if (this._frame.skill.attackRoleOff) {
            if (this._frame.skill.attackRoleOff.offx) {
                off += this._frame.skill.attackRoleOff.offx;
            }
            if (this._frame.skill.attackRoleOff.offy) {
                off += this._frame.skill.attackRoleOff.offy;
            }
        }
        return off;
    }

    /** 播放攻击动画 */
    protected playAttack() {
        this._playVideoState = SPINE_ATTACK_STAGE.ROLE_ATTACK_STATE;
        this.checkAddPanoramicEff();
        // 攻击
        let skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
        let trackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, this._frame.skill.attackName, false);
        skeleton.setTrackEventListener(trackEntry, this.onTrackEventListener.bind(this));
        skeleton.timeScale = this._speed;
        this.scheduleOnce(() => {
            if (this.roleLayer.getComponent(RoleLayer).getMaskColorVis()) {
                // 隐藏遮挡角色蒙层
                this.roleLayer.getComponent(RoleLayer).setMaskColorVis(false);
            }
            // 是否需要回跳
            if (this._frame.skill.attackType === SPINE_BATTCK_PLAY_TYPE.NEAR_ATTACK || this._frame.skill.attackType === SPINE_BATTCK_PLAY_TYPE.SIGN_NEAR_SKILL || this._frame.skill.attackType === SPINE_BATTCK_PLAY_TYPE.AOE_CENTER_SKILL) {
                // 攻击者播放回跳动画回到初始位置
                let skeleton: sp.Skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
                let tempTrackEntry2: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.JUMP2, false);
                skeleton.timeScale = this._speed;
                cc.tween(this.heroArray[this._frame.attackindex[0]]).to(tempTrackEntry2.animationEnd / this._speed, { x: this._initPoint.x, y: this._initPoint.y })
                    .call(() => {
                        this.nextBattle();
                    })
                    .start();
            } else {
                this.nextBattle();
            }
        }, trackEntry.animationEnd / this._speed + 0.5);

        // 是否有攻击特效
        if (this._frame.skill.attackEffect) {
            let effectNode = this.creatorCarrySkeletonComNode(this._frame.skill.attackEffect.path);
            effectNode.setPosition(this.heroArray[this._frame.attackindex[0]].getPosition());
            this.setNodeOff(effectNode, this._frame.skill.attackEffect.offx, this._frame.skill.attackEffect.offy);
            this.skillEffectLayer.addChild(effectNode);
        }
    }

    /** 下一帧战斗 */
    nextBattle() {
        this._playVideoState = SPINE_ATTACK_STAGE.DEFAULT;
        if (this._roleNodeMove === true) {
            this._roleNodeMove = false;
            this.roleNodeMoveFromParent(this.roleLayer);
        }
        this.clearAllEffectAndLabelLayer();
        let skeleton: sp.Skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
        skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
        skeleton.timeScale = this._speed;
        this._curFrameIdx += 1;
        this.startFrames();
    }

    /** 设置偏移量 */
    setNodeOff(node: cc.Node, x: number, y: number) {
        if (x) {
            node.x += x;
        }
        if (y) {
            node.y += y;
        }
    }

    /** 清除特效层与文字层、一些临时存储的变量值 */
    clearAllEffectAndLabelLayer() {
        this.skillEffectLayer.removeAllChildren();
        this.hpLabelLayer.removeAllChildren();
        this._hitAoeEffect = false;
    }

}
