/**
 * Family Routes — 家庭管理
 */
import { Router } from 'express';

const router = Router();

router.get('/:id', (_req, res) => {
  // TODO: 查询家庭详情（含用户列表 + 宝宝列表）
  res.json({ id: req.params.id, name: '王家', members: [], babies: [] });
});

router.post('/invite', (_req, res) => {
  // TODO: 生成邀请链接/二维码给家人加入
  res.json({ inviteCode: 'INVITE-' + Date.now() });
});

export default router;
