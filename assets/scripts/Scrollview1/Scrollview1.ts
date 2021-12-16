// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SuperLayout from "../scrollview-core/super-layout";
import Scrollview1Item from "./Scrollview1Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Scrollview1 extends cc.Component {

    @property(SuperLayout) layout: SuperLayout = null
    @property(cc.EditBox) input: cc.EditBox = null

    protected datas: any[] = []

    async onLoad() {
        for (let i = 0; i < 5; i++) {
            this.datas.push({ message: i })
        }
        await this.layout.total(this.datas.length);
    }

    toHeader() {
        this.layout.scrollToHeader(1)
    }
    toFooter() {
        this.layout.scrollToFooter(1)
    }
    toIndex() {
        var index = Number(this.input.string)
        if (isNaN(index)) return
        this.layout.scrollToIndex(index, 1)
    }

    onRefreshEvent(item: cc.Node, index: number) {
        item.getComponent(Scrollview1Item).show(this.datas[index], index, this.onClickItem.bind(this))
    }
    onClickItem(index: number) {
        this.datas.splice(index, 1)
        this.layout.total(this.datas.length)
    }
    addItem(event: any, args: any) {
        // let count = Number(args)
        // if (isNaN(count)) return
        // for (let i = 0; i < count; i++) {
        //     this.datas.push({ message: this.datas.length })
        // }
        // this.layout.total(this.datas.length)

        this.datas[2].message = 10;
        this.datas.splice(0, 1)

        this.layout.total(this.datas.length)
    }

}
