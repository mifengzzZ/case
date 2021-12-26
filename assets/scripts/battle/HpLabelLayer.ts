// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class hpLabelLayer extends cc.Component {

    /** 飘雪文本预制体 */
    @property({ type: cc.Prefab, tooltip: '飘雪预制体' })
    hpLabelPrefab: cc.Prefab = null;

    onLoad() {

    }

    start() {

    }

    /** 添加扣血动画 */
    addHpEffect(hero: cc.Node, hp: number) {
        let hpLabel: cc.Node = cc.instantiate(this.hpLabelPrefab);
        hpLabel.position = hero.position;
        hpLabel.y += hero.height / 2;
        hpLabel.getChildByName('hp').getComponent(cc.Label).string = hp.toString();
        this.node.addChild(hpLabel);
        hpLabel.getChildByName('hp').getComponent(cc.Animation).play('hitLabel');
        hpLabel.getChildByName('hp').getComponent(cc.Animation).on('finished', this.onFinished, this);
    }

    onFinished(type: string, state: cc.AnimationState) {
        state._target.node.destroy();
    }

}
