import RecommendConfig from "./RecommendConfig";
import EventManager from "../Common/EventManager";
import { EventType } from "../GameSpecial/GameEventType";
import GamePlatform from "../Platform/GamePlatform";
import { GamePlatformType } from "../Platform/GamePlatformType";
import GlobalPool from "../Common/GlobalPool";
import Loader from "../Common/Loader";
import { AdConfig } from "./AdConfig";
import http_request from "../Common/http_request";
import CryptoAes from "../Common/CryptoAes";
/**互推需要的资源类型 */
let AssetType = {
    config: 1,          //互推配置表
    gameIcon: 2,        //游戏图标
    prefab: 3,          //互推预制件
}
//互推配置数据管理器
export default class RecommendDataManager {
    private static config: any = {};
    private static data: any = {};
    /**存储所有游戏图标资源 */
    private static gameIcons: { [key: string]: cc.SpriteFrame };
    /**记录所有互推需要的资源是否已加载完成 */
    private static assetState: { [key: number]: boolean };
    /**是否已加载完所有资源 */
    private static allAssetLoad: boolean;
    public static init(node?: cc.Node) {
        this.allAssetLoad = false;
        this.assetState = {};
        let str = this.getJsonName(node);
        if (!!str) {
            Loader.loadBundle("Recommend", () => {
                this.loadConfig(str);
                this.loadPrefab();
                this.loadGameIcon();
            }, false);
        }
    }

    /**资源加载完成回调 */
    private static loadFinish(key: number) {
        this.assetState[key] = true;
        //若全部资源加载完成，则发送事件，通知互推节点更新内容
        let finish = true;
        for (let key in AssetType) {
            if (!this.assetState[AssetType[key]]) {
                finish = false;
                break;
            }
        }
        if (finish) {
            this.allAssetLoad = true;
            this.assetState = null;
            EventManager.emit(EventType.RecommendEvent.assetLoadFinish);
        }
    }
    /**加载互推配置表 */
    private static loadConfig(str: string) {
        Loader.loadBundleRes("Recommend", "Config/" + str, (res) => {
            if (null === res) {
                console.log("互推配置表加载失败：", str);
                return;
            }
            this.config = res.json;
            this.loadFinish(AssetType.config);
            this.loadRemoteConfig_WX();
        }, cc.JsonAsset, false);
    }
    protected static configState = {};
    /**从服务端拉取互推数据并缓存 */
    protected static loadRemoteConfig_WX() {
        this.data = {};
        let config = AdConfig.AdID;
        for (let key in config) {
            this.configState[key] = {
                load: false,
                cb: null,
            };
            let data = { softid: GamePlatform.instance.Config.appId, locationid: config[key] };
            http_request.getInstance().postRequest(http_request.url_ad + "v1.2/api/getAdv.html", data, (response) => {
                let msg = JSON.parse(CryptoAes.aesDecrypt(response.result));
                console.log('互推数据：', msg);
                this.data[config[key]] = msg;
                this.configState[key].load = true;
                if (!!this.configState[key].cb) {
                    this.configState[key].cb(this.config[key], msg);
                    this.configState[key].cb = null;
                }
            });
        }
    }
    /**根据游戏平台获取互推配置文件名 */
    private static getJsonName(node?: cc.Node): string {
        let config: RecommendConfig = null;
        if (!!node) {
            config = node.getComponent(RecommendConfig);
        }
        if (!config) {
            switch (GamePlatform.instance.Config.type) {
                case GamePlatformType.OPPO: return "RecommendConfig_OPPO";
                case GamePlatformType.QQ: return null;
                case GamePlatformType.TT: return "RecommendConfig_TT";
                case GamePlatformType.WX: return "RecommendConfig_WX";
                // case GamePlatformType.PC: return "RecommendConfig_WX";
                case GamePlatformType.VIVO: return null;
                default: return null;
            }
        } else {
            switch (config.type) {
                case RecommendConfig.recommendPlatformType.OPPO: return "RecommendConfig_OPPO";
                case RecommendConfig.recommendPlatformType.QQ: return null;
                case RecommendConfig.recommendPlatformType.TT: return "RecommendConfig_TT";
                case RecommendConfig.recommendPlatformType.WX: return "RecommendConfig_WX";
                case RecommendConfig.recommendPlatformType.PC: return "RecommendConfig_WX";
                case RecommendConfig.recommendPlatformType.VIVO: return null;
                case RecommendConfig.recommendPlatformType.Youzi: return "RecommendConfig_Youzi";

                default: return null;
            }
        }
    }
    /**加载互推使用的所有预制件 */
    private static loadPrefab() {
        let url = "Prefab/";
        switch (GamePlatform.instance.Config.type) {
            case GamePlatformType.TT: {
                url += "Recommend_TT";
                break;
            }
            case GamePlatformType.PC:
            default: {
                url += "Common";
                break;
            }
        }
        Loader.loadBundleDir("Recommend", url, (res) => {
            if (null === res) {
                console.log("互推预制件加载失败:", url);
                return;
            }
            for (let i = res.length - 1; i >= 0; --i) {
                let prefab: cc.Prefab = res[i];
                GlobalPool.createPool(prefab.name, prefab, prefab.name);
            }
            this.loadFinish(AssetType.prefab);
        }, cc.Prefab, false);
    }
    /**加载所有互推游戏的icon */
    private static loadGameIcon() {
        this.loadFinish(AssetType.gameIcon);
        return;
        let url = "GameIcon/";
        switch (GamePlatform.instance.Config.type) {
            case GamePlatformType.OPPO: {
                url += "Icon_OPPO";
                break;
            }
            case GamePlatformType.TT: {
                url += "Icon_TT";
                break;
            }
            case GamePlatformType.PC:
            default: {
                url += "Common";
                break;
            }
        }
        Loader.loadBundleDir("Recommend", url, (res) => {
            if (null === res) {
                console.log("加载互推图片失败");
                return;
            }
            this.gameIcons = {};
            for (let i = res.length - 1; i >= 0; --i) {
                this.gameIcons[res[i].name] = res[i];
            }
            this.loadFinish(AssetType.gameIcon);
        });
    }
    // /**
    //  * 获取互推数据 
    //  * @param id    互推数据id
    //  */
    // public static getRecommendData(id: number) {
    //     if (!this.data) return null;
    //     return this.data.data[id];
    // }
    // /**
    //  * 获取全部互推数据
    //  */
    // public static getAllRecommendData() {
    //     if (!this.data) return [];
    //     return this.data.data;
    // }
    // /**
    //  * 获取互推游戏的图标
    //  * @param icon 游戏图标文件名
    //  */
    // public static getGameIcon(icon: string): cc.SpriteFrame {
    //     return this.gameIcons[icon];
    // }
    /**
     * 获取指定场景的互推配置
     * @param scene     场景/UI类型
     * @param cb        配置数据未拉取完成时，将此方法作为拉取完成后的回调
     */
    public static showRecommend(scene, cb) {
        if (!!this.data[scene]) {
            cb(this.config[scene], this.data[scene]);
        } else if (!!this.configState[scene]) {
            this.configState[scene].cb = cb;
        } else {
            console.warn("互推位置不存在：", scene);
        }
    }
    /**
     * 取消页面配置加载完成后的回调
     * @param scene 
     */
    public static hideRecommend(scene) {
        if (!!this.configState[scene]) {
            this.configState[scene].cb = null;
        }
    }
}