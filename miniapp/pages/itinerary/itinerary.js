// pages/itinerary/itinerary.js — 行程规划
// 动态时间窗行程编辑器，适配双娃作息

const app = getApp();

Page({
  data: {
    trip: null,
    nodes: [],
    babies: [],
    selectedDate: '',
    conflictNodes: [],
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const trip = app.globalData.currentTrip;
    const babies = app.globalData.babies;

    // TODO: 从后端加载行程节点
    // 先用 mock 数据
    const nodes = this.getMockNodes();
    const conflictNodes = this.detectConflicts(nodes, babies);

    this.setData({
      trip,
      nodes,
      babies,
      selectedDate: new Date().toISOString().split('T')[0],
      conflictNodes,
    });
  },

  getMockNodes() {
    return [
      {
        id: 'n1',
        order_index: 1,
        title: '出门',
        node_type: 'travel',
        start_window_start: '09:00',
        start_window_end: '09:15',
        duration_min: 15,
        conflict_flag: false,
        status: 'pending',
      },
      {
        id: 'n2',
        order_index: 2,
        title: '自驾到奥森公园',
        node_type: 'travel',
        start_window_start: '09:15',
        start_window_end: '09:30',
        duration_min: 30,
        distance_km: 12,
        travel_time_min: 30,
        conflict_flag: false,
        status: 'pending',
      },
      {
        id: 'n3',
        order_index: 3,
        title: '奥森公园散步',
        node_type: 'activity',
        start_window_start: '10:00',
        start_window_end: '12:00',
        duration_min: 120,
        conflict_flag: true, // 老大 11:00 nap 冲突
        conflict_details: { baby: '大宝', type: 'nap', time: '11:00-12:30' },
        status: 'pending',
      },
      {
        id: 'n4',
        order_index: 4,
        title: '午饭',
        node_type: 'meal',
        start_window_start: '12:30',
        start_window_end: '13:00',
        duration_min: 45,
        conflict_flag: false,
        status: 'pending',
      },
      {
        id: 'n5',
        order_index: 5,
        title: '回家',
        node_type: 'travel',
        start_window_start: '14:00',
        start_window_end: '14:30',
        duration_min: 30,
        travel_time_min: 30,
        conflict_flag: false,
        status: 'pending',
      },
    ];
  },

  detectConflicts(nodes, babies) {
    // TODO: 实现真正的双娃时间冲突检测算法
    return nodes.filter(n => n.conflict_flag);
  },

  // === 行程操作 ===

  // 标记节点状态变更（开始/完成/跳过）
  onNodeStatusChange(e) {
    const { nodeid, status } = e.currentTarget.dataset;
    // TODO: 更新节点状态 + 自动重排后续节点
    wx.showToast({ title: `标记为${status}`, icon: 'success' });
  },

  // 添加新节点
  onAddNode() {
    wx.showActionSheet({
      itemList: ['🚗 路途', '🎯 活动', '🍼 喂奶', '😴 nap', '🍚 吃饭', '🛌 休息'],
      success: (res) => {
        const types = ['travel', 'activity', 'feed', 'nap', 'meal', 'rest'];
        this.addNode(types[res.tapIndex]);
      }
    });
  },

  addNode(nodeType) {
    // TODO: 弹出表单添加节点
    wx.showToast({ title: 'TODO: 添加节点', icon: 'none' });
  },

  // 延误自动重排
  onAutoReschedule() {
    wx.showModal({
      title: '自动重排',
      content: '是否让系统根据当前宝宝状态和延误情况重新计算行程？',
      confirmText: '重新计算',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用后端重排算法
          wx.showLoading({ title: '计算中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '行程已自动更新', icon: 'success' });
            this.loadData();
          }, 1500);
        }
      }
    });
  },
});
