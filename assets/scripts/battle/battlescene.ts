import SchedulerMgr from "../extensions/SchedulerMgr";
import { SPINE_EVENT_TYPE_TRACK_INDEX, SPINE_ROLE_ANIM_TYPE, SPINE_EVENT_NAME, SPINE_BATTLE_PLAY_TYPE } from "./SpineCfg";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class battlesene extends cc.Component {

    // @property
    // protected _radius: number = 350;
    // @property({tooltip: '半径'})
    // public get radius(): number {
    //     return this._radius;
    // }
    // public set radius(v: number) {
    //     this._radius = v;
    // }

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

    /** 当前播放 */
    private _curFrameIdx: number = 0;

    /** 回合数据 */
    private _frames: Array<ss.Battle_spine_frame> = [
        {attackindex: [0], bAttackindexList: [4], skill: { actType: 0, act: 'attack', attackEffect: '', hitEffect: '', sceneEffect: '' } }
    ];

    onLoad () {
        this.backBtn.on(cc.Node.EventType.TOUCH_END, this.onBack, this);
        this.startBtn.on(cc.Node.EventType.TOUCH_END, this.onStart, this);
        this.stopBtn.on(cc.Node.EventType.TOUCH_END, this.onStop, this);


        // cc.resources.load('battle/rolespine/AXiuLuo/spineboy', sp.SkeletonData, (err: Error, asset: cc.Asset) => {
        //     asset.addRef();
        //     console.log('asset : ', asset);
        // });

        try {
            //避免进度倒车现象!
            let lastProgres: number = 0;
            cc.assetManager.loadAny({ dir: 'battle/rolespine/AXiuLuo/AXiuLuo_attack', type: sp.SkeletonData, bundle: "resources" }, function (finished: number, total: number, item: cc.AssetManager.RequestItem) {
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
            }.bind(this), function (err: Error, asset: sp.SkeletonData) {
                console.log('err : ', err);
                console.log('asset : ', asset);
            }.bind(this));
        } catch (e) {
            console.log("资源加载出现异常 : ", 'battle/rolespine/AXiuluo/AXiuLuo_attack', e);
        }
    }

    start () {
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
        this.scheduleOnce(() => {
            this.startRoot.getChildByName('ChuZhan').active = true;
            this.startRoot.getChildByName('ChuZhan_Text').active = true;
            skeleton = this.startRoot.getChildByName('ChuZhan').getComponent(sp.Skeleton);
            trackEntry = skeleton.setAnimation(SPINE_EVENT_TYPE_TRACK_INDEX.BATTLE_START_ANIM_END, 'enter', false);
            skeleton.setTrackCompleteListener(trackEntry, this.onTrackCompleteListener.bind(this));
            this.startRoot.getChildByName('ChuZhan_Text').getComponent(cc.Animation).play('chuzhanImg');
        }, trackEntry.animationEnd - 0.8);

    }

    protected onBack() {
        // cc.director.loadScene('main');
        this.startFrames();
    }

    protected onStart() {
        this.startAnim();
    }

    protected onStop() {
        let skeleton: sp.Skeleton = this.heroArray[0].getComponent(sp.Skeleton)
        skeleton.paused = !skeleton.paused;
    }

    /**
     * 监听Spine动画播放结束回调
     */
    protected onTrackCompleteListener(trackEntry: sp.spine.TrackEntry) {
        console.log('trackEntry : ', trackEntry);
        switch (trackEntry.trackIndex) {
            case SPINE_EVENT_TYPE_TRACK_INDEX.BATTLE_START_ANIM_END:
                this.startRoot.active = false;
            break;
        }
    }

    /**
     * 监听Spine动画播放时帧事件
     */
    protected onTrackEventListener(trackEntry: sp.spine.TrackEntry, event: sp.spine.Event) {
        console.log('event : ', event);
        console.log('trackEntry : ', trackEntry);
        switch (event.data.name) {
            case SPINE_EVENT_NAME.ATTACK_HIT:
                
                break;
        }
    }

    // {attackindex: [0], bAttackindexList: [4], skill: { actType: 0, act: 'attack', attackEffect: '', hitEffect: '', sceneEffect: '' } }
    
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /** 播放Frames */
    protected startFrames() {
        if (this._frames.length > 0) {
            switch (this._frames[this._curFrameIdx].skill.actType) {
                case SPINE_BATTLE_PLAY_TYPE.ATTACK:

                    // [this._frames[this._curFrameIdx].skill.act, this._frames[this._curFrameIdx].skill.attackEffect, this._frames[this._curFrameIdx].skill.hitEffect ]
                    // this.heroArray[this._frames[this._curFrameIdx].attackindex[0],]

                    this.play();

                    break;
            }
        }
    }

    /** 播放起始攻击动画 */
    protected play() {
        const frame = this._frames[this._curFrameIdx];
        let skeleton = this.heroArray[frame.attackindex[0]].getComponent(sp.Skeleton);
        skeleton.setAnimation(0, frame.skill.act, false);
        skeleton.setTrackEventListener(SPINE_EVENT_NAME.ATTACK_HIT, this.onTrackEventListener.bind(this));
        if (frame.skill.attackEffect !== '') {
            
        }


        // 角色普通攻击动画 -> 如果有攻击特效 播放攻击特效 -> 角色被击中动画 ->如果有击中特效播放击中特效
    }

}
