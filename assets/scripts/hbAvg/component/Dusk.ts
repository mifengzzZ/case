// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dusk extends cc.Component {

    playAnimEnd() {
        if (this.node.name === 'SmokePoof0001a') {
            this.node.parent.destroy();
        } else {
            this.node.destroy();
        }
    }

}
