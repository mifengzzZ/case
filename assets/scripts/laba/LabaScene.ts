// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class LabaScene extends cc.Component {
    
    @property({ type: cc.Node, tooltip: CC_DEV && '移动跟节点' })
    protected moveNodeRoot: cc.Node = null;

    
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

    protected async onLoad () {
    }

    protected async start () {
        
    }

    protected onStart() {
        this._stopStatus = false;


//         quadInOut
// 平方曲线缓入缓出函数。运动由慢到快再到慢。


//         cubicInOut
// 立方曲线缓入缓出函数。运动由慢到快再到慢。

//         quartInOut
//         四次方曲线缓入缓出函数。运动由慢到快再到慢。

//         quintInOut
// 五次方曲线缓入缓出函数。运动由慢到快再到慢。


// sineInOut
// 正弦曲线缓入缓出函数。运动由慢到快再到慢。


// expoInOut
// 指数曲线缓入和缓出函数。运动由慢到很快再到慢。


// circInOut
// 指数曲线缓入缓出函数。运动由慢到很快再到慢。


        cc.tween(this.moveNodeRoot).to(2, {x: 0, y: -1080}, { easing : 'cubicInOut'}).start();

    }

    protected cubicInOut(time: number) {
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time + 2);
    }

    protected update (dt) {
        // if (this._stopStatus) return;
        this._curMoveTime += dt;
        // if (this._curMoveTime >= this._aTime) {
        //     this._a += 1;
        // }

        this.moveNodeRoot.y = this.cubicInOut();

    }
}
