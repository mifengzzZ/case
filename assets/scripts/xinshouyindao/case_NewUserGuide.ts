import GuideManager from "./GuideManager";
import HollowOut from "./HollowOut";
import TouchBlock from "./TouchBlock";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class case_NewUserGuide extends cc.Component {

    // @property(HollowOut)
    // hollowOut: HollowOut = null;

    // @property(TouchBlock)
    // touchBlock: TouchBlock = null;

    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Node)
    oneBtn: cc.Node = null;

    @property(cc.Node)
    twoBtn: cc.Node = null;

    @property(cc.Node)
    threeBtn: cc.Node = null;

    @property(cc.Node)
    backBtn: cc.Node = null;

    protected onLoad() {
        this.registerEvent();
    }

    protected start() {
        console.log('擦擦');
        // this.reset();
        GuideManager.ins.load();
    }

    registerEvent() {
        this.startBtn.on(cc.Node.EventType.TOUCH_END, this.onStartBtnClick, this);
        this.oneBtn.on(cc.Node.EventType.TOUCH_END, this.onOneBtnClick, this);
        this.twoBtn.on(cc.Node.EventType.TOUCH_END, this.onTwoBtnClick, this);
        this.threeBtn.on(cc.Node.EventType.TOUCH_END, this.onThreeBtnClick, this);
        this.backBtn.on(cc.Node.EventType.TOUCH_END, this.onBack, this);
    }

    unregisterEvent() {
        this.node.targetOff(this);
    }

    /**
     * 重置
     */
    reset() {
        // 打开遮罩
        // this.hollowOut.node.active = true;
        // 将遮罩镂空设为节点大小
        // this.hollowOut.setNodeSize();
        // 放行所有点击
        // this.touchBlock.passAll();
    }

    /**
     * 开始
     */
    protected async onStartBtnClick() {
        console.log('开始');
        // // 屏蔽所有点击
        // this.touchBlock.blockAll();
        // // 遮罩动起来
        // const node = this.oneBtn,
        //     x = node.width + 10,
        //     y = node.height + 10;
        // await this.hollowOut.rectTo(0.5, node.getPosition(), x, y, 5, 5);
        // // 设置可点击节点
        // this.touchBlock.setTarget(node);
        GuideManager.ins.addListenerEvent(this.oneBtn);

    }

    protected async onOneBtnClick() {
        // // 将遮罩镂空设为节点大小
        // this.hollowOut.setNodeSize();
        // // 屏蔽所有点击
        // this.touchBlock.blockAll();
        // // 遮罩动起来
        // const node = this.twoBtn,
        //     x = node.width + 10,
        //     y = node.height + 10;
        // await this.hollowOut.rectTo(0.5, node.getPosition(), x, y, 5, 5);
        // // 设置可点击节点
        // this.touchBlock.setTarget(node);

        GuideManager.ins.addListenerEvent(this.twoBtn);
    }

    protected async onTwoBtnClick() {
        // 将遮罩镂空设为节点大小
        // this.hollowOut.setNodeSize();
        // // 屏蔽所有点击
        // this.touchBlock.blockAll();
        // // 遮罩动起来
        // const node = this.threeBtn;
        // await this.hollowOut.circleTo(0.5, node.getPosition(), node.width / 2, 0);
        // // 设置可点击节点
        // this.touchBlock.setTarget(node);

        GuideManager.ins.addListenerEvent(this.threeBtn);
    }

    onThreeBtnClick() {
        // console.log('啦啦啦');
        // // 将遮罩镂空设为节点大小
        // this.hollowOut.setNodeSize();
        // // 放行所有点击
        // this.touchBlock.passAll();
    }

    onBack() {
        cc.director.loadScene('main');
    }

    // update (dt) {}
}
