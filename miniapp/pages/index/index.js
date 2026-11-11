// pages/index/index.js — 首页（态势感知总览）
// 目标：一眼看清当前出游状态 — 指挥中心的态势大屏

const app = getApp();

Page({
  data: {
    babies: [],
    currentTrip: null,
    reminders: [],
    nearestResources: [],
    loading: true,
  },

  onShow() {
    this.refreshData();
    this.startReminderTimer();
  },

  onHide() {
    if (this.reminderTimer) clearInterval(this.reminderTimer);
  },

  refreshData() {
    const babies = app.globalData.babies;
    const reminders = app.calculateUrgencyReminders();

    // 计算宝宝上次事件距今多久
    const enrichedBabies = babies.map(baby => ({
      ...baby,
      minsSinceFeed: this.minutesSince(baby.lastFeedAt),
      minsSinceNap: this.minutesSince(baby.lastNapEnd),
      feedUrgency: this.calcUrgency(baby.lastFeedAt, 210), // 3.5h 喂奶间隔
    }));

    this.setData({
      babies: enrichedBabies,
      reminders,
      currentTrip: app.globalData.currentTrip,
      loading: false,
    });
  },

  minutesSince(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    return Math.floor((new Date() - date) / 1000 / 60);
  },

  calcUrgency(lastEvent, intervalMinutes) {
    if (!lastEvent) return 'unknown';
    const mins = this.minutesSince(lastEvent);
    const ratio = mins / intervalMinutes;
    if (ratio > 0.9) return 'urgent';
    if (ratio > 0.7) return 'warn';
    return 'normal';
  },

  startReminderTimer() {
    // 每 30 秒刷新一次紧急提醒
    this.reminderTimer = setInterval(() => {
      this.setData({ reminders: app.calculateUrgencyReminders() });
    }, 30000);
  },

  // === 快速操作 ===

  // 标记喂奶中（点宝宝卡片上的按钮）
  onMarkFeed(e) {
    const { babyid } = e.currentTarget.dataset;
    app.markBabyEvent(babyid, 'feed');
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '已标记喂奶中', icon: 'success' });
    this.refreshData();
  },

  // 标记拉臭臭
  onMarkPoop(e) {
    const { babyid } = e.currentTarget.dataset;
    app.markBabyEvent(babyid, 'poop');
    wx.showToast({ title: '已记录', icon: 'success' });
    this.refreshData();
  },

  // 标记 nap 开始
  onMarkNapStart(e) {
    const { babyid } = e.currentTarget.dataset;
    app.markBabyEvent(babyid, 'nap_start');
    wx.showToast({ title: '开始 nap', icon: 'success' });
    this.refreshData();
  },

  // 一键紧急按钮 → 跳转应急处置页
  onEmergencyTap(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/emergency/emergency?type=${type}`
    });
  },

  // 查看当前行程
  onViewTrip() {
    wx.switchTab({ url: '/pages/itinerary/itinerary' });
  },
});
