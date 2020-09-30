import yyComponent from "../Common/yyComponent";
import GlobalPool from "../Common/GlobalPool";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import RecommendDataManager from "./RecommendDataManager";

//互推游戏节点容器
const { ccclass, property } = cc._decorator;

@ccclass
export default class RecommendContainer extends yyComponent {
    @property(cc.Node)
    protected content: cc.Node = null;    //存放互推节点的父节点

    public init(data?: any) {

        this.onEvents();
        if (!!data) {
            this.setData(data);
        }
    }
    protected onEvents() {

    }
    public reset() {
        this.resetItems();
    }
    protected resetItems() {
        GlobalPool.putAllChildren(this.content);
    }
    public reuse(data: any) {
        this.reset();
        this.setData(data);
    }

    public unuse() {

    }

    protected setData(data: any) {
        let items = data.items;
        if (!items) {
            items = RecommendDataManager.getAllRecommendData();
        }
        this.addItems(items);
    }

    //添加互推游戏节点
    protected addItems(data: any[], type = GlobalEnum.RecommendItemType.normal) {
        for (let i = 0, count = data.length; i < count; ++i) {
            let item = this.getItem(type, data[i]);
            this.content.addChild(item);
        }
    }
    /**根据类型获取对应的预制件 */
    protected getItem(prefabName, data: any) {
        return GlobalPool.get(prefabName, data);
    }

    //设置布局组件
    protected setWidget(node: cc.Node, widget: any, targetNode?: cc.Node) {
        let wg = node.getComponent(cc.Widget);
        if (!wg) {
            wg = node.addComponent(cc.Widget);
        }
        wg.isAbsoluteBottom = true;
        wg.isAbsoluteLeft = true;
        wg.isAbsoluteRight = true;
        wg.isAbsoluteTop = true;
        wg.isAbsoluteHorizontalCenter = true;
        wg.isAbsoluteVerticalCenter = true;
        if (!widget) return;
        if (!!targetNode) {
            wg.target = targetNode;
        } else {
            wg.target = node.parent;
        }
        if (undefined != widget.top) {
            wg.isAlignTop = true;
            wg.top = parseFloat(widget.top);
        } else {
            wg.isAlignTop = false;
        }
        if (undefined != widget.bottom) {
            wg.isAlignBottom = true;
            wg.bottom = parseFloat(widget.bottom);
        } else {
            wg.isAlignBottom = false;
        }
        if (undefined != widget.left) {
            wg.isAlignLeft = true;
            wg.left = parseFloat(widget.left);
        } else {
            wg.isAlignLeft = false;
        }
        if (undefined != widget.right) {
            wg.isAlignRight = true;
            wg.right = parseFloat(widget.right);
        } else {
            wg.isAlignRight = false;
        }
        wg.isAlignHorizontalCenter = !!widget.horizontalCenter;
        wg.isAlignVerticalCenter = !!widget.verticalCenter;
        wg.updateAlignment();
    }
}
