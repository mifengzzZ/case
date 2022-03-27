import GameControl from "../GameControl";
import { ROLE_STATE } from "../RoleState";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Operator extends cc.Component { 

    @property({ type: cc.Node, tooltip: CC_DEV && '往左' })
    left: cc.Node = null;
    @property({ type: cc.Node, tooltip: CC_DEV && '往右' })
    right: cc.Node = null;
    @property({ type: cc.Node, tooltip: CC_DEV && '攻击' })
    attack: cc.Node = null;
    @property({ type: cc.Node, tooltip: CC_DEV && '跳跃' })
    jump: cc.Node = null;

    @property({ type: [cc.Node], tooltip: CC_DEV && '控制主角按钮列表'})
    opBtnList: Array<cc.Node> = [];

    onLoad () {
        this.registerEvent();
    }

    start () {
    }

    private registerEvent() {
        for (const n of this.opBtnList) {
            n.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            n.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            n.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }
    
    private unRegisterEvent() {
        for (const n of this.opBtnList) {
            n.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            n.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            n.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    }

    onTouchStart(event: cc.Event.EventTouch) {
        let spriteFrame: cc.SpriteFrame = null;
        if (event.target === this.opBtnList[0] || event.target === this.opBtnList[1]) {
            let dir = 1;
            if (event.target === this.opBtnList[1]) {
                dir = 2;
            }
            GameControl.ins.dispatchEvent({ state: ROLE_STATE.RUN, dir: dir });
        }
        switch (event.target) {
            case this.opBtnList[0]:
                spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/LW3_Assets'].getSpriteFrame('GUI_buttons_left_ova');
                this.left.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                break;
            case this.opBtnList[1]:
                spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/LW3_Assets'].getSpriteFrame('GUI_buttons_right_ova');
                this.right.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                break;
            case this.opBtnList[3]:
                spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/LW3_Assets'].getSpriteFrame('GUI_buttons_jump_ova');
                GameControl.ins.dispatchEvent({ state: ROLE_STATE.JUMP });
                this.jump.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                break;
        }
    }
    onTouchEnd(event: cc.Event.EventTouch) {
        let spriteFrame: cc.SpriteFrame = null;
        if (event.target === this.opBtnList[0] || event.target === this.opBtnList[1]) {
            GameControl.ins.dispatchEvent({ state: ROLE_STATE.RUN, dir: 0 });
        }
        switch (event.target) {
            case this.opBtnList[0]:
                spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/LW3_Assets'].getSpriteFrame('GUI_buttons_left');
                this.left.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                break;
            case this.opBtnList[1]:
                spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/LW3_Assets'].getSpriteFrame('GUI_buttons_right');
                this.right.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                break;
            case this.opBtnList[3]:
                spriteFrame = GameControl.ins.sRes['tiledmap/caimogu/LW3_Assets'].getSpriteFrame('GUI_buttons_jump');
                this.jump.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                break;
        }
    }

}
