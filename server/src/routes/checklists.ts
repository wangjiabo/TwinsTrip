/**
 * Checklist Routes — 智能物品清单
 * GET    /api/checklists/templates       获取所有场景模板
 * GET    /api/checklists/templates/:id   获取单个模板（含物品项）
 * POST   /api/checklists/generate        基于模板+参数生成实际清单
 * GET    /api/checklists/:id             获取实际清单（含打包状态）
 * PUT    /api/checklists/:id/items/:itemId  更新项的打包状态
 */
import { Router } from 'express';
import { generateChecklist, calculateRedundancy } from '../services/checklistEngine';

const router = Router();

// POST /api/checklists/generate — 🔑 核心：生成双胞胎智能清单
router.post('/generate', (req, res) => {
  const { templateId, babyCount, tripHours, scene } = req.body;

  if (!templateId && !scene) {
    return res.status(400).json({ error: 'templateId or scene required' });
  }

  const checklist = generateChecklist({
    templateId,
    babyCount: babyCount || 2,
    tripHours: tripHours || 4,
    scene,
  });

  res.json(checklist);
});

router.get('/templates', (_req, res) => {
  // TODO: 从 DB 获取模板
  res.json([
    { id: 't-park', name: '周末公园游', scene: 'park', is_system: true },
    { id: 't-beach', name: '海边游', scene: 'beach', is_system: true },
    { id: 't-roadtrip', name: '自驾长途', scene: 'road_trip', is_system: true },
    { id: 't-flight', name: '坐飞机', scene: 'flight', is_system: true },
  ]);
});

export default router;

// 导出给其他模块用
export { calculateRedundancy };
