// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Laba2Scene extends cc.Component {

    // 奖励Item
    @property([cc.Node])
    items: cc.Node[] = [];

    /**
     * 想象里面的滚动时由个锤子往下拉 这是拉的高度，可根据滚多少圈，到那一项来计算
     */
    height: number = 0;

    /**是否正在滚动中 */
    doRuning: number = 0;

    /**
     * 当前转了多少时间
     */
    runTime: number = 0;

    /**
     * 转多长时间
     */
    runEndTime: number = 5;

    /**
     * 当前拉了多长
     */
    moveLen: number = 0;

    prevMove: number = 0;

    resetItemPos() {
        let pos = 0;
        for(let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].y = pos;
            pos += this.height;
        }
    }

    moving(dt:number) {
        // dt += 0.015
        let moveDelta = this.moveDown(dt);

        // y = y - (-21.5352648)
        for(let i = 0; i < this.items.length; i++) {
            let n = this.items[i];
            n.y -= moveDelta;
        }

        for(let i = 0; i < this.items.length; i++) {
            let n = this.items[i];
            // 如果 n.y 小于 -120
            if(n.y < -1 * this.height) {

                let k = (i + 1) >= this.items.length ? 0 : i + 1;
                
                n.y = this.items[k].y + this.height;

            }
        }
    }

    moveDown(dt: number) {
        // 累计滚动时间0.00+
        this.runTime += dt;
        // timer的值随时间累加而累加累加0.015/5=0.003 0.03 +++++
        let timer = this.runTime / this.runEndTime;
        // 随着上面的值越大timer-1的值越小
        timer -= 1; // 0.003 = -0.997 -0.994
        // -0.997 = 0.008973027
        // -0.994 = 0.017892216
        timer =  timer * timer * timer  + 1;
        // console.log('timer : ', timer);

        // this.moveLen:2400 * -0.008973027 = -21.5352648
        // -42.9413184
        let currMove = timer * this.moveLen;
        
        // moveDelta: -21.5352648 - 0 = -21.5352648
        let moveDelta = currMove - this.prevMove;

         // moveDelta = -21.4060536

        // this.prevMove = -21.5352648
        this.prevMove = currMove;
        
        // 累计滚动时长大于结束时长停止滚动
        if(this.runTime >= this.runEndTime) {
            this.doRuning = 0;
        }

        // moveDelta = -21.5352648

        console.log('moveDelta : ', moveDelta);

        return moveDelta;
    }

    // 开始滚动
    doStart() {
        // 重置item位置
        this.resetItemPos();
        console.log(Math.random());
        console.log(Math.floor(1.6));
        // Math.random() 获取0-1随机数
        // Math.floor() 舍弃小数取整数
        let k = Math.floor(Math.random() * 100);
        // k 1-100
        let res = k % this.items.length;
        // 最底部奖励1 然后往上2。。。。
        console.log("随机为奖励" + (res + 1))
        this.runTime = 0;
        // this.height 120 k:1-100 this.moveLen:120-12000
        // 20 * 120 = 2400
        this.moveLen = k * this.height;
        console.log('this.moveLen : ', this.moveLen);
        this.prevMove = 0;
        this.doRuning = 1;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.height = 120;
    }

    update (dt) {
        if(this.doRuning == 1) {
            this.moving(dt);
        }
    }
}
