import SchedulerMgr from "../extensions/SchedulerMgr";
import HpLabelLayer from "./HpLabelLayer";
import RoleLayer from "./RoleLayer";
import { SPINE_EVENT_TYPE_TRACK_INDEX, SPINE_ROLE_ANIM_TYPE, SPINE_EVENT_NAME, SPINE_BATTLE_PLAY_TYPE } from "./SpineCfg";

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

    /** 回合数据 */
    private _frames: Array<ss.Battle_spine_frame> = [
        // 阿修罗
        // { attackindex: [0], bAttackindexList: [4], skill: { actType: 0, act: 'attack', attackEffect: 'AXiuLuo_attack', hitEffect: 'AXiuLuo_attack_hit', sceneEffect: '' } },
        // { attackindex: [0], bAttackindexList: [4], skill: { actType: 0, act: 'skill1', attackEffect: 'AXiuLuo_skill1', hitEffect: '', sceneEffect: 'AXiuLuo_skill1_screen' } },
        // { attackindex: [0], bAttackindexList: [4], skill: { actType: 2, act: 'skill2', attackEffect: 'AXiuLuo_skill2', hitEffect: 'AXiuLuo_skill2_aoe', sceneEffect: 'AXiuLuo_skill2_screen', sceneBgEffect: 'AXiuLuo_skill2_screen_di' } },

        // 布兰德
        // { attackindex: [1], bAttackindexList: [4], skill: { actType: 1, act: 'skill1', attackEffect: 'BuLanDe_skill1', hitEffect: 'BuLanDe_skill1_hit', sceneEffect: 'BuLanDe_skill1_screen' } },
        { attackindex: [1], bAttackindexList: [4], skill: { actType: 3, act: 'skill2', attackEffect: 'BuLanDe_skill2', hitEffect: 'BuLanDe_skill2_hit_aoe', sceneEffect: 'BuLanDe_skill2_screen', sceneBgEffect: '' } },
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

        // 阿修罗
        this._loadSpineAssetList.set('AXiuLuo_attack', 'battle/rolespine/AXiuLuo/AXiuLuo_attack');
        this._loadSpineAssetList.set('AXiuLuo_attack_hit', 'battle/rolespine/AXiuLuo/AXiuLuo_attack_hit');
        this._loadSpineAssetList.set('AXiuLuo_skill1', 'battle/rolespine/AXiuLuo/AXiuLuo_skill1');
        this._loadSpineAssetList.set('AXiuLuo_skill1_screen', 'battle/rolespine/AXiuLuo/AXiuLuo_skill1_screen');
        this._loadSpineAssetList.set('AXiuLuo_skill2', 'battle/rolespine/AXiuLuo/AXiuLuo_skill2');
        this._loadSpineAssetList.set('AXiuLuo_skill2_aoe', 'battle/rolespine/AXiuLuo/AXiuLuo_skill2_aoe');
        this._loadSpineAssetList.set('AXiuLuo_skill2_screen', 'battle/rolespine/AXiuLuo/AXiuLuo_skill2_screen');
        this._loadSpineAssetList.set('AXiuLuo_skill2_screen_di', 'battle/rolespine/AXiuLuo/AXiuLuo_skill2_screen_di');

        // 布兰德
        this._loadSpineAssetList.set('BuLanDe_attack', 'battle/rolespine/BuLanDe/BuLanDe_attack');
        this._loadSpineAssetList.set('BuLanDe_attack_hit', 'battle/rolespine/BuLanDe/BuLanDe_attack_hit');
        this._loadSpineAssetList.set('BuLanDe_skill1', 'battle/rolespine/BuLanDe/BuLanDe_skill1');
        this._loadSpineAssetList.set('BuLanDe_skill1_hit', 'battle/rolespine/BuLanDe/BuLanDe_skill1_hit');
        this._loadSpineAssetList.set('BuLanDe_skill1_screen', 'battle/rolespine/BuLanDe/BuLanDe_skill1_screen');

        this._loadSpineAssetList.set('BuLanDe_skill2', 'battle/rolespine/BuLanDe/BuLanDe_skill2');
        this._loadSpineAssetList.set('BuLanDe_skill2_hit_aoe', 'battle/rolespine/BuLanDe/BuLanDe_skill2_hit_aoe');
        this._loadSpineAssetList.set('BuLanDe_skill2_screen', 'battle/rolespine/BuLanDe/BuLanDe_skill2_screen');


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
        }, trackEntry.animationEnd / this._speed);

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

    /**
     * 监听Spine动画播放时帧事件
     */
    protected onTrackEventListener(trackEntry: sp.spine.TrackEntry, event: sp.spine.Event) {
        console.log('event.data.name : ', event.data.name);
        switch (event.data.name) {
            case SPINE_EVENT_NAME.ATTACK_HIT:
                // 受攻击者动画
                let skeleton: sp.Skeleton = this.heroArray[this._frame.bAttackindexList[0]].getComponent(sp.Skeleton);
                let tempTrackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.HIT, false);
                skeleton.timeScale = this._speed;
                this.scheduleOnce(() => {
                    skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
                }, tempTrackEntry.animationEnd / this._speed);
                // 受攻击者特效
                if (this._frame.skill.hitEffect !== '') {
                    let effectNode = new cc.Node();
                    let skelCom: sp.Skeleton = effectNode.addComponent(sp.Skeleton);
                    skelCom.skeletonData = this._asset.get(this._frame.skill.hitEffect);
                    skelCom.loop = false;
                    skelCom.timeScale = this._speed;
                    skelCom.premultipliedAlpha = false;
                    skelCom.animation = 'animation';
                    this.skillEffectLayer.addChild(effectNode);
                    effectNode.scaleX = -1;
                    effectNode.x = this.heroArray[this._frame.bAttackindexList[0]].getPosition().x;
                    effectNode.y = this.heroArray[this._frame.bAttackindexList[0]].getPosition().y + this.heroArray[this._frame.bAttackindexList[0]].height / 2;
                }
                // 受攻击者掉血动画
                this.hpLabelLayer.getComponent(HpLabelLayer).addHpEffect(this.heroArray[this._frame.bAttackindexList[0]], -1000);
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
                // 受攻击者动画
                let skeleton4: sp.Skeleton = this.heroArray[this._frame.bAttackindexList[0]].getComponent(sp.Skeleton);
                let tempTrackEntry4: sp.spine.TrackEntry = skeleton4.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.HIT, false);
                skeleton4.timeScale = this._speed;
                this.scheduleOnce(() => {
                    skeleton4.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
                }, tempTrackEntry4.animationEnd / this._speed);
                // 受攻击者掉血动画
                this.hpLabelLayer.getComponent(HpLabelLayer).addHpEffect(this.heroArray[this._frame.bAttackindexList[0]], -1000);
                break;
            case SPINE_EVENT_NAME.ATTACK_1HIT:
            case 'skill1_1Hit_tx':
            case 'skill2_1Hit_tx':
                // 受攻击者动画
                let skeleton3: sp.Skeleton = this.heroArray[this._frame.bAttackindexList[0]].getComponent(sp.Skeleton);
                let tempTrackEntry3: sp.spine.TrackEntry = skeleton3.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.HIT, false);
                skeleton3.timeScale = this._speed;
                this.scheduleOnce(() => {
                    skeleton3.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
                }, tempTrackEntry3.animationEnd / this._speed);
                // 受攻击者特效
                if (this._frame.skill.hitEffect !== '') {
                    let effectNode2 = new cc.Node();
                    let skelCom2: sp.Skeleton = effectNode2.addComponent(sp.Skeleton);
                    skelCom2.skeletonData = this._asset.get(this._frame.skill.hitEffect);
                    skelCom2.loop = false;
                    skelCom2.timeScale = this._speed;
                    skelCom2.premultipliedAlpha = false;
                    skelCom2.animation = 'animation';
                    this.skillEffectLayer.addChild(effectNode2);
                    effectNode2.scaleX = -1;
                    effectNode2.x = this.heroArray[this._frame.bAttackindexList[0]].getPosition().x;
                    effectNode2.y = this.heroArray[this._frame.bAttackindexList[0]].getPosition().y + this.heroArray[this._frame.bAttackindexList[0]].height / 2;
                }
                // 受攻击者掉血动画
                this.hpLabelLayer.getComponent(HpLabelLayer).addHpEffect(this.heroArray[this._frame.bAttackindexList[0]], -1000);
                break;
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /** 播放Frames */
    protected startFrames() {
        if (this._frames.length > 0 && this._frames.length > this._curFrameIdx) {
            this._frame = this._frames[this._curFrameIdx];
            switch (this._frame.skill.actType) {
                case SPINE_BATTLE_PLAY_TYPE.ATTACK:
                    // 执行跑动动画->位置移动动画->开始攻击
                    this._initPoint = this.heroArray[this._frame.attackindex[0]].getPosition();
                    let skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
                    skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.RUN, true);
                    skeleton.timeScale = this._speed;
                    cc.tween(this.heroArray[this._frame.attackindex[0]]).to(0.25 / this._speed, { x: this.heroArray[this._frame.bAttackindexList[0]].x - this.heroArray[this._frame.bAttackindexList[0]].width / 2 - 100, y: this.heroArray[this._frame.bAttackindexList[0]].y })
                        .call(() => {
                            this.playAttack();
                        })
                        .start();
                    break;
                case SPINE_BATTLE_PLAY_TYPE.NEAR_SCENE_SKILL:
                    // 将攻击者与被攻击者加入特效层
                    this.heroArray[this._frame.attackindex[0]].removeFromParent(false);
                    this.heroArray[this._frame.bAttackindexList[0]].removeFromParent(false);
                    this.skillEffectLayer.addChild(this.heroArray[this._frame.attackindex[0]]);
                    this.skillEffectLayer.addChild(this.heroArray[this._frame.bAttackindexList[0]]);

                    // 显示遮挡角色蒙层
                    this.roleLayer.getComponent(RoleLayer).setMaskColorVis(true);
                    // 执行跑动动画->位置移动动画->开始攻击
                    this._initPoint = this.heroArray[this._frame.attackindex[0]].getPosition();
                    let skeleton2 = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
                    skeleton2.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.RUN, true);
                    skeleton2.timeScale = this._speed;
                    cc.tween(this.heroArray[this._frame.attackindex[0]]).to(0.25 / this._speed, { x: this.heroArray[this._frame.bAttackindexList[0]].x - this.heroArray[this._frame.bAttackindexList[0]].width / 2 - 100, y: this.heroArray[this._frame.bAttackindexList[0]].y })
                        .call(() => {
                            this.playSkill();
                        })
                        .start();
                    break;
                case SPINE_BATTLE_PLAY_TYPE.INSITU_SCENE_SKILL:

                    if (this._frame.skill.sceneBgEffect !== '') {
                        // 全屏背景特效
                        let effectNode8 = new cc.Node();
                        let skelCom2: sp.Skeleton = effectNode8.addComponent(sp.Skeleton);
                        skelCom2.skeletonData = this._asset.get(this._frame.skill.sceneBgEffect);
                        skelCom2.loop = false;
                        skelCom2.timeScale = this._speed;
                        skelCom2.premultipliedAlpha = false;
                        skelCom2.animation = 'animation';
                        effectNode8.scaleX = -1;
                        this.skillEffectLayer.addChild(effectNode8);
                        effectNode8.scale = 1.6;
                    }

                    // 将攻击者与被攻击者加入特效层
                    this.heroArray[this._frame.attackindex[0]].removeFromParent(false);
                    this.heroArray[this._frame.bAttackindexList[0]].removeFromParent(false);
                    this.skillEffectLayer.addChild(this.heroArray[this._frame.attackindex[0]]);
                    this.skillEffectLayer.addChild(this.heroArray[this._frame.bAttackindexList[0]]);

                    // 显示遮挡角色蒙层
                    this.roleLayer.getComponent(RoleLayer).setMaskColorVis(true);

                    this.playSkill2();
                    break;
                case SPINE_BATTLE_PLAY_TYPE.CENTER_SCENE_SKILL:
                    // 执行跑动动画->位置移动动画->开始攻击
                    this._initPoint = this.heroArray[this._frame.attackindex[0]].getPosition();

                    let skeleton3 = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
                    skeleton3.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.RUN, true);
                    skeleton3.timeScale = this._speed;
                    cc.tween(this.heroArray[this._frame.attackindex[0]]).to(0.25 / this._speed, { x: 0, y: -250 })
                        .call(() => {
                            if (this._frame.skill.sceneBgEffect !== '') {
                                // 全屏背景特效
                                let effectNode8 = new cc.Node();
                                let skelCom2: sp.Skeleton = effectNode8.addComponent(sp.Skeleton);
                                skelCom2.skeletonData = this._asset.get(this._frame.skill.sceneBgEffect);
                                skelCom2.loop = false;
                                skelCom2.timeScale = this._speed;
                                skelCom2.premultipliedAlpha = false;
                                skelCom2.animation = 'animation';
                                effectNode8.scaleX = -1;
                                this.skillEffectLayer.addChild(effectNode8);
                                effectNode8.scale = 1.6;
                            }

                            // 将攻击者与被攻击者加入特效层
                            this.heroArray[this._frame.attackindex[0]].removeFromParent(false);
                            this.heroArray[this._frame.bAttackindexList[0]].removeFromParent(false);
                            this.skillEffectLayer.addChild(this.heroArray[this._frame.attackindex[0]]);
                            this.skillEffectLayer.addChild(this.heroArray[this._frame.bAttackindexList[0]]);

                            // 显示遮挡角色蒙层
                            this.roleLayer.getComponent(RoleLayer).setMaskColorVis(true);

                            this.playSkill();
                        })
                        .start();
                    break;
            }
        }
    }

    /** 播放普攻动画 */
    protected playAttack() {
        let skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
        let trackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, this._frame.skill.act, false);
        skeleton.setTrackEventListener(trackEntry, this.onTrackEventListener.bind(this));
        skeleton.timeScale = this._speed;
        this.scheduleOnce(() => {
            // 攻击者播放回跳动画回到初始位置
            let skeleton2: sp.Skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
            let tempTrackEntry2: sp.spine.TrackEntry = skeleton2.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.JUMP2, false);
            skeleton2.timeScale = this._speed;
            cc.tween(this.heroArray[this._frame.attackindex[0]]).to(tempTrackEntry2.animationEnd / this._speed, { x: this._initPoint.x, y: this._initPoint.y })
                .call(() => {
                    this.clearAllEffectAndLabelLayer();
                    skeleton2.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
                    this._curFrameIdx += 1;
                    this.startFrames();
                })
                .start();
        }, trackEntry.animationEnd / this._speed);
        if (this._frame.skill.attackEffect !== '') {
            let effectNode = new cc.Node();
            let skelCom: sp.Skeleton = effectNode.addComponent(sp.Skeleton);
            skelCom.skeletonData = this._asset.get(this._frame.skill.attackEffect);
            skelCom.loop = false;
            skelCom.timeScale = this._speed;
            skelCom.defaultAnimation = 'animation';
            skelCom.premultipliedAlpha = false;
            this.skillEffectLayer.addChild(effectNode);
            effectNode.scaleX = -1;
            effectNode.setPosition(this.heroArray[this._frame.attackindex[0]].getPosition());
        }
    }

    /** 近身全屏技能动画 */
    protected playSkill() {
        let skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
        let trackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, this._frame.skill.act, false);
        skeleton.setTrackEventListener(trackEntry, this.onTrackEventListener.bind(this));
        skeleton.timeScale = this._speed;
        this.scheduleOnce(() => {
            // 隐藏遮挡角色蒙层
            this.roleLayer.getComponent(RoleLayer).setMaskColorVis(false);
            // 攻击者播放回跳动画回到初始位置
            let skeleton2: sp.Skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
            let tempTrackEntry2: sp.spine.TrackEntry = skeleton2.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.JUMP2, false);
            skeleton2.timeScale = this._speed;
            cc.tween(this.heroArray[this._frame.attackindex[0]]).to(tempTrackEntry2.animationEnd / this._speed, { x: this._initPoint.x, y: this._initPoint.y })
                .call(() => {

                    // 需要将角色移回角色层
                    this.heroArray[this._frame.attackindex[0]].removeFromParent(false);
                    this.heroArray[this._frame.bAttackindexList[0]].removeFromParent(false);
                    this.roleLayer.addChild(this.heroArray[this._frame.attackindex[0]]);
                    this.roleLayer.addChild(this.heroArray[this._frame.bAttackindexList[0]]);

                    this.clearAllEffectAndLabelLayer();
                    skeleton2.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
                    this._curFrameIdx += 1;
                    this.startFrames();
                })
                .start();
        }, trackEntry.animationEnd / this._speed);
        if (this._frame.skill.attackEffect !== '') {
            let effectNode = new cc.Node();
            let skelCom: sp.Skeleton = effectNode.addComponent(sp.Skeleton);
            skelCom.skeletonData = this._asset.get(this._frame.skill.attackEffect);
            skelCom.loop = false;
            skelCom.timeScale = this._speed;
            skelCom.defaultAnimation = 'animation';
            skelCom.premultipliedAlpha = false;
            this.skillEffectLayer.addChild(effectNode);
            effectNode.scaleX = -1;
            effectNode.setPosition(this.heroArray[this._frame.attackindex[0]].getPosition());
        }

        if (this._frame.skill.sceneEffect !== '') {
            // 全屏背景特效
            let effectNode8 = new cc.Node();
            let skelCom2: sp.Skeleton = effectNode8.addComponent(sp.Skeleton);
            skelCom2.skeletonData = this._asset.get(this._frame.skill.sceneEffect);
            skelCom2.loop = false;
            skelCom2.timeScale = this._speed;
            skelCom2.premultipliedAlpha = false;
            skelCom2.animation = 'animation';
            this.skillEffectLayer.addChild(effectNode8);
            effectNode8.scaleX = -1;
        }
    }

    /** 原地全屏技能 */
    protected playSkill2() {
        let skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
        let trackEntry: sp.spine.TrackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, this._frame.skill.act, false);
        skeleton.setTrackEventListener(trackEntry, this.onTrackEventListener.bind(this));
        skeleton.timeScale = this._speed;
        this.scheduleOnce(() => {
            // 隐藏遮挡角色蒙层
            this.roleLayer.getComponent(RoleLayer).setMaskColorVis(false);

            // 需要将角色移回角色层
            this.heroArray[this._frame.attackindex[0]].removeFromParent(false);
            this.heroArray[this._frame.bAttackindexList[0]].removeFromParent(false);
            this.roleLayer.addChild(this.heroArray[this._frame.attackindex[0]]);
            this.roleLayer.addChild(this.heroArray[this._frame.bAttackindexList[0]]);

            let skeleton2: sp.Skeleton = this.heroArray[this._frame.attackindex[0]].getComponent(sp.Skeleton);
            this.clearAllEffectAndLabelLayer();
            skeleton2.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.DEFAULT, SPINE_ROLE_ANIM_TYPE.IDLE, true);
            this._curFrameIdx += 1;
            this.startFrames();
        }, trackEntry.animationEnd / this._speed);

        if (this._frame.skill.attackEffect !== '') {
            let effectNode = new cc.Node();
            let skelCom: sp.Skeleton = effectNode.addComponent(sp.Skeleton);
            skelCom.skeletonData = this._asset.get(this._frame.skill.attackEffect);
            skelCom.loop = false;
            skelCom.timeScale = this._speed;
            skelCom.defaultAnimation = 'animation';
            skelCom.premultipliedAlpha = false;
            this.skillEffectLayer.addChild(effectNode);
            effectNode.scaleX = -1;
            effectNode.setPosition(this.heroArray[this._frame.attackindex[0]].getPosition());
        }

        if (this._frame.skill.sceneEffect !== '') {
            // 全屏特效
            let effectNode8 = new cc.Node();
            let skelCom2: sp.Skeleton = effectNode8.addComponent(sp.Skeleton);
            skelCom2.skeletonData = this._asset.get(this._frame.skill.sceneEffect);
            skelCom2.loop = false;
            skelCom2.timeScale = this._speed;
            skelCom2.premultipliedAlpha = false;
            skelCom2.animation = 'animation';
            effectNode8.scaleX = -1;
            this.skillEffectLayer.addChild(effectNode8);
        }
    }

    /** 清除特效层与文字层 */
    clearAllEffectAndLabelLayer() {
        this.skillEffectLayer.removeAllChildren();
        this.hpLabelLayer.removeAllChildren();
    }

}
