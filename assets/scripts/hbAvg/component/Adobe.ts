// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import PosUtil from "../../convertUtils/PosUtil";
import GameControl from "../GameControl";
import { ROLE_STATE } from "../RoleState";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Adobe extends cc.Component {

    onLoad() {

    }

    start() {

    }

    onCollisionEnter(other, self) {
        switch (other.node.group) {
            case 'topbumper':
                if (!GameControl.ins.gravel && GameControl.ins.role.state !== ROLE_STATE.FALL) {
                    // 主角的头部碰撞体必须Y必须小于土砖Y值
                    let adobeY = this.node.y - this.node.getContentSize().height / 2;
                    let roleHeadY = GameControl.ins.role.node.y + GameControl.ins.role.node.getContentSize().height;
                    if (adobeY >= roleHeadY) {
                        cc.audioEngine.playEffect(GameControl.ins.sRes['tiledmap/caimogu/music/effect/DestroyItemBlock'], false);
                        this.node.active = false;
                        let adobeEffect = cc.instantiate(GameControl.ins.sRes['tiledmap/caimogu/brick/adobe_death']);
                        adobeEffect.setPosition(this.node.position);
                        GameControl.ins.floorEffectTop.node.addChild(adobeEffect);
                        GameControl.ins.gravel = true;
                        let tilePos = PosUtil.openglToTile(GameControl.ins.com.tiledMap, this.node.getPosition());
                        for (let index = 0; index < 2; index++) {
                            GameControl.ins.blockLayer.setTileGIDAt(0, tilePos.x - index, tilePos.y);
                            GameControl.ins.barrierLayer.setTileGIDAt(0, tilePos.x - index, tilePos.y - 1);
                        }
                        GameControl.ins.dispatchEvent({ state: ROLE_STATE.HEADIMPACT });
                        GameControl.ins.refreshScore(1);
                        this.node.destroy();
                    }
                }
                break;
        }
    }
}
