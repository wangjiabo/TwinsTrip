// app.js - TwinTrip 微信小程序入口
// TwinTrip: 双胞胎带娃出游作战指挥系统

App({
  globalData: {
    // 当前用户信息
    userInfo: null,
    familyId: null,

    // 双娃状态（实时）
    babies: [
      // { id: 'b1', name: '大宝', lastFeedAt: null, lastPoopAt: null, lastNapStart: null, lastNapEnd: null, currentState: 'awake' }
      // { id: 'b2', name: '二宝', ... }
    ],

    // 当前行程
    currentTrip: null,

    // API 基础地址（开发/生产）
    apiBase: 'https://api.twintrip.app', // TODO: 替换为实际地址

    // 腾讯地图 Key
    mapKey: 'YOUR_TENCENT_MAP_KEY', // TODO: 替换为腾讯地图 Key

    // 实时连接
    ws: null,
  },

  onLaunch() {
    // 1. 检查本地缓存的登录状态
    const cachedUser = wx.getStorageSync('userInfo');
    if (cachedUser) {
      this.globalData.userInfo = cachedUser;
      this.globalData.familyId = wx.getStorageSync('familyId');
    }

    // 2. 微信登录
    this.doWeChatLogin();

    // 3. 恢复本地缓存的宝宝状态和当前行程
    this.restoreLocalCache();
  },

  doWeChatLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // TODO: 发送 code 到后端换取 openid + JWT
          console.log('[TwinTrip] wx.login code:', res.code);
        }
      },
      fail: (err) => {
        console.error('[TwinTrip] wx.login failed:', err);
      }
    });
  },

  restoreLocalCache() {
    const cachedBabies = wx.getStorageSync('babies');
    const cachedTrip = wx.getStorageSync('currentTrip');
    if (cachedBabies) this.globalData.babies = cachedBabies;
    if (cachedTrip) this.globalData.currentTrip = cachedTrip;
  },

  // 标记宝宝事件（喂奶/拉臭臭/nap）— 核心指挥操作
  markBabyEvent(babyId, eventType, eventData = {}) {
    const babies = this.globalData.babies;
    const baby = babies.find(b => b.id === babyId);
    if (!baby) return;

    const now = new Date();
    switch (eventType) {
      case 'feed':
        baby.lastFeedAt = now.toISOString();
        baby.currentState = 'eating';
        break;
      case 'poop':
        baby.lastPoopAt = now.toISOString();
        break;
      case 'nap_start':
        baby.lastNapStart = now.toISOString();
        baby.currentState = 'sleeping';
        break;
      case 'nap_end':
        baby.lastNapEnd = now.toISOString();
        baby.currentState = 'awake';
        break;
      case 'wake':
        baby.currentState = 'awake';
        break;
    }

    // 更新缓存
    this.globalData.babies = babies;
    wx.setStorageSync('babies', babies);

    // 同步到后端
    this.syncBabyStateToServer(babies);
  },

  syncBabyStateToServer(babies) {
    // TODO: POST /api/babies/state
    console.log('[TwinTrip] syncing babies state:', babies);
  },

  // 计算紧急时间提醒
  calculateUrgencyReminders() {
    const reminders = [];
    const now = new Date();

    this.globalData.babies.forEach(baby => {
      if (baby.lastFeedAt) {
        const lastFeed = new Date(baby.lastFeedAt);
        const timeSinceFeed = (now - lastFeed) / 1000 / 60; // minutes
        // 8个月宝宝一般 3-4 小时喂一次
        const feedInterval = 210; // 3.5 小时
        const minsToNextFeed = feedInterval - timeSinceFeed;
        if (minsToNextFeed < 30 && minsToNextFeed > 0) {
          reminders.push({
            type: 'feed',
            baby: baby.name,
            text: `${baby.name} 还有 ${Math.round(minsToNextFeed)} 分钟要喂奶`,
            level: minsToNextFeed < 10 ? 'urgent' : 'warn'
          });
        }
      }
    });

    return reminders;
  },
});
