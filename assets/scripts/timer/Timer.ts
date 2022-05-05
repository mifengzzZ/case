import TimerLite from "./TimerLite";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export default class Timer {

    private static startLogLock: boolean = false;

    /** 存放所有的Timer */
    private static timers: Array<Timer> = [];
    /** 当前的帧数 */
    static curFrame: number = 0;
    /** 当前的时间戳(毫秒) */
    static curTime: number = 0;
    /** 每帧的刷新超时时长 */
    private static updateTimeout: number = 50;
    
    /* 计算固定3.5s时间内的fps */
    private static fps: number = 0;
    private static fpsDuration: number = 3500;
    private static lastUpdateFPSFrame: number = 0;
    private static lastUpdateFPSTime: number = 0;

    /** 存放Timer对象中所有的TimerLite事件 */
    private timerLites: Array<TimerLite> = [];
    /** 不受真真实时间影响的速度 */
    private speed: number = 1;
    /** 是否受真实时间影响 */
    private realTime: boolean = true;
    /** 每帧最大运行时长 */
    private runDurationLimit: number = 0;

    constructor(realTime: boolean = true, limitTime: number = 0) {
        this.realTime = realTime;
        this.runDurationLimit = limitTime;
        Timer.timers.push(this);
        if (Timer.timers.length === 1) {
            this.init();
        }
    }

    private init() {
        cc.director.getScheduler().enableForTarget(this);
        cc.director.getScheduler().scheduleUpdate(this, 0, false);
        this.update();
    }

    private updateTimer(dt) {
        let length = this.timerLites.length;
        let emptyNum = 0;
        let tm = new Date().getTime();
        for (let i = 0; i < length; i++) {
            if (this.runDurationLimit > 0) {
                // 当前调度器运行超时,等待下一帧再运行,一般用于非重要任务的执行,避免任务过多导致卡线程
                if (new Date().getTime() - tm >= this.runDurationLimit) {
                    break;
                }
            }
            let t: TimerLite = this.timerLites[i];
            if (t && t.callBack) {
                if (this.realTime) {
                    if (t.isFrame) {
                        if (Timer.curFrame - t.start >= t.delay) {
                            t.run();
                        }      
                    } else {
                        if (Timer.curTime - t.start >= t.delay) {
                            t.run();
                        }
                    }   
                } else {
                    if (t.isFrame) {
                        t.dec -= this.speed;
                    } else {
                        t.dec -= this.speed * dt;
                    }
                    if (t.dec <= 0) {
                        t.run();
                    }
                }
                if (t.callBack === null) {
                    emptyNum++;
                }
            } else {
                emptyNum++;
            }
        }
        if (emptyNum >= 30 || Timer.curFrame % 300 === 0) {
            let arr = this.timerLites;
            this.timerLites = [];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].callBack) {
                    this.timerLites.push(arr[i]);
                }
            }
        }
    }

    update(dt?: number) {
        Timer.curFrame++;
        let t = new Date().getTime();
        let dlt = t - Timer.curTime;
        if (dlt > Timer.updateTimeout && Timer.startLogLock) {
            // console.log('[Timer] [update] 渲染卡顿的时间: ', dt, '毫秒');
        }
        Timer.curTime = t;
        if (!Timer.startLogLock)
            Timer.startLogLock = true;
        if (t - Timer.lastUpdateFPSTime >= Timer.fpsDuration) {
            Timer.fps = Math.round((Timer.curFrame - Timer.lastUpdateFPSFrame) / (Timer.fpsDuration/1000));
            Timer.lastUpdateFPSTime = t;
            Timer.lastUpdateFPSFrame = Timer.curFrame;
            // console.log('[Timer] [update] 当前帧率: ', Timer.fps);
        }
        for (let i = 0; i < Timer.timers.length; i++) {
            Timer.timers[i].updateTimer(Math.round(dt * 1000));
        }
    }

    timerOnce(delay: number, target: any, callBack: Function, args: any[] = null): TimerLite {
        return this.initTimer(false, false, delay, target, callBack, args);
    }

    timerLoop(delay: number, target: any, callBack: Function, args: any[] = null): TimerLite {
        return this.initTimer(false, true, delay, target, callBack, args);
    }

    frameOnce(delay: number, target: any, callBack: Function, args: any[] = null): TimerLite {
        return this.initTimer(true, false, delay, target, callBack, args);
    }

    frameLoop(delay: number, target: any, callBack: Function, args: any[] = null): TimerLite {
        return this.initTimer(true, true, delay, target, callBack, args);
    }
    
    initTimer(isFrame: boolean, isLoop: boolean, delay: number, target: any, callBack: Function, args: any[] = null): TimerLite {
        let t: TimerLite;
        t = this.getTimerLite(target, callBack);
        if (t === null) {
            t = new TimerLite();
        }
        t.delay = delay ? delay : 0;
        t.isFrame = isFrame;
        t.target = target;
        t.callBack = callBack;
        t.data = args;
        t.loop = isLoop;
        t.dec = delay;
        if (t.isFrame) {
            t.start = Timer.curFrame;
        } else {
            t.start = Timer.curTime;
        }
        this.timerLites.push(t);
        return t;
    }

    getTimerLite(target: any, callBack: Function): TimerLite {
        let length = this.timerLites.length;
        for (let i = 0; i < length; i++) {
            const e: TimerLite = this.timerLites[i];
            if (e.target === target && e.callBack === callBack) {
                return e;
            }
        }
        return null;
    }

    clear(target: any, callBack: Function) {
        let length = this.timerLites.length;
        for (let i = 0; i < length; i++) {
            const e: TimerLite = this.timerLites[i];
            if (e.target === target && e.callBack === callBack) {
                e.destory();
            }
        }
    }

    clearAll(target: any = null) {
        if (!target) {
            this.timerLites.length = 0;
            return;
        }
        var length = this.timerLites.length;
        for (var i = 0; i < length; i++) {
            var t: TimerLite = this.timerLites[i];
            if (t.target == target) {
                t.destory();
            }
        }
    }
    
}
