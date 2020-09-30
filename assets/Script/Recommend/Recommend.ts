import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";
import GlobalPool from "../Common/GlobalPool";
import RecommendDataManager from "./RecommendDataManager";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import { AdConfig } from "./AdConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Recommend extends yyComponent {
    /**显示互推的场景/UI，使用堆栈来管理 */
    protected sceneStack;
    /**是否已作出计划要根据场景更新互推内容 */
    protected scheduledRecommend: boolean;

    public init() {
        this.scheduledRecommend = false;
        this.initSceneStack();
        this.onEvents();
    }
    protected onEvents() {
        this.once(EventType.RecommendEvent.assetLoadFinish, this.onConfigLoadFinish, this);
        this.on(EventType.RecommendEvent.clickRecommendItem, this.navigateGame, this);
        this.on(EventType.RecommendEvent.hideRecommend, this.onHideRecommend, this);
        // this.on(EventType.RecommendEvent.enterRecommendScene, this.onEnterScene, this);
        // this.on(EventType.RecommendEvent.exitRecommendScene, this.onExitScene, this);
        this.on(EventType.UIEvent.entered, this.onEnterScene, this);
        this.on(EventType.UIEvent.exited, this.onExitScene, this);
    }
    protected initSceneStack() {
        this.sceneStack = [];
    }
    /**回收所有主推游戏节点 */
    public reset() {
        this.scheduledRecommend = false;
        this.resetSceneStack();
        GlobalPool.putAllChildren(this.node);
    }
    protected resetSceneStack() {
        this.sceneStack = [];
    }

    /**跳转到其他小游戏 */
    protected navigateGame(data: any) {
        this.emit(EventType.SDKEvent.navigateToMiniProgram, data);
    }

    /**进入需要显示互推的场景/UI */
    protected onEnterScene(scene) {
        if (undefined === scene || null === scene) return;
        //未对该场景进行互推配置时，不对其进行记录
        let config = AdConfig.AdID[scene];
        if (undefined === config) return;
        let curScene = this.getCurScene();
        if (curScene == scene) return;
        for (let i = this.sceneStack.length - 1; i >= 0; --i) {
            if (this.sceneStack[i] == scene) {
                this.sceneStack.splice(i, 1);
                break;
            }
        }
        this.sceneStack.push(scene);
        this.updateRecommends();
    }
    /**获取当前显示在最上层的互推场景/UI */
    protected getCurScene() {
        let count = this.sceneStack.length;
        if (count == 0) return null;
        return this.sceneStack[count - 1];
    }
    /**退出需要显示互推的场景/UI */
    protected onExitScene(scene) {
        if (undefined === scene || null === scene) return;
        //未对该场景进行互推配置时，不需要进行处理
        let config = AdConfig.AdID[scene];
        if (undefined === config) return;
        RecommendDataManager.hideRecommend(scene);
        let curScene = this.getCurScene();
        if (curScene == scene) {
            this.sceneStack.pop();
            this.updateRecommends();
        } else {
            for (let i = this.sceneStack.length - 1; i >= 0; --i) {
                if (this.sceneStack[i] == scene) {
                    this.sceneStack.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**互推配置表加载完毕，延迟更新互推内容 */
    protected onConfigLoadFinish() {
        console.log("互推资源加载完毕，更新互推内容，scheduledRecommend:", this.scheduledRecommend);
        this.updateRecommends();
    }

    /**切换UI/场景，显示对应的互推内容 */
    protected updateRecommends() {
        //使用计时器，到下一帧才更新互推内容，
        //避免游戏中执行初始化、重置等流程时场景/UI切换过多，
        //需要在一帧中反复显隐互推内容
        if (this.scheduledRecommend) return;
        this.scheduleOnce(this.showCurSceneRecommend, 0);
        this.scheduledRecommend = true;
    }
    /**根据显示在最上层的场景/UI，显示相应的互推内容 */
    protected showCurSceneRecommend() {
        this.scheduledRecommend = false;
        GlobalPool.putAllChildren(this.node);
        for (let i = this.sceneStack.length - 1; i >= 0; --i) {
            let scene = this.sceneStack[i];
            if (!!AdConfig.AdID[scene]) {
                RecommendDataManager.showRecommend(scene, this.addRecommend);
                break;
            }
        }
    }
    /**
     * 添加互推子节点
     * @param config    当前页面的互推配置，含互推预制件名称，布局数据等
     * @param data      当前页面的互推节点数据
     */
    protected addRecommend(config, data) {
        for (let key in config) {
            let node = GlobalPool.get(key, data);
            this.node.addChild(node);
        }
    }


    /**隐藏互推 */
    protected onHideRecommend(recommend?: any) {

    }
}
