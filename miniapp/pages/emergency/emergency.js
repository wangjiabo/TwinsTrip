// pages/emergency/emergency.js — 突发事件实时处置
// 目标：突发状况秒级决策辅助

const app = getApp();

// 各事件类型对应的资源类型
const EVENT_TO_POI = {
  poop: { label: '拉臭臭', poiTypes: ['母婴室', '卫生间', '公共厕所'], color: '#e94560', icon: '🔴' },
  hungry: { label: '饿了', poiTypes: ['母婴室', '咖啡厅', '餐厅'], color: '#f39c12', icon: '🟡' },
  sleepy: { label: '困了', poiTypes: ['咖啡厅', '酒店', '公园'], color: '#2ecc71', icon: '🟢' },
  other: { label: '紧急情况', poiTypes: ['医院', '药店', '急诊'], color: '#9b59b6', icon: '🟣' },
};

Page({
  data: {
    eventType: 'poop',
    eventInfo: EVENT_TO_POI.poop,
    resources: [],
    showForm: false,
    selectedResource: null,
  },

  onLoad(options) {
    const type = options.type || 'poop';
    this.setData({
      eventType: type,
      eventInfo: EVENT_TO_POI[type],
    });
    this.searchNearbyResources();
  },

  searchNearbyResources() {
    // TODO: 调用腾讯地图 POI 搜索 API
    // 先用 mock 数据
    const resources = [
      { id: 'r1', name: '7-11 便利店（母婴室）', address: 'XX路123号', distance: 0.3, travelTime: 5, travelMode: 'walk' },
      { id: 'r2', name: '星巴克（有插座可喂奶）', address: 'XX路456号', distance: 0.8, travelTime: 12, travelMode: 'walk' },
      { id: 'r3', name: '商场 B1 层母婴室', address: 'XX路789号', distance: 1.2, travelTime: 6, travelMode: 'car' },
    ];

    this.setData({ resources });
  },

  // 切换事件类型
  onSwitchEvent(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({
      eventType: type,
      eventInfo: EVENT_TO_POI[type],
    });
    this.searchNearbyResources();
  },

  // 导航到资源点
  onNavigate(e) {
    const { resource } = e.currentTarget.dataset;
    wx.showModal({
      title: '导航到 ' + resource.name,
      content: '距离 ' + resource.distance + ' km，预计 ' + resource.travelTime + ' 分钟',
      confirmText: '开始导航',
      success: (res) => {
        if (res.confirm) {
          wx.openLocation({
            latitude: 39.9042, // TODO: 替换为实际坐标
            longitude: 116.4074,
            name: resource.name,
            address: resource.address,
          });
        }
      }
    });
  },

  // 一键降级预案（延误超过阈值时）
  onShowDowngradePlan() {
    wx.showModal({
      title: '📋 一键降级预案',
      content: '原计划因延误可调整为：\n\n1. 缩短奥森公园停留时间（-45分钟）\n2. 午饭改为附近便利店（-30分钟）\n\n是否应用？',
      confirmText: '应用预案',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '重排中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '✅ 行程已更新', icon: 'success' });
          }, 1500);
        }
      }
    });
  },

  // 情况报告模板
  onSubmitReport() {
    this.setData({ showForm: true });
  },

  onReportSubmit() {
    // TODO: 提交情况报告
    this.setData({ showForm: false });
    wx.showToast({ title: '已记录', icon: 'success' });
  },
});
