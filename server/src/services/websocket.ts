/**
 * WebSocket Service — 实时同步爸爸/妈妈双终端
 *
 * 场景:
 * - 妈妈标记"老大拉了" → 爸爸手机立刻收到通知 + 地图弹出母婴室导航
 * - 爸爸调整行程 → 妈妈手机上的行程自动更新
 * - 喂奶/nap 状态实时共享
 */

import { WebSocketServer, WebSocket } from 'ws';

interface ConnectedClient {
  ws: WebSocket;
  familyId: string;
  userId: string;
}

const connectedClients: Map<string, ConnectedClient[]> = new Map();

export function setupWebSocket(wss: WebSocketServer) {
  console.log('[TwinTrip WSS] WebSocket server starting...');

  wss.on('connection', (ws, req) => {
    const client = { ws, familyId: '', userId: '' };

    console.log('[TwinTrip WSS] Client connected');

    // 1. 客户端先发送认证消息
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'auth') {
          client.familyId = msg.familyId;
          client.userId = msg.userId;

          // 注册到家庭频道
          if (!connectedClients.has(client.familyId)) {
            connectedClients.set(client.familyId, []);
          }
          connectedClients.get(client.familyId)!.push(client);

          ws.send(JSON.stringify({ type: 'auth_ok', userId: client.userId }));
          console.log(`[TwinTrip WSS] User ${client.userId} joined family ${client.familyId}`);
        }

        if (msg.type === 'baby_event') {
          broadcastToFamily(client.familyId, {
            type: 'baby_event',
            payload: msg.payload,
            from: client.userId,
          });
        }

        if (msg.type === 'trip_update') {
          broadcastToFamily(client.familyId, {
            type: 'trip_update',
            payload: msg.payload,
            from: client.userId,
          });
        }
      } catch (err) {
        console.error('[TwinTrip WSS] Message parse error:', err);
      }
    });

    ws.on('close', () => {
      const familyClients = connectedClients.get(client.familyId);
      if (familyClients) {
        const idx = familyClients.indexOf(client);
        if (idx > -1) familyClients.splice(idx, 1);
      }
      console.log(`[TwinTrip WSS] User ${client.userId} disconnected`);
    });
  });

  // 每 30 秒 ping 保持连接
  setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 30000);

  console.log('[TwinTrip WSS] WebSocket server ready on /ws');
}

function broadcastToFamily(familyId: string, message: any) {
  const clients = connectedClients.get(familyId);
  if (!clients) return;

  const json = JSON.stringify(message);
  clients.forEach(c => {
    if (c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(json);
    }
  });
}

// 导出给路由层调用
export function notifyEmergency(familyId: string, emergency: any) {
  broadcastToFamily(familyId, { type: 'emergency', payload: emergency });
}
