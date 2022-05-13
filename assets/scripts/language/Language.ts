import LanguageMgr from "./LanguageMgr";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Language extends cc.Component {

    @property(cc.Label)
    upLabel: cc.Label = null;

    onLoad () {
        
        // cc.Label.prototype["onEnable"];
        // cc.Label.prototype["onLoad"];

        // var p = target.prototype;
        // if (p) return p;
        // p = target["[[Prototype]]"];
        // if (p) return p;
        // p = target.__proto__;
        // if (p) return p;
        // return target;

        // console.log(cc.Label.prototype);
        // console.log(cc.Label["[[Prototype]]"]);
        // //@ts-ignore
        // console.log(cc.Label.__proto__);
        // console.log(cc.RichText.prototype);
        // console.log(cc.RichText["[[Prototype]]"]);
        // //@ts-ignore
        // console.log(cc.RichText.__proto__);

        // cc.assetManager.loadAny("language/en.json", cc.AssetJson, () => {
        // });
    }

    start () {

    }

    onClick() {
        this.upLabel.string = LanguageMgr.getLang("加快速度！我感受到神器离我们已经很近了。");
    }

}
