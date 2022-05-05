import Laya from "./Laya";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class TimerDemo extends cc.Component {

    @property({ type: cc.Node })
    stopBtn: cc.Node = null;

    onLoad() {
        this.stopBtn.on(cc.Node.EventType.TOUCH_END, this.onStop, this);
    }

    start () {
        Laya.timer.timerLoop(2000, this, this.daying, [1, 2, 3]);
    }

    daying(data1, data2, data3) {
        console.log('data : ', data1, data2, data3);
    }

    onStop() {
        Laya.timer.clear(this, this.daying);
    }

}
