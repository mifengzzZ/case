// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameControl from "../GameControl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Gold extends cc.Component {

    /** animation */
    private _animation: cc.Animation = null;

    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
    }

    start() {
        // let arrayClip: Array<cc.AnimationClip> = this.node.getComponent(cc.Animation).getClips();
        // this.node.getComponent(cc.Animation).currentClip = arrayClip[0];
        // this.node.getComponent(cc.Animation).play();
        let startTime = Math.random();
        this._animation.play('goldClip', startTime);
    }

    onCollisionEnter(other, self) {
        switch (other.node.group) {
            case 'role':
                let effect = cc.instantiate(GameControl.ins.sRes['tiledmap/caimogu/effect/goldeffect']);
                effect.setPosition(this.node.position.x, this.node.position.y);
                GameControl.ins.floorEffectTop.node.addChild(effect);
                GameControl.ins.refreshScore(1);
                this.node.destroy();
                break;
        }
    }

}
