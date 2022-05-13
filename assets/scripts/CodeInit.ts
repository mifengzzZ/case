import LanguageMgr from "./language/LanguageMgr";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


export default class CodeInit {

    public static getProtoType(target) {
        var p = target.prototype;
        if (p) return p;
        p = target["[[Prototype]]"];
        if (p) return p;
        p = target.__proto__;
        if (p) return p;
        return target;
    }

    public static init() {
        var lonLoad: Function = cc.Label.prototype["onLoad"]; 
        CodeInit.overwriteLabelonLoad(cc.Label, "onLoad", function () {
            lonLoad.call(this);
            this.string = LanguageMgr.getLang(this.string);
        });
    }

    public static defineProperty(target, name, func) {
        Object.defineProperty(target, name, {
            configurable: true,
            writable: true,
            value: func
        });
    }

    public static overwriteLabelonLoad(target, name, func) {
        target = this.getProtoType(target);
        var _func: Function = target[name];
        if (_func) {
            CodeInit.defineProperty(target, name, function () {
                func.call(this);
            });
        }
    }

}
