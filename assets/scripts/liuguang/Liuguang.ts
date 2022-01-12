// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Liuguang extends cc.Component {

    @property(cc.Node)
    protected waveLight1: cc.Node = null;

    _t: number = 0;

    start () {

    }

    update ( dt ) {
        this._t += 0.01;
        let arr = this.waveLight1.getComponent(cc.Sprite).getMaterials();
        let _material1 = arr[0];
        //@ts-ignore
        _material1.effect.setProperty("u_time", this._t);
    }
    
}
