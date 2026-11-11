// pages/checklist/checklist.js — 智能物品清单
// 双胞胎作战物资管理

const app = getApp();

// Mock 数据 — 公园游模板
const PARK_TEMPLATE = [
  // 喂奶类
  { id: 'c1', name: '纸尿裤', category: 'diaper', single_qty: 4, unit: '片', mandatory: true, min_hours: 2, notes: '每人每2小时1片，双胞胎×2' },
  { id: 'c2', name: '奶瓶', category: 'feeding', single_qty: 2, unit: '个', mandatory: true, min_hours: 0, notes: '每人至少2个，一个装奶一个装水' },
  { id: 'c3', name: '奶粉', category: 'feeding', single_qty: 2, unit: '瓶', mandatory: true, min_hours: 4, notes: '每人按4小时算' },
  { id: 'c4', name: '水杯', category: 'feeding', single_qty: 2, unit: '个', mandatory: true, min_hours: 0 },
  { id: 'c5', name: '口水巾/纱布', category: 'feeding', single_qty: 6, unit: '条', mandatory: true, min_hours: 2, notes: '每人3条' },

  // 换尿布类
  { id: 'c6', name: '湿巾', category: 'diaper', single_qty: 2, unit: '包', mandatory: true, min_hours: 0 },
  { id: 'c7', name: '护臀膏', category: 'diaper', single_qty: 1, unit: '管', mandatory: true, min_hours: 0 },
  { id: 'c8', name: '一次性隔尿垫', category: 'diaper', single_qty: 3, unit: '张', mandatory: false, min_hours: 4 },

  // 衣物类
  { id: 'c9', name: '换洗衣物', category: 'clothes', single_qty: 2, unit: '套', mandatory: true, min_hours: 0, notes: '每人2套（含袜子）' },
  { id: 'c10', name: '遮阳帽', category: 'clothes', single_qty: 1, unit: '顶', mandatory: true, min_hours: 2 },
  { id: 'c11', name: '防蚊服', category: 'clothes', single_qty: 1, unit: '件', mandatory: false, min_hours: 4 },

  // 装备类
  { id: 'c12', name: '推车', category: 'gear', single_qty: 2, unit: '辆', mandatory: true, min_hours: 0, notes: '双胞胎各一辆或双人推车' },
  { id: 'c13', name: '野餐垫', category: 'gear', single_qty: 1, unit: '张', mandatory: false, min_hours: 4 },
  { id: 'c14', name: '玩具', category: 'gear', single_qty: 2, unit: '个', mandatory: false, min_hours: 4, notes: '每人1个小玩具' },

  // 应急药品
  { id: 'c15', name: '退热贴', category: 'medicine', single_qty: 2, unit: '贴', mandatory: true, min_hours: 0 },
  { id: 'c16', name: '碘伏棉片', category: 'medicine', single_qty: 4, unit: '片', mandatory: true, min_hours: 0 },
  { id: 'c17', name: '儿童润肤霜', category: 'medicine', single_qty: 1, unit: '管', mandatory: false, min_hours: 2 },
];

Page({
  data: {
    selectedScene: 'park',
    babyCount: 2,
    tripHours: 4,
    items: [],
    groupedItems: [],
    totalMandatory: 0,
    totalPacked: 0,
    percentage: 0,
    forgettingWarn: [], // 忘记就完蛋的物品
  },

  onLoad() {
    this.generateChecklist();
  },

  generateChecklist() {
    const { babyCount, tripHours } = this.data;
    const REDUNDANCY_FACTOR = tripHours <= 2 ? 1.1 : tripHours <= 4 ? 1.3 : tripHours <= 8 ? 1.5 : 1.8;

    // 计算每项实际带量
    const items = PARK_TEMPLATE.filter(i => i.min_hours <= tripHours).map(item => {
      let qty = Math.ceil(item.single_qty * babyCount * REDUNDANCY_FACTOR);
      // 特殊规则：纸尿裤 +2 防突发
      if (item.id === 'c1') qty += 2;

      return {
        ...item,
        suggested_qty: qty,
        actual_qty: qty, // 默认等于建议
        packed: false,
      };
    });

    // 按类别分组
    const categoryOrder = ['feeding', 'diaper', 'clothes', 'gear', 'medicine'];
    const categoryNames = {
      feeding: '🍼 喂奶用品',
      diaper: '🧷 换尿布',
      clothes: '👕 衣物',
      gear: '🎒 装备',
      medicine: '💊 应急药品',
    };

    const groupedItems = categoryOrder.map(cat => ({
      category: cat,
      name: categoryNames[cat],
      items: items.filter(i => i.category === cat),
    })).filter(g => g.items.length > 0);

    // 统计
    const mandatory = items.filter(i => i.mandatory);
    const forgettingWarn = mandatory; // 所有必带都是"忘了就完蛋"

    this.setData({
      items,
      groupedItems,
      totalMandatory: mandatory.length,
      forgettingWarn: forgettingWarn.slice(0, 5), // 前5个展示
    });
  },

  // 切换打包状态
  onTogglePack(e) {
    const itemId = e.currentTarget.dataset.id;
    const items = this.data.items.map(item => {
      if (item.id === itemId) return { ...item, packed: !item.packed };
      return item;
    });

    const packed = items.filter(i => i.packed && i.mandatory).length;
    const percentage = Math.round((packed / this.data.totalMandatory) * 100);

    this.setData({
      items,
      groupedItems: this.data.groupedItems.map(g => ({
        ...g,
        items: g.items.map(i => i.id === itemId ? { ...i, packed: !i.packed } : i)
      })),
      totalPacked: packed,
      percentage,
    });
  },

  // 设置出行时长
  onHoursChange(e) {
    const hours = parseFloat(e.detail.value);
    this.setData({ tripHours: hours }, () => this.generateChecklist());
  },

  // 全部标记打包
  onPackAll() {
    const items = this.data.items.map(i => ({ ...i, packed: true }));
    const packed = items.filter(i => i.mandatory).length;
    const percentage = 100;

    this.setData({
      items,
      groupedItems: this.data.groupedItems.map(g => ({
        ...g,
        items: g.items.map(i => ({ ...i, packed: true }))
      })),
      totalPacked: packed,
      percentage,
    });
    wx.showToast({ title: '✅ 全部打包完成', icon: 'success' });
  },
});
