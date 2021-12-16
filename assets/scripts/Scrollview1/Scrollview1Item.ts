// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Scrollview1Item extends cc.Component {

    @property(cc.Label) label: cc.Label = null
    @property(cc.EditBox) input: cc.EditBox = null

    private index: number = 0;
    private clickFunc: Function = null;

    get transform() {
        return this.node
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.input.placeholder = this.transform.width.toString()
    }

    // start() {
    // }

    show(data: any, index: number, callback: Function) {
        this.index = index;
        this.label.string = data.message;
        this.clickFunc = callback;
    }

    onClick() {
        this.clickFunc.call(this, this.index);
    }
    onInput() {
        let width = Number(this.input.string);
        if (isNaN(width)) return;
        if (width < 100) {
            return;
        }
        this.transform.setContentSize(new cc.Size(Number(this.input.string), this.transform.height))
    }

    // update (dt) {}
}
