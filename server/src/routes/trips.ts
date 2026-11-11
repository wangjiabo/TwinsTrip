/**
 * Trips Routes — 行程规划核心
 * GET    /api/trips                     获取所有行程
 * POST   /api/trips                     创建行程
 * GET    /api/trips/:id                 获取行程详情（含节点）
 * PUT    /api/trips/:id                 更新行程
 * DELETE /api/trips/:id                 删除行程
 * POST   /api/trips/:id/reschedule      延误自动重排（核心算法）
 * POST   /api/trips/:id/nodes           添加行程节点
 * PUT    /api/trips/:id/nodes/:nodeId   更新节点（状态/时间）
 */
import { Router } from 'express';
import { rescheduleTrip } from '../services/tripEngine';

const router = Router();

router.get('/', (_req, res) => {
  // TODO: 从 DB 查询
  res.json([]);
});

router.post('/', (req, res) => {
  // TODO: 创建行程
  res.status(201).json({ id: 'new-trip-id', ...req.body });
});

router.get('/:id', (req, res) => {
  // TODO: 查询行程 + 关联节点
  res.json({ id: req.params.id, nodes: [] });
});

// POST /api/trips/:id/reschedule — 🔑 核心：延误自动重排
router.post('/:id/reschedule', (req, res) => {
  const { delayMinutes, fromNodeId, babyStates } = req.body;

  if (!delayMinutes || !fromNodeId) {
    return res.status(400).json({ error: 'delayMinutes and fromNodeId required' });
  }

  // 调用重排引擎
  const result = rescheduleTrip({
    tripId: req.params.id,
    delayMinutes,
    fromNodeId,
    babyStates,
  });

  res.json(result);
});

export default router;
