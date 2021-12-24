// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class yuanxingtouxiang extends cc.Component {

    @property(cc.Node)
    backBtn: cc.Node = null;

    onLoad() {
        this.backBtn.on(cc.Node.EventType.TOUCH_END, this.onBack, this);
    }

    onBack() {
        cc.director.loadScene('main');
    }
    
}
