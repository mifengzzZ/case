// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import HollowOut from "./HollowOut";
import TouchBlock from "./TouchBlock";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideManager extends cc.Component {

    private static _ins: GuideManager = null;

    private _guideView: cc.Node = null;

    private _hollowOut: HollowOut = null;
    private _touchBlock: TouchBlock = null;

    public static get ins(): GuideManager {
        if (!this._ins) {
            this._ins = new GuideManager();
        }
        return this._ins;
    }

    load() {
        try {
            //避免进度倒车现象!
            let lastProgres: number = 0;
            cc.assetManager.loadAny({ dir: 'xinshouyindao/prefab/guideLayer', type: cc.Prefab, bundle: "resources" }, function (finished: number, total: number, item: cc.AssetManager.RequestItem) {
                let progress: number = finished / total;
                if (progress > 1) {
                    progress = 1;
                } else if (progress < 0) {
                    progress = 0;
                }
                if (lastProgres > progress) {
                    return;
                }
                lastProgres = progress;
            }.bind(this), function (err: Error, asset: cc.Prefab) {
                this._guideView = cc.instantiate(asset);
                this._hollowOut = this._guideView.getComponent('HollowOut');
                this._touchBlock = this._guideView.getComponent('TouchBlock');
                cc.director.getScene().children[0].addChild(this._guideView);
                this._guideView.active = false;
                this._guideView.getChildByName('shoushiroot').active = false;
                console.log('我我我');
            }.bind(this));
        } catch (e) {
            console.log("资源加载出现异常 : ", 'xinshouyindao/prefab/guideLayer', e);
        }
    }

    /**
     * 启动引导
     */
    async addListenerEvent(node: cc.Node) {
        console.log('我操');
        this._guideView.active = true;
        this._touchBlock.blockAll();
        // 遮罩动起来
        const x = node.width + 10,
            y = node.height + 10;
        await this._hollowOut.rectTo(0.5, node.getPosition(), x, y, 5, 5);
        this._guideView.getChildByName('shoushiroot').active = true;
        this._guideView.getChildByName('shoushiroot').setPosition(node.getPosition());
        // 设置可点击节点
        this._touchBlock.setTarget(node);
    }

}
