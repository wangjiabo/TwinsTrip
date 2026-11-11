/**
 * Babies Routes — 宝宝档案 CRUD
 * GET    /api/babies          获取家庭成员的所有宝宝
 * POST   /api/babies          添加新宝宝
 * GET    /api/babies/:id      获取单个宝宝详情（含作息模板）
 * PUT    /api/babies/:id      更新宝宝信息
 * DELETE /api/babies/:id      删除宝宝
 * POST   /api/babies/:id/state 标记宝宝事件（喂奶/拉臭臭/nap）
 */
import { Router } from 'express';

const router = Router();

// Mock 数据
const babies = [
  { id: 'b1', name: '大宝', gender: 'M', birthday: '2026-03-15', height: 71, weight: 9.2, allergies: [] },
  { id: 'b2', name: '二宝', gender: 'F', birthday: '2026-03-15', height: 70, weight: 8.8, allergies: ['鸡蛋'] },
];

router.get('/', (_req, res) => {
  // TODO: 从 DB 查询
  res.json(babies);
});

router.get('/:id', (req, res) => {
  const baby = babies.find(b => b.id === req.params.id);
  if (!baby) return res.status(404).json({ error: 'Baby not found' });
  // TODO: 关联作息模板
  res.json({ ...baby, routines: [] });
});

router.post('/', (req, res) => {
  // TODO: 创建新宝宝档案
  res.status(201).json({ id: 'new-id', ...req.body });
});

router.put('/:id', (req, res) => {
  // TODO: 更新宝宝信息
  res.json({ id: req.params.id, ...req.body });
});

// POST /api/babies/:id/state — 标记宝宝实时状态（核心接口）
router.post('/:id/state', (req, res) => {
  const { event, timestamp } = req.body;
  const validEvents = ['feed', 'poop', 'nap_start', 'nap_end', 'wake'];

  if (!validEvents.includes(event)) {
    return res.status(400).json({ error: 'Invalid event type' });
  }

  // TODO: 写入 DB + 通过 WebSocket 推送给另一端（爸爸/妈妈）
  console.log(`[TwinsTrip] Baby ${req.params.id} event: ${event} at ${timestamp || new Date().toISOString()}`);

  res.json({
    ok: true,
    babyId: req.params.id,
    event,
    timestamp: timestamp || new Date().toISOString(),
  });
});

export default router;
