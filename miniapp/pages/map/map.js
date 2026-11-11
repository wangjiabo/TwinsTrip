// pages/map/map.js — 态势感知地图
// 一张地图看清一切：位置 + 路线 + 所有紧急资源

const app = getApp();

Page({
  data: {
    latitude: 39.9042,
    longitude: 116.4074,
    scale: 14,
    markers: [],
    resourceFilters: {
      maternal: true, // 母婴室
      feed: true,     // 喂奶点
      pharmacy: true, // 药店
      hospital: true, // 医院
      gas: false,     // 加油站
    },
    nearestResource: null,
    showRoute: false,
    routePolyline: [],
  },

  onShow() {
    this.initMap();
    this.loadMarkers();
    this.checkCurrentLocation();
  },

  initMap() {
    // TODO: 初始化腾讯地图
    // wx.createMapContext('twinmap', this);
  },

  loadMarkers() {
    // TODO: 调用后端获取附近资源点
    // mock markers
    const markers = [
      { id: 1, latitude: 39.905, longitude: 116.408, iconPath: '', callout: { content: '🚼 母婴室 (0.3km)' } },
      { id: 2, latitude: 39.903, longitude: 116.406, iconPath: '', callout: { content: '🍼 喂奶点 (0.8km)' } },
      { id: 3, latitude: 39.906, longitude: 116.409, iconPath: '', callout: { content: '🏥 社区医院 (1.5km)' } },
      { id: 4, latitude: 39.902, longitude: 116.405, iconPath: '', callout: { content: '💊 药店 (0.6km)' } },
    ];

    this.setData({ markers });
  },

  checkCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        });
        this.calcNearestResource(res.latitude, res.longitude);
      },
      fail: (err) => {
        console.warn('[TwinsTrip] getLocation failed:', err);
      }
    });
  },

  calcNearestResource(lat, lng) {
    // TODO: 计算距离下次喂奶时间 + 距离最近喂奶点的综合提醒
    this.setData({
      nearestResource: {
        type: 'feed',
        name: '最近喂奶点',
        distance: '2.3 km',
        eta: '7 分钟',
        urgency: 'normal',
        minsToNextFeed: 45,
      }
    });
  },

  // 切换资源点显示
  onFilterToggle(e) {
    const { key } = e.currentTarget.dataset;
    const filters = { ...this.data.resourceFilters };
    filters[key] = !filters[key];
    this.setData({ resourceFilters: filters });
    this.loadMarkers(); // 重新加载（实际应该过滤现有 markers）
  },

  // 显示行程路线
  onToggleRoute() {
    this.setData({ showRoute: !this.data.showRoute });
  },

  // 导航到最近资源
  onNavigateNearest() {
    wx.showToast({ title: '即将导航...', icon: 'loading' });
    setTimeout(() => {
      wx.showToast({ title: '打开导航', icon: 'none' });
    }, 500);
  },

  // 移动到当前位置
  onMoveToMe() {
    this.checkCurrentLocation();
  },
});
