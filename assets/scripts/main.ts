// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.Button])
    jumpSceneBtnArr: Array<cc.Button> = [];

    start() {
        for (let index = 0; index < this.jumpSceneBtnArr.length; index++) {
            let element: cc.Button = this.jumpSceneBtnArr[index];
            element.node.on('click', this.onJumpScene.bind(this, index));
        }
    }

    private onJumpScene(key: number, event: cc.Button): void {
        switch (key) {
            case 0:
                cc.director.loadScene('quyansehuihua');
                break;
            case 1:
                cc.director.loadScene('xinshouyindao');
                break;
            case 2:
                cc.director.loadScene('cameraPaokuEffect');
                break;
            case 3:
                cc.director.loadScene('Scrollview1');
                break;
            case 4:
                cc.director.loadScene('yuanxingtouxiang');
                break;
            case 5:
                cc.director.loadScene('battleScene');
                break;
            case 6:
                cc.director.loadScene('sichashu');
                break;
        }
    }
}
