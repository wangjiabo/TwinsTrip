// pages/baby/baby.js — 宝宝档案
// 记录双宝宝基础数据、作息模板、成长历史

const app = getApp();

Page({
  data: {
    babies: [],
    selectedBabyIndex: 0,
    showRoutineEditor: false,
    routines: [],
    growthChart: [],
  },

  onShow() {
    this.loadBabies();
    this.loadRoutines();
  },

  loadBabies() {
    // mock 数据 — 8个月双胞胎
    const babies = [
      { id: 'b1', name: '大宝', gender: 'M', birthday: '2026-03-15', height: 71, weight: 9.2, allergies: [] },
      { id: 'b2', name: '二宝', gender: 'F', birthday: '2026-03-15', height: 70, weight: 8.8, allergies: ['鸡蛋'] },
    ];
    this.setData({ babies });
  },

  loadRoutines() {
    // 8个月宝宝典型作息
    const routines = [
      { event: '起床', icon: '🌅', time: '06:30', duration: 0 },
      { event: '喂奶', icon: '🍼', time: '06:30', duration: 30 },
      { event: '上午 nap', icon: '😴', time: '08:00', duration: 90 },
      { event: '户外玩耍', icon: '🪁', time: '09:30', duration: 60 },
      { event: '午饭', icon: '🍚', time: '12:00', duration: 30 },
      { event: '下午 nap', icon: '😴', time: '14:00', duration: 120 },
      { event: '下午茶/加餐', icon: '🍪', time: '16:30', duration: 20 },
      { event: '自由玩耍', icon: '🧸', time: '16:50', duration: 70 },
      { event: '晚饭', icon: '🍚', time: '18:00', duration: 30 },
      { event: '洗澡', icon: '🛁', time: '19:00', duration: 20 },
      { event: '睡前 nap', icon: '🌙', time: '19:30', duration: 570 }, // 到早上 05:00
    ];
    this.setData({ routines });
  },

  onSelectBaby(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedBabyIndex: index });
  },

  onEditRoutine() {
    this.setData({ showRoutineEditor: true });
  },

  onCloseRoutineEditor() {
    this.setData({ showRoutineEditor: false });
  },

  // 宝宝月龄计算
  calcMonths(birthday) {
    const birth = new Date(birthday);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return months;
  },
});
