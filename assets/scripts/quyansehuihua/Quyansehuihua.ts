import NodeUtil from "../extensions/utils/NodeUtil";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Quyansehuihua extends cc.Component {

//------------------------------------------------------------------------------------------------------------------------
// 颜色获取
    @property(cc.Node)
    backMenuNode: cc.Node = null;

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

//------------------------------------------------------------------------------------------------------------------------
// 获取触摸像素点信息
    @property(cc.Node)
    protected pixeSprite: cc.Node = null;
    protected pixelsData: Uint8Array = null;

//------------------------------------------------------------------------------------------------------------------------
// 画画
    @property(cc.Node)
    protected graphicsNode: cc.Node = null;
    private _graphics: cc.Graphics = null;
    private _graphicsColor: cc.Color = null;
    private _init: boolean = false;

//------------------------------------------------------------------------------------------------------------------------

    // start() {
    //     this.backMenuNode.on(cc.Node.EventType.TOUCH_END, () => {
    //         cc.director.loadScene('main');
    //     });

    //     this._colorBoardTexture = new cc.Texture2D();
    //     this.createHueData();
    //     this.createColorBoardData();
    //     this.initRgbNode();
    //     this.addEvent();
    // }

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

        this.colorBoardSprite.node.on(cc.Node.EventType.TOUCH_START, this.onColorBoardTouch, this);
        this.colorBoardSprite.node.on(cc.Node.EventType.TOUCH_MOVE, this.onColorBoardTouch, this);

        // this.rSlider.node.on('slide', this.rgbChanged, this);
        // this.gSlider.node.on('slide', this.rgbChanged, this);
        // this.bSlider.node.on('slide', this.rgbChanged, this);

        // this.rEditBox.node.on("editing-did-ended", this.editTextEnd, this);
        // this.gEditBox.node.on("editing-did-ended", this.editTextEnd, this);
        // this.bEditBox.node.on("editing-did-ended", this.editTextEnd, this);
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

        // this.rSlider.progress = curColor.getR() / 255;
        // this.rEditBox.string = curColor.getR() + "";
        // this.gSlider.progress = curColor.getG() / 255;
        // this.gEditBox.string = curColor.getG() + "";
        // this.bSlider.progress = curColor.getB() / 255;
        // this.bEditBox.string = curColor.getB() + "";
    }

    private setCircleColor() {
        let curColor = this.hsv2rgb(this._h, this._s, this._v);
        console.log('curColor : ', curColor);
        let isBlack = .299 * curColor.getR() + .578 * curColor.getG() + .114 * curColor.getB() >= 192;
        this.circleNode.color = isBlack ? cc.Color.BLACK : cc.Color.WHITE;
    }

    private onColorBoardTouch(event: cc.Event.EventTouch) {
        let pos = this.colorBoardSprite.node.convertToNodeSpaceAR(event.touch.getLocation());
        pos.x = Math.max(0, Math.min(pos.x, this.colorBoardSprite.node.width));
        pos.y = Math.max(0, Math.min(pos.y, this.colorBoardSprite.node.height));
        this.circleNode.position = cc.v3(pos.x, pos.y);

        this._s = Math.round(pos.x / this.colorBoardSprite.node.width * 100);
        this._v = Math.round(pos.y / this.colorBoardSprite.node.height * 100);
        this._s = Math.max(0, Math.min(this._s, 100));
        this._v = Math.max(0, Math.min(this._v, 100));
        this.setCircleColor();
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

    // 输入数值
    // editTextEnd() {
    //     let rText = this.rEditBox.string;
    //     let r = parseInt(rText);
    //     if (isNaN(r)) {
    //         r = 255;
    //     }
    //     r = Math.max(0, Math.min(r, 255));
    //     this.rEditBox.string = r + "";
    //     this.rSlider.progress = r / 255;

    //     let gText = this.gEditBox.string;
    //     let g = parseInt(gText);
    //     if (isNaN(g)) {
    //         g = 255;
    //     }
    //     g = Math.max(0, Math.min(g, 255));
    //     this.gEditBox.string = g + "";
    //     this.gSlider.progress = g / 255;

    //     let bText = this.bEditBox.string;
    //     let b = parseInt(bText);
    //     if (isNaN(b)) {
    //         b = 255;
    //     }
    //     b = Math.max(0, Math.min(b, 255));
    //     this.bEditBox.string = b + "";
    //     this.bSlider.progress = b / 255;

    //     let hsv = this.rgb2hsv(r, g, b);
    //     this.h = hsv[0];
    //     this.s = hsv[1];
    //     this.v = hsv[2];

    //     this.huePointNode.y = Math.round(this.hueSprite.node.height / 2 - this.h / 360 * this.hueSprite.node.height);

    //     this.createColorBoardData(true);
    // }

    // rgbChanged() {
    //     let r = Math.round(255 * this.rSlider.progress);
    //     this.rEditBox.string = r + "";
    //     let g = Math.round(255 * this.gSlider.progress);
    //     this.gEditBox.string = g + "";
    //     let b = Math.round(255 * this.bSlider.progress);
    //     this.bEditBox.string = b + "";

    //     let hsv = this.rgb2hsv(r, g, b);
    //     this.h = hsv[0];
    //     this.s = hsv[1];
    //     this.v = hsv[2];

    //     this.huePointNode.y = Math.round(this.hueSprite.node.height / 2 - this.h / 360 * this.hueSprite.node.height);

    //     this.createColorBoardData(true);
    // }

//------------------------------------------------------------------------------------------------------------------------
// 获取触摸像素点信息

    start() {
        this.pixeSprite.on(cc.Node.EventType.TOUCH_END, this.onPixeTouch, this);
        this.pixeSprite.on(cc.Node.EventType.TOUCH_MOVE, this.onPixeTouch, this);
    }

    onPixeTouch(event: cc.Event.EventTouch) {
        // 点击位置
        const touchPos = event.getLocation(),
            node = this.pixeSprite,
            localPos = node.convertToNodeSpaceAR(touchPos);

        // 不在节点内
        if (!this.pixeSprite.getBoundingBoxToWorld().contains(touchPos)) {
            return;
        }

        // 获取像素数据
        if (!this.pixelsData) {
            this.pixelsData = NodeUtil.getPixelsData(this.pixeSprite);
        }

        // 截取像素颜色
        let x = localPos.x + node.anchorX * node.width,
            y = -(localPos.y - node.anchorY * node.height);
        const index = (node.width * 4 * Math.floor(y)) + (4 * Math.floor(x)),
            colors = this.pixelsData.slice(index, index + 4);

        this._graphicsColor = new cc.Color(colors[0], colors[1], colors[2], colors[3]);
        console.log('this._graphicsColor : ', this._graphicsColor);
        // 当前点击像素颜色
        console.log('cc.color(colors[0], colors[1], colors[2]) : ', cc.color(colors[0], colors[1], colors[2]));
        console.log('opacity : ', colors[3]);
        
        if (!this._init) {
            this._init = true;
            this.initHuahua();
        } else {
            this._graphics.strokeColor = this._graphicsColor;
        }

        // 展示信息
        // this.label.string = '点击信息：\n';
        // this.label.string += ` - 基于世界的坐标：${touchPos.toString()}\n`;
        // this.label.string += ` - 基于锚点的坐标：${localPos.toString()}\n`;
        // this.label.string += ` - 基于左上角的坐标：${cc.v2(x, y).toString()}\n`;
        // this.label.string += ` - 像素下标：${index / 4}\n`;
        // this.label.string += ` - 颜色下标：${index}\n`;
        // this.label.string += ` - 颜色值：\n`;
        // this.label.string += `            - R：${colors[0]}\n`;
        // this.label.string += `            - G：${colors[1]}\n`;
        // this.label.string += `            - B：${colors[2]}\n`;
        // this.label.string += `            - A：${colors[3]}`;

        // cc.log(`---------- 点击信息 ----------`);
        // cc.log(`基于世界的坐标：\t${touchPos.toString()}`);
        // cc.log(`基于左上角的坐标：\t${cc.v2(x, y).toString()}`);
        // cc.log(`基于锚点的坐标：\t${localPos.toString()}`);
        // cc.log(`像素下标：\t${index}`);
        // cc.log(`颜色值：`);
        // cc.log(`\t- R：${colors[0]}`);
        // cc.log(`\t- G：${colors[1]}`);
        // cc.log(`\t- B：${colors[2]}`);
        // cc.log(`\t- A：${colors[3]}`);
        // cc.log(`------------------------------`);
    }

//------------------------------------------------------------------------------------------------------------------------
// 绘画
    
    initHuahua() {
        this._graphics = this.graphicsNode.getComponent(cc.Graphics);
        // 设置画笔
        this._graphics.strokeColor = this._graphicsColor;
        this._graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        this._graphics.lineCap = cc.Graphics.LineCap.ROUND;
        this._graphics.lineWidth = 30;

        this.graphicsNode.on(cc.Node.EventType.TOUCH_START, this.onGraphicsStart, this);
        this.graphicsNode.on(cc.Node.EventType.TOUCH_MOVE, this.onGraphicsEnd, this);
    }

    onGraphicsStart(event: cc.Event.EventTouch) {
        const pos = this.graphicsNode.convertToNodeSpaceAR(event.getLocation());
        this._graphics.moveTo(pos.x - 5, pos.y);
        this._graphics.circle(pos.x - 5, pos.y, 1);
        this._graphics.stroke();
        this._graphics.moveTo(pos.x - 5, pos.y);
    }

    onGraphicsEnd(event: cc.Event.EventTouch) {
        const pos = this.graphicsNode.convertToNodeSpaceAR(event.getLocation());
        this._graphics.lineTo(pos.x - 5, pos.y);
        this._graphics.stroke();
        this._graphics.moveTo(pos.x - 5, pos.y);
    }

}
