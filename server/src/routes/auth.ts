/**
 * Auth Routes — 微信登录 + JWT 认证
 */
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// POST /api/auth/login — 微信 code 登录
const loginSchema = z.object({
  code: z.string().min(1).describe('微信 wx.login 返回的 code'),
});

router.post('/login', async (req, res) => {
  const { code } = loginSchema.parse(req.body);

  // TODO: 调用微信接口 code2session 换取 openid + session_key
  // 1. GET https://api.weixin.qq.com/sns/jscode2session
  // 2. 查找或创建用户
  // 3. 生成 JWT

  console.log('[TwinTrip Auth] login with code:', code);

  res.json({
    token: 'dev-token-' + Date.now(),
    user: {
      id: 'dev-user-id',
      familyId: 'dev-family-id',
      nickname: '开发者',
      role: 'father',
    },
  });
});

export default router;
