import Config from "../Config";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

export default class LanguageMgr {
    
    public static langPath: string = "language/" + Config.language;

    public static CN: string = "cn";

    /** 加载语言文件之后保存 */
    public static langPacks: Object = {};

    public static getLang(value: string): string {
        if (Config.language === LanguageMgr.CN) {
            return value;
        } else {
            return LanguageMgr.langPacks[value] || value;
        }
    }

    public static getLangArg(value: string, args: Array<any>): string {
        let s: string = value;
        let temp: string = "";
        if (LanguageMgr.langPacks) {
            s = LanguageMgr.langPacks[value] || value;
        }
        while (true) {
            let ret = s.match("{[0-9]}");
            if (!ret) {
                temp += s;
                break;
            }
            let idx: number = Number(s.slice(ret.index + 1, ret.index + 2));
            temp += s.slice(0, ret.index) + args[idx - 1];
            s = s.slice(ret.index + 3);
        }
        return temp;
    }
    
}
