import GameControl from "./GameControl";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameControlCom extends cc.Component {

    @property({ type: cc.TiledMap, tooltip: CC_DEV && '地图' })
    tiledMap: cc.TiledMap = null;

    @property({ type: cc.Prefab, tooltip: CC_DEV && '主角' })
    role: cc.Prefab = null;

    @property({ type: cc.Prefab, tooltip: CC_DEV && '金币' })
    goldPre: cc.Prefab = null;

    @property({ type: cc.Prefab, tooltip: CC_DEV && '敌人1' })
    enemy1Pre: cc.Prefab = null;

    @property({ type: cc.Sprite, tooltip: CC_DEV && '背景' })
    background: cc.Sprite = null;

    @property({ type: cc.Node, tooltip: CC_DEV && '地图摄像机节点' })
    mapCameraNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: CC_DEV && '游戏结束' })
    gameoverNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: CC_DEV && '重置游戏' })
    resetGame: cc.Node = null;

    @property({ type: cc.Label, tooltip: CC_DEV && '游戏分数' })
    scoreLabel: cc.Label = null;

    @property(cc.Node)
    backMenuNode: cc.Node = null;

    onLoad() {
        GameControl.ins.com = this;
        GameControl.ins.onLoad();
        this.backMenuNode.on(cc.Node.EventType.TOUCH_END, () => {
            GameControl.ins.unScheduler();
            cc.director.loadScene('main');
        });
    }

    start() {
        GameControl.ins.start();
    }
}
