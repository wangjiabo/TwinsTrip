/**
 * Emergency Routes — 突发事件处置
 * POST   /api/emergency/nearest         查找最近应急资源（母婴室/喂奶点/药店）
 * POST   /api/emergency/downgrade        生成行程降级预案
 * POST   /api/emergency/report           提交情况报告
 */
import { Router } from 'express';

const router = Router();

// POST /api/emergency/nearest — 🔑 核心：找最近的紧急资源
router.post('/nearest', async (req, res) => {
  const { eventType, latitude, longitude } = req.body;

  if (!eventType || !latitude || !longitude) {
    return res.status(400).json({ error: 'eventType, latitude, longitude required' });
  }

  // TODO: 调用腾讯地图 POI 搜索
  // 根据事件类型映射 POI 类别:
  // - poop → 母婴室 / 卫生间
  // - hungry → 母婴室 / 咖啡厅
  // - sleepy → 咖啡厅 / 公园
  // - other → 医院 / 药店

  const poiMapping: Record<string, string[]> = {
    poop: ['母婴室', '卫生间'],
    hungry: ['咖啡厅', '餐厅'],
    sleepy: ['咖啡厅', '酒店'],
    other: ['医院', '药店', '急诊'],
  };

  const result = {
    eventType,
    poiTypes: poiMapping[eventType] || [],
    location: { latitude, longitude },
    // TODO: 实际调用腾讯地图 API
    resources: [
      { id: 'r1', name: '最近的母婴室', distance_m: 300, travel_time_min: 5, travel_mode: 'walk' },
      { id: 'r2', name: '7-11 便利店', distance_m: 600, travel_time_min: 8, travel_mode: 'walk' },
    ],
  };

  res.json(result);
});

// POST /api/emergency/downgrade — 行程降级预案
router.post('/downgrade', (req, res) => {
  const { tripId, delayMinutes } = req.body;

  res.json({
    tripId,
    delayMinutes,
    suggestions: [
      { type: 'shorten', nodeTitle: '奥森公园', original_min: 120, suggested_min: 75 },
      { type: 'skip', nodeTitle: '计划中的外食', reason: '延误超过 nap 时间窗' },
    ],
  });
});

export default router;
