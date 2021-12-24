// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SchedulerMgr {

    private static _ins = null;

    private _dirScheduler: cc.Scheduler = null;
    
    public static get ins(): SchedulerMgr {
        if (!this._ins) {
            this._ins = new SchedulerMgr();
        }
        return this._ins;
    }

    constructor() {
        this._dirScheduler = cc.director.getScheduler();
        this._dirScheduler.enableForTarget(this);
        this._dirScheduler.schedule(this.update1.bind(this), this, 0.001, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.schedule(this.update2.bind(this), this, 0.005, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.schedule(this.update3.bind(this), this, 0.01, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.schedule(this.update4.bind(this), this, 0.05, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.schedule(this.update5.bind(this), this, 0.1, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.schedule(this.update6.bind(this), this, 0.5, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.schedule(this.update7.bind(this), this, 1, cc.macro.REPEAT_FOREVER, 0, false);
        this._dirScheduler.scheduleUpdate(this, 0, false);
    }

    update1() {
        console.log('1111111111111111111111111111');
    }

    update2() {
        console.log('2222222222222222222222222222');
    }

    update3() {
        console.log('333333333333333333333');
    }

    update4() {
        console.log('44444444444444444444444444');
    }

    update5() {
        console.log('5555555555555555555555555');
    }

    update6() {
        console.log('6666666666666666666666');
    }

    update7() {
        console.log('7777777777777777777');
    }

    update(dt) {
        console.log('dt : ', dt);
    }

}
