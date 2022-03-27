// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class GoldObjPoolMgr {

    private static _ins: GoldObjPoolMgr = null;
    public static get ins(): GoldObjPoolMgr {
        if (!this._ins) {
            this._ins = new GoldObjPoolMgr();
        }
        return this._ins;
    }
    
    private _template: cc.Prefab = null;
    public set template(v: cc.Prefab) {
        this._template = v;
    }

    private _size: number = 0;
    public get size(): number {
        this._size = this._pool.length;
        return this._size;
    }

    private _pool: Array<cc.Node> = [];

    private create(): cc.Node {
        let n: cc.Node = cc.instantiate(this._template);
        n.attr({ GOLD_OBJ_POOL_RETAIN: 1 });
        this._pool.unshift(n);
        return n;
    }

    public get() {
        let last = this._pool.length - 1;
        if (last < 0) {
            return this.create();
        }
        var obj = this._pool[last];
        if (obj['GOLD_OBJ_POOL_RETAIN'] === 0) {
            this._pool.length = last;
            return obj;
        } else {
            return this.create();
        }
    }

    public put(obj: cc.Node) {
        if (obj && this._pool.indexOf(obj) !== -1) {
            obj.removeFromParent(false);
            obj.attr({ GOLD_OBJ_POOL_RETAIN: 0 });
            this._pool.push(obj);
        }
    }

    public clear() {
        var count = this._pool.length;
        for (var i = 0; i < count; ++i) {
            this._pool[i].destroy();
        }
        this._pool.length = 0;
    }
    
}
