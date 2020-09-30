import RecommendContainer from "../../Script/Recommend/RecommendContainer";
import RecommendDataManager from "../../Script/Recommend/RecommendDataManager";

//互推矩阵
const { ccclass, property } = cc._decorator;

@ccclass
export default class RecommendMatrix extends RecommendContainer {
    @property(cc.Node)
    private matrix: cc.Node = null;

    protected setData(data: any) {
        if (!!data.scale) {
            this.matrix.setScale(data.scale);
        }
        if (!!data.pos) {
            this.matrix.setPosition(data.pos);
        }
        if (!!data.widget) {
            this.setWidget(this.matrix, data.widget);
        }
        let items = data.items;
        //默认使用全部互推数据
        if (!items) {
            items = [].concat(RecommendDataManager.getAllRecommendData());
            if (items.length > 8) {
                items.length = 8;
            }
        }
        this.addItems(items, data.itemType);
    }
}
