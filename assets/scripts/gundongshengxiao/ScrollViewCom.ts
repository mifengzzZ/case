// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollViewCom extends cc.Component {

    @property(cc.AudioClip)
    sliderAudio: cc.AudioClip = null;

    @property({ tooltip: "是否启用滚动音效" })
    isPlaySound: boolean = true;

    scrollview: cc.ScrollView;

    onLoad() {
        this.scrollview = this.node.getComponent(cc.ScrollView);
    }

    start() {
        this.scrollview.node.on("scroll-to-top", this.onTop, this);
        this.scrollview.node.on("scroll-to-bottom", this.onbottom, this);
        this.scrollview.node.on("scroll-began", this.onscrollBegan, this);
        this.scrollview.node.on("scrolling", this.onscrolling, this);
        this.scrollview.node.on("scroll-ended", this.onscrollEnd, this);
    }

    private isFrirstMove: boolean = true;
    private isBegan: boolean = false;
    private statuArray: Array<number> = new Array();

    onscrollBegan() {
        console.log('onscrollBegan');
        this.isFrirstMove = true;
        this.isBegan = true;
        let viewNode = this.scrollview.content.parent;
        let svLeftBottomPoint = viewNode.convertToWorldSpaceAR(
            cc.v2(
                viewNode.x - viewNode.anchorX * viewNode.width,
                viewNode.y - viewNode.anchorY * viewNode.height
            )
        );
        // 求出 ScrollView 可视区域在世界坐标系中的矩形（碰撞盒）
        let svBBoxRect: cc.Rect = cc.rect(
            svLeftBottomPoint.x,
            svLeftBottomPoint.y,
            viewNode.width,
            viewNode.height
        );
        this.statuArray = [];
        for (let i = 0; i < this.scrollview.content.childrenCount; i++) {
            this.statuArray.push(0);
        }
        for (let i = 0; i < this.scrollview.content.childrenCount; i++) {
            let childNode = this.scrollview.content.children[i];

            if (childNode.getBoundingBoxToWorld().intersects(svBBoxRect)) {
                this.statuArray[i] = 1;
            } else {
                this.statuArray[i] = 0;
            }
        }
    }

    onscrolling(e: any) {
        this.contentMove();
    }

    playSound() {
        cc.audioEngine.play(this.sliderAudio, false, 1);
    }

    onscrollEnd() {
        this.isBegan == false;
    }

    onTop() {

    }

    onbottom() {

    }

    contentMove() {
        console.log('contentMove');
        if (this.isFrirstMove == true) {
            this.isFrirstMove = false;
            return;
        }
        if (this.isBegan == false) {
            return;
        }
        let viewNode = this.scrollview.content.parent;
        let svLeftBottomPoint = viewNode.convertToWorldSpaceAR(
            cc.v2(
                viewNode.x - viewNode.anchorX * viewNode.width,
                viewNode.y - viewNode.anchorY * viewNode.height
            )
        );

        // 求出 ScrollView 可视区域在世界坐标系中的矩形（碰撞盒）
        let svBBoxRect: cc.Rect = cc.rect(
            svLeftBottomPoint.x,
            svLeftBottomPoint.y,
            viewNode.width,
            viewNode.height
        );
        let lastX = 0;
        let lastY = 0;
        for (let i = 0; i < this.scrollview.content.childrenCount; i++) {
            let childNode = this.scrollview.content.children[i];
            let isplaySound = true;
            if (this.scrollview.vertical == true) {
                if (childNode.y == lastY) {
                    isplaySound = false;
                }
                lastY = childNode.y;
            } else {
                if (childNode.x == lastX) {
                    isplaySound = false;
                }
                lastX = childNode.x;
            }
            if (i == 0) {
                isplaySound = true;
            }
            if (childNode.getBoundingBoxToWorld().intersects(svBBoxRect)) {
                if (this.statuArray[i] == 0) {
                    this.statuArray[i] = 1;
                }
            } else {
                if (this.statuArray[i] == 1) {
                    if (isplaySound == true) this.playSound();
                    this.statuArray[i] = 0;
                }
            }
        }
    }
}
