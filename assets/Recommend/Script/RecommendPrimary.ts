
import RecommendItem from "./RecommendItem";
import RecommendContainer from "../../Script/Recommend/RecommendContainer";
import { GlobalEnum } from "../../Script/GameSpecial/GlobalEnum";
import RecommendDataManager from "../../Script/Recommend/RecommendDataManager";
//互推-主推，单个的互推节点分散在界面四周显示的互推组件
const { ccclass, property } = cc._decorator;

@ccclass
export default class RecommendPrimary extends RecommendContainer {
    //添加互推游戏节点
    protected addItems(data: any[], type = GlobalEnum.RecommendItemType.normal) {
        let ids = [].concat(RecommendDataManager.getAllRecommendData());
        let needScale = data.length > 2;
        for (let i = 0, count = data.length; i < count; ++i) {
            // let id = data[i].id;
            let id = i;
            if (id >= ids.length) {
                let index = Math.round(Math.random() * (ids.length - 1));
                id = ids[index].id;
                ids.splice(index, 1);
            }
            let item = this.getItem(type, id);
            this.content.addChild(item);
            if (needScale) {
                item.setScale(0.7, 0.7);
            }
            if (!!data[i].scale) {
                item.setScale(data[i].scale);
            }
            if (!!data[i].pos) {
                item.setPosition(data[i].pos);
            }
            this.setWidget(item, data[i].widget);
        }
    }
    protected setData(data: any) {
        let items = data.items;
        if (!items) {
            items = RecommendDataManager.getAllRecommendData();
        }
        this.addItems(items);
        //自动轮播
        if (undefined === data.autoUpdate || !!data.autoUpdate) {
            this.autoUpdateItem();
        }
    }
    public unuse() {
        this.reset();
        this.stopUpdateItem();
    }
    /**启动自动轮播 */
    protected autoUpdateItem() {
        this.schedule(this.updateItems, 3);
    }
    protected stopUpdateItem() {
        this.unschedule(this.updateItems);
    }
    /**更新主推内容(轮播) */
    protected updateItems() {
        let count = this.content.childrenCount;
        let ids = RecommendDataManager.getAllRecommendData();
        let index = this.content.children[count - 1].getComponent(RecommendItem).getRecommendId();
        for (let i = 0; i < count; ++i) {
            index += 1;
            if (index >= ids.length) {
                index = 0;
            }
            this.content.children[i].getComponent(RecommendItem).setData(ids[index]);
        }
    }
}
