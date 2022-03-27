// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdobeDeath extends cc.Component {

    /** animation */
    private _animation: cc.Animation = null;


    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
        this._animation.on('finished', this.playAnimEnd, this);
    }

    start() {
        this._animation.play('adobe_death');
    }

    playAnimEnd() {
        this._animation.off('finished', this.playAnimEnd, this);
        this.node.destroy();
    }

}
