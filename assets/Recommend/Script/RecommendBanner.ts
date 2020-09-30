import RecommendContainer from "../../Script/Recommend/RecommendContainer";
import RecommendDataManager from "../../Script/Recommend/RecommendDataManager";
import { GlobalEnum } from "../../Script/GameSpecial/GlobalEnum";
import GlobalPool from "../../Script/Common/GlobalPool";

//水平滚动显示的互推列表
const { ccclass, property } = cc._decorator;

@ccclass
export default class RecommendBanner extends RecommendContainer {

    /**容器节点 */
    @property(cc.Node)
    protected banner: cc.Node = null;
    /**显示互推列表的容器的布局组件 */
    @property(cc.Widget)
    protected bannerWidget: cc.Widget = null;

    /**列表的父节点，带cc.Mask组件 */
    @property(cc.Node)
    protected maskNode: cc.Node = null;

    /**朝一个方向循环滚动时需要的列表节点的副本 */
    @property(cc.Node)
    protected content_copy: cc.Node = null;

    /**列表滚动速度，单位：像素/秒 */
    protected scrollSpd: number;

    protected type;
    protected data: any;

    public init(data?: any) {
        this.scrollSpd = 50;
        this.onEvents();
        if (!!data) {
            this.setData(data);
            this.startScroll();
        }
    }

    public reset() {
        this.clearContent_copy();
        this.content.stopAllActions();
        this.resetItems();
    }

    public reuse(data: any) {
        this.node.active = true;
        this.reset();
        this.setData(data);
        this.startScroll();
    }
    public unuse() {
        this.reset();
        this.unschedule(this.startScroll);
    }

    /**
   * 设置组件数据
   * @param data 
   * @param [data.type]       组件类型枚举值
   * @param [data.itemType]   互推节点类型枚举值
   * @param [data.items]      互推节点数据数组
   */
    protected setData(data: any) {
        this.data = data;
        let items = data.items;
        //默认使用全部互推数据
        if (!items) {
            items = RecommendDataManager.getAllRecommendData();
        }
        this.addItems(items, data.itemType);
        this.content.getComponent(cc.Layout).updateLayout();
        this.setType(data.type);
        this.setBannerPos();
    }
    /**设置坐标 */
    protected setBannerPos() {
        if (undefined != this.data.scale) {
            this.banner.setScale(this.data.scale);
        }
        if (undefined != this.data.pos) {
            this.banner.setPosition(this.data.pos);
        }
        if (undefined != this.data.widget) {
            this.setWidget(this.banner, this.data.widget);
        }
    }
    /**设置banner类型 */
    protected setType(type) {
        this.type = type;
        switch (type) {
            case GlobalEnum.RecommendBannerType.pingpong: {
                this.clearContent_copy();
                break;
            }
            case GlobalEnum.RecommendBannerType.left: {
                this.setContent_copy();
                break;
            }
        }
    }

    /**开始自动滚动显示列表 */
    protected startScroll() {
        this.scheduleOnce(this.autoScroll, 0);
    }
    protected autoScroll() {
        switch (this.type) {
            case GlobalEnum.RecommendBannerType.pingpong: {
                this.scrollPingPongReverse();
                break;
            }
            case GlobalEnum.RecommendBannerType.left: {
                this.scheduleOnce(this.scrollLeft, 0);
                break;
            }
        }
    }
    /**来回循环滚动 */
    protected scrollPingPongReverse() {
        this.content.stopAllActions();
        this.content.x = 0;
        let len = this.content.width;
        let width = this.maskNode.width;
        let dis = len - width;
        if (dis <= 0) return;
        let duration = dis / this.scrollSpd;
        let ping = cc.moveBy(duration, -dis, 0);
        let pong = cc.moveBy(duration, dis, 0);
        this.content.runAction(cc.repeatForever(cc.sequence(ping, pong)));
    }
    /**永远向左滚动 */
    protected scrollLeft() {
        this.content.stopAllActions();
        this.content.x = 0;
        this.moveToLeftHalf(this.content);
        this.content_copy.stopAllActions();
        this.content_copy.x = this.content.width;
        this.moveToLeftRepeat(this.content_copy);
    }
    protected moveToLeftRepeat(node) {
        let dis = node.width;
        let duration = 2 * dis / this.scrollSpd;
        let move = cc.moveBy(duration, -dis * 2, 0);
        let recover = cc.moveTo(0, dis, 0);
        node.runAction(cc.repeatForever(cc.sequence(move, recover)));
    }
    protected moveToLeftHalf(node) {
        let dis = node.width;
        let duration = dis / this.scrollSpd;
        let move = cc.moveBy(duration, -dis, 0);
        node.runAction(cc.sequence(move, cc.callFunc(this.onMoveToLeftHalfFinish, this, node)));
    }
    protected onMoveToLeftHalfFinish(node) {
        node.x = node.width;
        this.moveToLeftRepeat(node);
    }
    /**创建列表节点的副本 */
    protected setContent_copy() {
        this.clearContent_copy();
        let items = this.data.items;
        //默认使用全部互推数据
        if (!items) {
            items = RecommendDataManager.getAllRecommendData();
        }
        for (let i = 0, count = items.length; i < count; ++i) {
            let item = this.getItem(this.data.itemType, items[i]);
            this.content_copy.addChild(item);
        }
        this.content_copy.getComponent(cc.Layout).updateLayout();
    }
    /**移除列表节点的副本 */
    protected clearContent_copy() {
        this.content_copy.stopAllActions();
        GlobalPool.putAllChildren(this.content_copy);
    }

    //关闭节点
    private onBtnClose() {
        this.node.active = false;
    }
}
