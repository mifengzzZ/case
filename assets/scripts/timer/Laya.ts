import Timer from "./Timer";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export default class Laya {

    /** UI与逻辑 */
    private static _timer: Timer = null;
    public static get timer(): Timer {
        if (this._timer === null) {
            this._timer = new Timer(false);
        }
        return this._timer;
    }
}
