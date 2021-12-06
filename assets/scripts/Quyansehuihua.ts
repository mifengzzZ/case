// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Quyansehuihua extends cc.Component {

    @property(cc.Sprite)
    hueSprite: cc.Sprite = null;

    @property(cc.Node)
    huePointNode: cc.Node = null;

    @property(cc.Sprite)
    colorBoardSprite: cc.Sprite = null;

    @property(cc.Node)
    circleNode: cc.Node = null;

    private _h: number = 0;
    private _s: number = 100;
    private _v: number = 100;

    private _colorBoardTexture: cc.Texture2D = null;
    private _colorBoardData = null;

    start() {

        this._colorBoardTexture = new cc.Texture2D();
        this.createHueData();

        this.addEvent();
    }

    private createHueData(): void {
        let texture2D = new cc.Texture2D();
        
        let hueData: Uint8Array = new Uint8Array(360 * 4);
        for (let i = 0; i < 360; i++) {
            let color: cc.Color = this.hsv2rgb(i, 100, 100);
            hueData[i * 4] = color.getR();
            hueData[i * 4 + 1] = color.getG();
            hueData[i * 4 + 2] = color.getB();
            hueData[i * 4 + 3] = color.getA();
        }
        texture2D.initWithData(hueData as any, cc.Texture2D.PixelFormat.RGBA8888, 1, 360);
        this.hueSprite.spriteFrame = new cc.SpriteFrame(texture2D);
    }

    private addEvent() {
        this.hueSprite.node.on(cc.Node.EventType.TOUCH_START, this.onHueTouch, this);
        this.hueSprite.node.on(cc.Node.EventType.TOUCH_MOVE, this.onHueTouch, this);
        this.huePointNode.on(cc.Node.EventType.TOUCH_MOVE, this.onHueTouch, this);
    }

    private onHueTouch(event: cc.Event.EventTouch) {
        let pos = this.hueSprite.node.convertToNodeSpaceAR(event.touch.getLocation());
        pos.y += this.hueSprite.node.height/2;
        let index = Math.round((this.hueSprite.node.height - pos.y) / this.hueSprite.node.height * 360);
        index = Math.max(0, Math.min(index, 359));
        this._h = index;
        this.huePointNode.y = Math.round(this.hueSprite.node.height / 2 - index / 360 * this.hueSprite.node.height);
        this.createColorBoardData();
    }

    private createColorBoardData(isFromRgba = false) {
        this._colorBoardData = new Uint8Array(101 * 101 * 4);
        for (let i = 0; i <= 100; i++) {
            for (let j = 0; j <= 100; j++) {
                let color = this.hsv2rgb(this._h, j, 100 - i);
                let index = (i * 101 + j) * 4;
                this._colorBoardData[index] = color.getR();
                this._colorBoardData[index + 1] = color.getG();
                this._colorBoardData[index + 2] = color.getB();
                this._colorBoardData[index + 3] = color.getA();
            }
        }
        this._colorBoardTexture.initWithData(this._colorBoardData as any, cc.Texture2D.PixelFormat.RGBA8888, 101, 101)
        this.colorBoardSprite.spriteFrame = new cc.SpriteFrame(this._colorBoardTexture);
        this.circleNode.position = cc.v3(this._s / 100 * this.colorBoardSprite.node.width, this._v / 100 * this.colorBoardSprite.node.height);
        console.log('this.circleNode.position : ', this.circleNode.position);
        this.setCircleColor();

        if (!isFromRgba) {
            this.initRgbNode();
        }
    }

    private initRgbNode() {
        let curColor = this.hsv2rgb(this._h, this._s, this._v);
        console.log('curColor : ', curColor);
    }

    private setCircleColor() {
        let curColor = this.hsv2rgb(this._h, this._s, this._v);
        
        console.log('curColor : ', curColor);
        
        let isBlack = .299 * curColor.getR() + .578 * curColor.getG() + .114 * curColor.getB() >= 192;
        this.circleNode.color = isBlack ? cc.Color.BLACK : cc.Color.WHITE;
    }

    private hsv2rgb(h: number, s: number, v: number) {
        h /= 1;
        s /= 100;
        v /= 100;
        var r = 0;
        var g = 0;
        var b = 0;

        if (s === 0) {
            r = g = b = v;
        } else {
            var _h = h / 60;

            var i = Math.floor(_h);
            var f = _h - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }
        }

        return cc.color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 255);
    }
}
