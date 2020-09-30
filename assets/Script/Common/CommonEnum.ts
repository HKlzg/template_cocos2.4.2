/******************************框架通用枚举，不需要改动******************************/
//互推预制件
enum RecommendPrefab {
    item = "RecommendItem",                 //基础类型的互推游戏节点
    drawer = "RecommendDrawer",             //矩阵抽屉
    banner = "RecommendBanner",
    matrix = "RecommendMatrix",
    primary = "RecommendPrimary",
    primary_tt = "RecommendPrimary_TT",
    btnCenter_tt = "RecommendBtnCenter_TT", //头条平台正中间的互推按钮
    btnSide_tt = "RecommendBtnSide_TT",     //头条平台靠边的互推按钮
}
//互推游戏节点类型
enum RecommendItemType {
    normal = "RecommendItem",       //基础类型，无任何动画、特效等效果，固定在屏幕上

}
//互推矩阵抽屉类型
enum RecommendDrawerType {
    left = 1,       //从左侧进入的抽屉
    right,          //从右侧进入的抽屉
}
//互推banner类型
enum RecommendBannerType {
    pingpong = 1,   //来回滚动
    left,           //永远向左滚动
    right,          //永远向右滚动
}
/**触摸控制器状态 */
enum CtrlState {
    none = 1,
    touched,    //按住状态
}

/**用于数据统计的视频事件 */
enum VideoSubType {
    showVideoBtn = 7,       //曝光，比如复活时看到观看视频按钮
    openVideoWindow = 0,    //主动触发打开视频窗口
    closeVideoWindow = 1,   //看到视频窗口后主动关闭
    clickBtnVideo = 2,      //点击播放视频
    videoQuit = 3,          //视频中途关闭视频
    videoSuc = 4,           //观看结束
    getAward = 5,           //获得奖励
    videoFail = 6,          //没有可观看的广告
}

/*****************框架通用枚举，可能需要根据实际游戏添加枚举值，添加后放到其他游戏中照样能正常运行*****************/
/**资源路径，可为本地路径或远程路径 */
enum UrlPath {
    //皮肤资源：
    /**皮肤资源根路径 */
    skinRootUrl = "myGame/Img/Skin/",
    /**皮肤贴图文件夹名 */
    skinTextureDir = "Textures",
    /**皮肤在商城的商品项显示图片的文件夹名 */
    skinItemDir = "Item",
    /**皮肤商品选中时在展示台显示的图片的文件夹名 */
    skinDisplayDir = "Display",
}
/**UI类型，枚举值与对应UI预制件、脚本名称相同 */
enum UI {
    lobby = "GameLobby",                //首页

    configSetting = "ConfigSettingUI",  //设置面板

    playerAssetBar = "PlayerAssetBar",  //玩家资产信息条
    getPower = "GetPowerUI",            //获取体力界面
    tipPower = "TipPowerUI",            //体力不足提示界面

    shop = "ShopUI",                    //商城界面
    chooseLevel = "ChooseLevelUI",      //关卡选择页面 

    levelInfo = "LevelInfoUI",          //关卡信息
    pauseLevel = "PauseLevelUI",        //关卡暂停面板
    trySkin = "TrySkinUI",              //皮肤试用界面
    levelTeach = "TeachAnim",           //关卡教学界面
    winUI = "WinUI",                    //胜利界面
    loseUI = "LoseUI",                  //失败界面
    resurgence = "ResurgenceUI",        //复活界面
}
/**游戏数据类型 */
enum GameDataType {
    /**关卡数据 */
    levelData = "LevelData",
    //皮肤
    playerSkin = "PlayerSkin",
}
/**商店中商品项的类型 */
enum GoodsType {
    /**主角皮肤 */
    playerSkin = "PlayerSkin",
}
//音效文件
enum AudioClip {
    clickBtn = "Common/Audio/clickBtn",
    win = "Common/Audio/win",
    lose = "Common/Audio/lose",
    BGM = "myGame/Audio/BGM1",
}
/**关卡状态 */
enum LevelState {
    inited = 1,     //关卡已初始化完成，但还未开始游戏
    playing,        //关卡进行中
    win,            //玩家已胜利
    lose,           //玩家已失败
    lobby,          //显示首页中

}

/**********************根据实际游戏设置的枚举值，由子类定义，这里仅作示例，不会包含到导出的类中**********************/
/**通过全局对象池管理的预制件名称与对应的脚本名称，这里仅作示例，不会包含到导出的类中，需在子类中定义 */
enum LevelPrefab {
    goldIcon = "GoldIcon",
}

/**
 * 定义全部通用的枚举值
 * 
 * 注：LevelPrefab 枚举类型必须在子类中定义
 */
export class CommonEnum {
    static RecommendPrefab = RecommendPrefab;
    static RecommendItemType = RecommendItemType;
    static RecommendDrawerType = RecommendDrawerType;
    static RecommendBannerType = RecommendBannerType;
    static CtrlState = CtrlState;
    static VideoSubType = VideoSubType;
    static UrlPath = UrlPath;
    static UI = UI;
    static GameDataType = GameDataType;
    static GoodsType = GoodsType;
    static AudioClip = AudioClip;
    static LevelState = LevelState;
}
