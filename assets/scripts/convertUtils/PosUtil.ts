// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PosUtil {

    /**
     * openGL坐标转Tile坐标
     * @param tiledMap 
     * @param point 
     */
    static openglToTile(tiledMap: cc.TiledMap, point: cc.Vec2): cc.Vec2 {
        let mapSize: cc.Size = tiledMap.getMapSize();
        let tileSize: cc.Size = tiledMap.getTileSize();
        let tileX = Math.floor(point.x / tileSize.width);
        let tileY = Math.floor((mapSize.height * tileSize.height - point.y) / tileSize.height);
        return cc.v2(tileX, tileY);
    }

    /**
     * Tile坐标转openGL坐标
     * @param tiledMap 
     * @param tilePoint 
     */
    static tileToOpengl(tiledMap: cc.TiledMap, tilePoint: cc.Vec2): cc.Vec2 {
        let mapSize: cc.Size = tiledMap.getMapSize();
        let tileSize: cc.Size = tiledMap.getTileSize();
        let x = tilePoint.x * tileSize.width + tileSize.width / 2;
        let y = (mapSize.height - tilePoint.y) * tileSize.height - tileSize.height / 2;
        return cc.v2(x, y);
    }
}
