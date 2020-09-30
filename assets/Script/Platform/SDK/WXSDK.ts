import SDK from "./SDK";
import GamePlatform from "../GamePlatform";
import { EventType } from "../../GameSpecial/GameEventType";
import EventManager from "../../Common/EventManager";
import http_request from "../../Common/http_request";
import { UserInfo } from "../../GameSpecial/PlayerDataTemplate";



export default class WXSDK extends SDK {
    protected apiName: string = 'wx';
    public sceneid = 0;
    protected channel_id;

    public init() {
        this.api = window[this.apiName];

        this.systemInfo = this.api.getSystemInfoSync();
        console.log("系统信息：");
        console.log(JSON.stringify(this.systemInfo));

        // this.api.onShareAppMessage(() => ({}));
        this.api.showShareMenu({ withShareTicket: false });

        this.login();
    }

    /**
     * 使用微信小游戏内置方法
     * @param {object} wCall    回调函数 
     * @param {object} self     识别对象
     */
    public login(wCall = null, self = null,) {
        // window['game_id'] = this.game_id;
        let launch_data = this.api.getLaunchOptionsSync(); //获取微信登陆信息 
        console.log('launch_data', launch_data);
        this.channel_id = launch_data.query.channelId;
        this.sceneid = launch_data.scene;
        let that = this;
        this.api.login({
            success: (res) => {
                console.log('wx loagin success!!!', res);
                if (res.code) {
                    let codeUrl = "v1.1/api/User/sendSessionCode.html";
                    http_request.getInstance().postRequest(http_request.url_login + codeUrl, { "code": res.code }, (login_res) => {
                        console.log('request sendSessionCode', login_res);
                        UserInfo.needuserinfo = login_res.result.needuserinfo;
                        UserInfo.openid = login_res.result.openid;
                        UserInfo.sessid = login_res.result.sessid;
                        UserInfo.userid = login_res.result.userid;
                        onShowShareMenu(login_res.result.sessid, that);
                        EventManager.emit(EventType.SDKEvent.inited);
                        //从其他游戏跳转到本游戏时，上报数据
                        let uclickUl = http_request.url_buy + "v1.1/api/Activity/uclick.html";
                        let fromapp = launch_data.referrerInfo.appId ? launch_data.referrerInfo.appId : "";
                        let key = launch_data.query.key ? launch_data.query.key : "";
                        let msg = {
                            appid: this.config.appId,
                            openid: cc.sys.localStorage.getItem("openid"),
                            // posttime: Timer_manager.getInstance().getNowTimes(),
                            posttime: Math.floor(Date.now() * 0.001),
                            key: key,
                            wxopenid: login_res.result.openid,
                            fromapp: fromapp,
                        }
                        http_request.getInstance().postRequest(uclickUl, msg, (uclickData) => {
                            console.log('uclickData', uclickData)
                            onShow(false, uclickData.Result.OpenId);
                            cc.sys.localStorage.setItem("openid", JSON.stringify(uclickData.Result.OpenId));
                        });
                        //用户授权
                        // getSetting();
                    });
                }
            },
            fail: (res) => {
                console.log('login失败', res);
            }
        })

        function getSetting() {
            const version = this.api.getSystemInfoSync().SDKVersion
            const verres = compareVersion(version, '2.0.1');
            console.log('verres', verres);

            window['user_info'] = [];

            this.api.getSetting({
                success(res) {
                    console.log('获取微信用户当前设置成功', res);
                    if (res.authSetting['scope.userInfo'] || verres != 1) {
                        console.log('用户无授权');
                        this.api.getUserInfo({
                            success(res) {
                                console.log('this.api.getUserInfo', res);
                                if (typeof res.userInfo == "undefined" || res.errMsg == "getUserInfo:fail auth deny") {
                                    console.log(res.errMsg)
                                }
                                else {
                                    window['user_info'] = res.userInfo;
                                    // onShow(false);
                                }
                            }
                        })
                    } else {
                        console.log('创建授权按钮');
                        let button = this.api.createUserInfoButton({
                            type: 'text',
                            text: '',
                            style: {
                                left: 0,
                                top: 0,
                                width: cc.winSize.width,
                                height: cc.winSize.height,
                                lineHeight: cc.winSize.height,
                                textAlign: 'center',
                                backgroundColor: '',
                                color: '',
                                fontSize: 18,
                                opacity: 0.1,
                                borderRadius: 4
                            }
                        })
                        // console.log("wx button show");
                        button.onTap((res) => {
                            if (typeof res.userInfo == "undefined" || res.errMsg == "getUserInfo:fail auth deny") {
                                console.log(res.errMsg)
                            }
                            else {
                                console.log('wx 授权成功', res);
                                // http_request.Instance.postRequest("report/auth", that.post_data, (auth_res: any) => {

                                // });
                                button.destroy();
                                window['user_info'] = res.userInfo;
                                // onShow(true);
                            }
                        })
                    }
                }
            })
        }

        function onShow(useCb = false, game_openid) {

            that.onshow_time = this.api.getPerformance().now();
            // 微信小程序从后台回到小程序时候调用
            this.api.onShow(function () {
                that.onshow_time = this.api.getPerformance().now();
                EventManager.emit(EventType.AudioEvent.resume);

                // that.wxAudioMusicResume();
                // SoundManager.getInstance().resumeMusic();
                // console.log("onShow_time = " + that.onshow_time);
            });

            // 微信小程序隐藏到后台
            this.api.onHide(function () {
                // SoundManager.getInstance().pauseMusic();
                that.onhide_time = this.api.getPerformance().now();
                let dif_time = Math.floor((that.onhide_time - that.onshow_time) / 1000);
                if (!game_openid) return;
                // 记录玩家在当前游戏中停留的时长
                let url = http_request.url_buy + "v1.1/api/Activity/stay.html";
                let online_post_data = {
                    appid: that.config.appId,
                    openid: game_openid,
                    posttime: Math.floor(Date.now() * 0.001),
                    time: dif_time
                };
                http_request.getInstance().postRequest(url, online_post_data, (online_time_res: any) => { });
            }.bind(this));
            wCall && wCall.call(self);
        }

        function compareVersion(v1, v2) {
            v1 = v1.split('.')
            v2 = v2.split('.')
            const len = Math.max(v1.length, v2.length)

            while (v1.length < len) {
                v1.push('0')
            }
            while (v2.length < len) {
                v2.push('0')
            }

            for (let i = 0; i < len; i++) {
                const num1 = parseInt(v1[i])
                const num2 = parseInt(v2[i])

                if (num1 > num2) {
                    return 1
                } else if (num1 < num2) {
                    return -1
                }
            }

            return 0;
        }
        //分享图片与标题设置
        function onShowShareMenu(sessid, target) {
            let url = "v1.1/api/Utils/init.html";
            http_request.getInstance().postRequest(http_request.url_login + url, { "sessid": sessid }, (share_info_res: any) => {
                target.objShareData = share_info_res.result.share;
                this.api.showShareMenu({
                    withShareTicket: true
                });
                let index = Math.floor(Math.random() * (target.objShareData.length - 1));
                console.log('onShareAppMessage index', index);
                console.log('share_info_res.share[index]', share_info_res.result.share[index]);

                this.api.onShareAppMessage(() => {
                    return {
                        title: share_info_res.result.share[index].title,
                        imageUrl: share_info_res.result.share[index].img // 图片 URL
                    }
                })

            })
        }
    }

    public triggerGC() {
        this.api.triggerGC();
    }

    //video
    public showVideoAd(videoName?: any) {
        let id = this.getVideoAdUnitId(videoName);
        if (!id) {
            this.onVideoFail("视频id获取失败");
            return;
        }
        if (!this.videoAd) {
            this.videoAd = this.api.createRewardedVideoAd({ adUnitId: id });
            this.videoAd.onLoad(() => {
                console.log("视频广告加载完毕");
            });
            this.videoAd.onError((err) => {
                console.log("视频广告错误：", JSON.stringify(err));
            });
            this.videoAd.onClose((res) => {
                // 小于 2.1.0 的基础库版本，res 是一个 undefined
                if (res && res.isEnded || res === undefined) {
                    this.onVideoSuccess();
                } else {
                    this.onVideoQuit();
                    this.onVideoHide();
                }
            });
        }
        this.videoAd.show().then(this.onVideoShow.bind(this))
            .catch((err) => {
                this.videoAd.load()
                    .then(() => {
                        this.videoAd.show().then(this.onVideoShow.bind(this));
                    })
                    .catch(this.onVideoFail.bind(this));
            });
    }

    protected banners: { [id: string]: { banner: any, state: number, needShow: boolean, createTime: number } } = {};//state: 0-加载中，1-已加载完成，未显示，2-已加载完成且正在显示
    /**
     * 打开banner
     */
    public showBanner(ui?: string) {
        let id = this.getBannerId(ui);
        if (!!this.banners[id] && this.banners[id].state == 2) return;
        this.removeBanner();
        if (!!this.banners[id]) {
            switch (this.banners[id].state) {
                case 0: {
                    this.banners[id].needShow = true;
                    break;
                }
                case 1: {
                    this.banners[id].banner.show().then(() => {
                        this.onBannerShow();
                        this.banners[id].state = 2;
                        this.banners[id].needShow = false;
                    });
                    break;
                }
                case 2: {
                    break;
                }
            }
        } else {
            this.preCreateBanner(id);
            this.banners[id].needShow = true;
        }
    }

    /**创建新的banner的时间 */
    protected createBannerTime: number = 0;
    /**banner加载成功后是否需要立即显示 */
    protected needShowBanner: boolean = false;
    /**banner是否已加载完毕 */
    protected bannerLoaded: boolean = false;
    /**预先创建banner，创建的banner在加载完成时，会根据 needShowBanner 确定是否需要立即显示 */
    public preCreateBanner(id) {
        let banner = this.api.createBannerAd({
            adUnitId: id,
            style: {
                left: 0,
                top: this.systemInfo.screenHeight - 130,
                width: this.systemInfo.screenWidth + 50,
            }
        });
        let t = Date.now();
        if (t.toString().length == 13) {
            t = Math.floor(t * 0.001);
        }
        this.banners[id] = {
            banner: banner,
            state: 0,
            needShow: false,
            createTime: t,
        };
        banner.onError((err) => {
            this.onBannerErr(err);
            banner.offLoad();
            banner.offError();
            banner.offResize();
            banner.destroy(); //要先把旧的广告给销毁，不然会导致其监听的事件无法释放，影响性能
            delete this.banners[id];
        });
        banner.onResize(res => {
            if (this.systemInfo.platform == "ios" && !!this.systemInfo.statusBarHeight && this.systemInfo.statusBarHeight > 20) {
                banner.style.top = this.systemInfo.screenHeight - res.height - 20;
            } else {
                banner.style.top = this.systemInfo.screenHeight - res.height;
            }
        });
        banner.onLoad(() => {
            this.banners[id].state = 1;
            if (this.banners[id].needShow) {
                banner.show().then(() => {
                    this.onBannerShow();
                    this.banners[id].state = 2;
                    this.banners[id].needShow = false;
                });
            }
        });
    }

    /**
     * 关闭广告
     */
    public removeBanner() {
        let t = Date.now();
        if (t.toString().length == 13) {
            t = Math.floor(t * 0.001);
        }
        for (let key in this.banners) {
            if (this.banners[key].state == 2) {
                //创建时间超过30秒时重新创建
                if (t - this.banners[key].createTime > 30) {
                    let banner = this.banners[key].banner;
                    banner.offLoad();
                    banner.offError();
                    banner.offResize();
                    banner.destroy();
                    this.banners[key] = null;
                    this.preCreateBanner(key);
                } else {
                    this.banners[key].banner.hide();
                }
            } else {
                this.banners[key].needShow = false;
            }
        }
    }

    //插屏广告
    public showInterstitialAd(banner: boolean = false) {
        this.useBannerInsteadInsert = banner;
        this.showBannerInsteadInsert();
        let id = this.getInsertAdUnitId();
        if (!id) {
            // this.showBannerInsteadInsert();
            return;
        }
        const version = this.systemInfo.SDKVersion;
        if (this.compareVersion(version, '2.6.0') < 0) {
            console.log('基础库版本过低');
            // this.showBannerInsteadInsert();
            //   // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            //   this.api.showModal({
            //     title: '提示',
            //     content: '当前微信版本过低，无法使用插屏广告，请升级到最新微信版本后重试。'
            //   })
            return;
        }
        let ad = this.api.createInterstitialAd({ adUnitId: id });
        ad.show().then(this.onInsertShow.bind(this));
        ad.onClose(this.onInsertHide.bind(this));
        ad.onError((err) => {
            this.onInsertErr(err);
            // this.showBannerInsteadInsert();
        });
    }


    /**
     * 短震动
     */
    public vibrateShort() {
        if (GamePlatform.instance.Config.vibrate) {
            this.api.vibrateShort({});
        }
    }

    /**
     * 长震动
     */
    public vibrateLong() {
        if (GamePlatform.instance.Config.vibrate) {
            this.api.vibrateLong({});
        }
    }

    /**
     * 无激励分享&&带参分享
     */
    shareAppMessage(query: string = "") {
        let index: number = Math.floor((Math.random() * this.shareTitleArr.length));
        let indeximg: number = Math.floor((Math.random() * this.shareImgArr.length));
        this.api.shareAppMessage({
            title: `${this.shareTitleArr[index]}`,
            imageUrl: `${this.shareImgArr[indeximg]}`,
            query: `${query}`,
        });
    }

    /**
     * 激励分享&&带参分享
     */
    shareToAnyOne(success: Function, fail?: Function, query: string = '') {
        if (!GamePlatform.instance.Config.share) {
            success();
            return;
        }
        this.shareAppMessage(query);
        success();
    }

    /**
     * 消息提示
     */
    public showMessage(msg: string, icon: string = 'none') {
        // this.api.showToast({
        //     title: msg,
        //     duration: 2000,
        //     icon: icon,
        //     success: (res) => { }
        // });
        EventManager.emit(EventType.UIEvent.showTip, msg);
    }

    public navigateToMiniProgram(data: any, cb?, target?) {
        //请求跳转
        let url = http_request.url_ad + "v1.1/api/userpreclick.html";
        http_request.getInstance().postRequest(url, {
            softid: this.config.appId,
            uid: UserInfo.openid,
            advid: data.appid,
            locationid: data.locationid,
            id: data.id,
        });
        this.api.navigateToMiniProgram({
            appId: data.appid,
            path: data.url,
            success(res) {
                // 跳转成功，数据上报
                cb && cb.call(target, true);
                let url = http_request.url_ad + "v1.1/api/userclick.html";
                http_request.getInstance().postRequest(url, {
                    softid: this.config.appId,
                    uid: UserInfo.openid,
                    advid: data.appid,
                    locationid: data.locationid,
                    id: data.id,
                })
            },
            fail() {
                cb && cb.call(target, false);
            }
        });
    }
}
