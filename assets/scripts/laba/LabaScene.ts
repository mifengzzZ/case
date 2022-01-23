// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class LabaScene extends cc.Component {

    @property(cc.Node)
    backMenuNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: CC_DEV && '移动跟节点' })
    protected moveNodeRoot: cc.Node = null;

    @property(cc.AudioClip)
    sliderAudio: cc.AudioClip = null;

    /** 开启或暂停Y轴的变化 */
    private _stopStatus: boolean = true;

    /** 物体移动的加速度 */
    private _a: number = 0;

    /** 最大加速度 */
    private _maxA: number = 5;

    /** 物体移动的速度 */
    private _speed: number = 200;

    /** 当前移动时长 */
    private _curMoveTime: number = 0;

    /** 加速时长 */
    private _aTime: number = 2;

    /** 匀加速时长 */
    private _YTime: number = 5;

    /** 减速时长 */
    private _jTime: number = 3;

    @property([cc.Node])
    protected itemArray: Array<cc.Node> = [];

    private curIdx: number = 0;
    private curRunTime: number = 0;
    private moveTime: number = 0.15;
    private _isA: boolean = false;

    /** 转圈的时间 */
    private _zTime: number = 5;

    private _stop: boolean = false;

    /** 中奖 */
    private _jiangli: number = 7;

    private _timeArray: Array<number> = [0.15, 0.15, 0.13, 0.12, 0.11, 0.1, 0.085, 0.07, 0.06, 0.05];

    /** 加速的时间下表 */
    private _aIdx: number = 0;

    /** 进入减速阶段 */
    private _jiansuStatus: boolean = false;

    protected async onLoad() {
    }

    protected async start() {
        this.backMenuNode.on(cc.Node.EventType.TOUCH_END, () => {
            cc.director.loadScene('main');
        });
    }

    protected onStart() {
        this._isA = false;
        this.moveTime = 0.15;
        this._aIdx = 0;
        this._stop = false;
        this.curRunTime = 0;
        this._jiansuStatus = false;
        this.next();
    }

    next() {
        if (this.curIdx === (this.itemArray.length - 1)) {
            if (!this._isA) {
                this.moveTime = this._timeArray[this._aIdx];
                if (this._aIdx === (this._timeArray.length - 1)) {
                    this._isA = true;
                } else {
                    this._aIdx += 1;
                }
            }
            if (this._jiansuStatus) {
                if (this._aIdx === 0) {
                    this._jiansuStatus = false;
                } else {
                    this._aIdx -= 1;
                    this.moveTime = this._timeArray[this._aIdx];
                }
            }

            cc.tween(this.itemArray[this.curIdx]).to(this.moveTime, { x: 0, y: this.itemArray[this.curIdx].y - 120 }).call(() => {
                cc.audioEngine.play(this.sliderAudio, false, 1);
                this.itemArray[this.itemArray.length - 1].y = 120;
            }).start();
            cc.tween(this.itemArray[0]).to(this.moveTime, { x: 0, y: this.itemArray[0].y - 120 }).call(() => {
                // console.log('运动完');
                // console.log('this._stop 2 : ', this._stop);
                this.curIdx = 0;
                if (!this._stop) {
                    this.next();
                } else {
                    if (!this._jiansuStatus) {
                        if (this._jiangli === 0) {
                            console.log('中奖啦 2 : ', this._jiangli);
                            console.log('0 : ', 0);
                        } else {
                            this.next();
                        }
                    } else {
                        this.next();
                    }
                }
            }).start();
        } else {
            for (let index = this.curIdx; index < (this.curIdx + 2); index++) {
                if (index === this.curIdx) {
                    cc.tween(this.itemArray[index]).to(this.moveTime, { x: 0, y: this.itemArray[index].y - 120 }).call(() => {
                        cc.audioEngine.play(this.sliderAudio, false, 1);
                    }).start();
                } else {
                    cc.tween(this.itemArray[index]).to(this.moveTime, { x: 0, y: this.itemArray[index].y - 120 }).call(() => {
                        // console.log('运动完');
                        // console.log('this._stop : ', this._stop);
                        // console.log('this.curIdx : ', this.curIdx);
                        this.itemArray[this.curIdx].y = 120;
                        if (!this._isA) {
                            this.moveTime = this._timeArray[this._aIdx];
                            if (this._aIdx === (this._timeArray.length - 1)) {
                                this._isA = true;
                            } else {
                                this._aIdx += 1;
                            }
                        }
                        if (!this._stop) {
                            this.curIdx += 1;
                            // console.log('this.curIdx : ', this.curIdx);
                            this.next();
                        } else {
                            if (this._jiansuStatus) {
                                if (this._aIdx === 0) {
                                    this._jiansuStatus = false;
                                } else {
                                    this._aIdx -= 1;
                                    this.moveTime = this._timeArray[this._aIdx];

                                }
                                this.curIdx += 1;
                                this.next();
                            } else {
                                if (this._jiangli === index) {
                                    console.log('中奖啦');
                                    console.log('index : ', index);
                                    this.curIdx = this._jiangli;
                                } else {
                                    this.curIdx += 1;
                                    // console.log('this.curIdx : ', this.curIdx);
                                    this.next();
                                }
                            }
                        }
                    }).start();
                }
            }
        }
    }

    protected update(dt) {
        if (!this._stop) {
            this.curRunTime += dt;
            console.log('this.curRunTime : ', this.curRunTime);
            if (this.curRunTime >= this._zTime) {
                this._stop = true;
                this.curRunTime = 0;
                this._jiansuStatus = true;
            }
        }
    }
}
