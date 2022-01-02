import * as Quadtree from './lib/quadtree';
import SichashuContainer from './SichashuContainer';
import SichashuDraggableItem from './SichashuDraggableItem';
import SichashuItemm, { ItemStatus } from './SichashuItemm';

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

interface ItemRect extends Quadtree.Rect {
    item: SichashuItemm;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Sichashu extends cc.Component {

    @property(cc.Node)
    backMenuNode: cc.Node = null;

    @property(SichashuContainer)
    protected container: SichashuContainer = null;

    @property(cc.Graphics)
    protected graphics: cc.Graphics = null;

    @property(SichashuDraggableItem)
    protected dragItem: SichashuDraggableItem = null;

    @property(cc.Node)
    protected add1Item: cc.Node = null;

    @property(cc.Node)
    protected add10Item: cc.Node = null;

    @property(cc.Node)
    protected clearNode: cc.Node = null;

    /** 四叉树组件 */
    protected quadTree: Quadtree = null;

    protected init: boolean = true;

    protected onLoad() {
        this.add1Item.on(cc.Node.EventType.TOUCH_END, this.onAdd1Item, this);
        this.add10Item.on(cc.Node.EventType.TOUCH_END, this.onAdd10Item, this);
        this.clearNode.on(cc.Node.EventType.TOUCH_END, this.onClearNode, this);
    }

    protected start() {
        this.initQuadTree();

        this.backMenuNode.on(cc.Node.EventType.TOUCH_END, () => {
            cc.director.loadScene('main');
        });
    }

    /**
     * 初始化四叉树
     */
    protected initQuadTree() {
        // 获取在世界坐标系下的包围盒
        const rect = this.container.rect;
        this.quadTree = new Quadtree({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        });
    }

    /**
     * 帧更新
     */
    protected update() {
        // 碰撞检测
        this.doCollision();
    }

    /**
     * 碰撞检测
     */
    protected doCollision() {
        // 更新四叉树
        this.updateQuadTree();
        // 绘制四叉树节点
        this.drawQuadTreeNodes();
        // 筛选物体
        const rect = this.dragItem.rect,
            info = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
            },
            candidates = this.quadTree.retrieve<ItemRect>(info);
        // 遍历候选物体
        for (let index = 0; index < candidates.length; index++) {
            // 更新物体状态
            const item = candidates[index].item;
            if (rect.intersects(item.rect)) {
                item.updateStatus(ItemStatus.COLLISION);
            } else {
                item.updateStatus(ItemStatus.CANDIDATE);
            }
        }

    }

    /**
     * 绘制四叉树节点
     */
    protected drawQuadTreeNodes() {
        // 清除旧路径
        const graphics = this.graphics;
        graphics.clear();
        graphics.strokeColor = cc.color(255, 0, 0, 150);
        // 递归函数
        let creatorPath = (tree: Quadtree) => {
            const subTrees = tree.nodes;
            // 是否有子节点?
            // 没有子节点才绘制路径
            if (subTrees.length === 0) {
                const rect = tree.bounds;
                graphics.rect(rect.x, rect.y, rect.width, rect.height);
            } else {
                // 递归子节点
                for (let index = 0; index < subTrees.length; index++) {
                    creatorPath(subTrees[index]);
                }
            }
        }
        // 递归生成路径
        creatorPath(this.quadTree);
        // 绘制路径
        graphics.stroke();
    }

    /**
     * 更新四叉树
     */
    protected updateQuadTree() {
        // 重置四叉树
        const quadTree = this.quadTree;
        quadTree.clear();
        // 遍历所有物体
        const items = this.container.items;
        for (let index = 0, length = items.length; index < length; index++) {
            const item = items[index];
            // 重置物体状态
            item.updateStatus(ItemStatus.NONE);
            // 插入到四叉树中
            const rect = item.rect;
            const info: ItemRect = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                item: item
            };
            quadTree.insert(info);
        }
    }

    protected onAdd1Item() {
        this.container.addItem();
    }

    protected onAdd10Item() {
        let count = 10;
        while (count--) {
            this.container.addItem();
        }
    }

    protected onClearNode() {
        this.container.clearItems();
    }
}
