/**
 * Map Routes — 地图服务
 * GET    /api/map/resources/nearby       附近资源点（按类型过滤）
 * POST   /api/map/route                  路线规划
 * GET    /api/map/weather                天气预报
 */
import { Router } from 'express';

const router = Router();

// TODO: 接入腾讯地图 API 和 Open-Meteo
router.get('/weather', (_req, res) => {
  res.json({
    location: 'mock',
    forecast: [
      { date: new Date().toISOString().split('T')[0], temp_max: 26, temp_min: 18, condition: '晴' },
    ],
  });
});

export default router;
