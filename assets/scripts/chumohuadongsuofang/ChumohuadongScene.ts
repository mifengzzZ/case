import TouchScrollViewCom from "./TouchScrollViewCom";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChumohuadongScene extends cc.Component {

    @property({ type: cc.Node })
    demoOne: cc.Node = null;

    @property({ type: cc.Node })
    demoTwo: cc.Node = null;

    private _demoData: Array<number> = [0, 1, 2, 3, 4, 5, 6];

    onLoad () {
        
    }

    start () {
        this.refreshDemoView();
    }

    refreshDemoView() {
        this.demoOne.getChildByName('maskroot').getComponent(TouchScrollViewCom).init((idx: number) => {
            console.log('已回弹至目标点 : ', idx);
        }, (idx: number, item: cc.Node) => {
            item.getChildByName('txt').getComponent(cc.Label).string = idx.toString();
        }, this._demoData.length);

        this.demoTwo.getComponent(TouchScrollViewCom).init((idx: number) => {
            console.log('已回弹至目标点 : ', idx);
        }, (idx: number, item: cc.Node) => {
            for (let index = 0; index < 8; index++) {
                item.getChildByName(index.toString()).active = idx === index ? true : false;
            }
        }, 8);
    }

    update (dt) {

    }

}
