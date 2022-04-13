import ScrollNumber from "./ScrollNumber";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShuziGundongchoujiang extends cc.Component {

    @property(cc.Node)
    backMenuNode: cc.Node = null;

    @property(ScrollNumber)
    numScroll: ScrollNumber = null;

    @property(cc.Button)
    choujiang: cc.Button = null;
    
    @property(cc.Button)
    kaiguan: cc.Button = null;

    onLoad() {
        this.backMenuNode.on(cc.Node.EventType.TOUCH_END, () => {
            cc.director.loadScene('main');
        });

        this.choujiang.node.on('click', this.onCj, this);
        this.kaiguan.node.on('click', this.onKg, this);
    }

    start() {
        let label = this.kaiguan.node.getChildByName('Background').getChildByName('Label');
        label.getComponent(cc.Label).string = this.numScroll.isAutoRoll ? '开' : '关'
    }

    onCj() {
        if (this.numScroll.isAutoRoll) {
            return;
        }
        let num = this.getRandomInt(this.numScroll.minNum, this.numScroll.maxNum);
        this.numScroll.rollSpeed = 1000;
        this.numScroll.scrollTo(num);
    }

    onKg() {
        this.numScroll.isAutoRoll = !this.numScroll.isAutoRoll;
        if (!this.numScroll.isAutoRoll) {
            this.numScroll.speed = 1000;
            this.numScroll.rolling = false;
        }
        let label = this.kaiguan.node.getChildByName('Background').getChildByName('Label');
        label.getComponent(cc.Label).string = this.numScroll.isAutoRoll ? '开' : '关'
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
}
