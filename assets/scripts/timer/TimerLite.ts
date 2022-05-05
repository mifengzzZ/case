import Timer from "./Timer";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export default class TimerLite {

    /** 是否为帧调度器 */
    public isFrame: boolean = false;
    /** 开始点(毫秒或帧数) */
    public start: number = 0;
    /** 该回调的所有者 */
    public target: any = null;
    /** 回调 */
    public callBack: Function = null;
    /** 传递的数据 */
    public data: any[] = [];
    /** 是否循环 */
    public loop: boolean = false;
    /** 延迟 */
    public delay: number = 0;
    /** 如果不受真实时间影响,此值记录延时递减过程 */
    public dec: number = 0;

    run() {
        this.dec = this.delay;
        let func = this.callBack;
        if (this.loop) {
            if (this.isFrame) {
                this.start = Timer.curFrame;
            } else {
                this.start = Timer.curTime;
            }
        } else {
            this.destory();
        }
        func.apply(this.target, this.data);
    }

    stop() {
        this.destory();   
    }

    destory() {
        this.callBack = null;
    }
}
