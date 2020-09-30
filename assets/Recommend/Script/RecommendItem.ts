import yyComponent from "../../Script/Common/yyComponent";
import RecommendDataManager from "../../Script/Recommend/RecommendDataManager";
import { EventType } from "../../Script/GameSpecial/GameEventType";
import RecommendImageManager from "../../Script/Recommend/RecommendImageManager";
import MyAtlasSprite from "../../Script/Recommend/MyAtlasSprite";

const { ccclass, property } = cc._decorator;
/**
 * 推荐游戏节点
 */
@ccclass
export default class RecommendItem extends yyComponent {
    @property(cc.Node)
    private gameIcon: cc.Node = null;     //游戏图标
    @property(cc.Label)
    private gameName: cc.Label = null;      //游戏名称

    private recommendId: number;    //互推数据id
    /**互推数据id */
    public getRecommendId() { return this.recommendId; }

    public init(data?: number) {
        this.node.setPosition(0, 0);
        this.node.setScale(1, 1);
        this.onEvents();
        if (undefined !== data) {
            this.setData(data);
        }
    }
    protected onEvents() {
        this.node.on("touchend", this.onClick, this);
    }
    public reset() {
        this.node.setPosition(0, 0);
        this.node.setScale(1, 1);
        let wg = this.node.getComponent(cc.Widget);
        if (!!wg) {
            wg.isAbsoluteBottom = false;
            wg.isAbsoluteLeft = false;
            wg.isAbsoluteRight = false;
            wg.isAbsoluteTop = false;
        }
    }
    public reuse(data: number) {
        this.reset();
        this.setData(data);
    }
    public unuse() {

    }

    public setData(data: number | { id: number, iconName: string, gameName: string }) {
        let recommendData;
        if (typeof data === "number") {
            if (this.recommendId === data) return;
            recommendData = RecommendDataManager.getRecommendData(data);
        } else {
            if (this.recommendId === data.id) return;
            recommendData = data;
        }
        this.recommendId = recommendData.id;
        //与已有数据相同时不需要再次设置
        //图标
        this.setGameIcon(recommendData.gameIcon);
        //名字
        this.setGameName(recommendData.gameName);
    }
    private setGameIcon(gameIcon: string) {
        //本地图片：
        // this.gameIcon.getComponent(cc.Sprite).spriteFrame = RecommendDataManager.getGameIcon(gameIcon);

        //远程地址图片
        RecommendImageManager.load(gameIcon, (data) => {
            data.width = this.node.width;
            data.height = this.node.height;
            this.gameIcon.getComponent(MyAtlasSprite).setAtlasData(data);
        });
    }
    private setGameName(n: string) {
        this.gameName.string = n;
    }

    //点击节点
    private onClick() {
        this.emit(EventType.RecommendEvent.clickRecommendItem, this.recommendId);
    }
}
