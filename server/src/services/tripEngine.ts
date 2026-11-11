/**
 * Trip Engine — 行程重排核心算法
 *
 * 指挥控制视角的延误管理：
 * 输入: 原行程 + 延误时长 + 宝宝当前状态
 * 输出: 新行程（所有后续节点自动调整时间）
 */

interface RescheduleInput {
  tripId: string;
  delayMinutes: number;
  fromNodeId: string;
  babyStates?: Array<{
    babyId: string;
    currentState: 'awake' | 'sleeping' | 'eating';
    lastNapEnd?: string;
    lastFeedAt?: string;
  }>;
}

interface RescheduleResult {
  ok: boolean;
  tripId: string;
  originalNodes: number;
  rescheduledNodes: number;
  changes: Array<{
    nodeId: string;
    originalTime: string;
    newTime: string;
    changeMinutes: number;
  }>;
  warnings: string[];
  conflicts: string[];
}

/**
 * 延误自动重排算法
 *
 * 策略（按优先级）:
 * 1. 缩短后续节点的停留时间（保持距离比例）
 * 2. 压缩节点间的缓冲时间
 * 3. 移除非核心节点
 * 4. 生成降级建议
 */
export function rescheduleTrip(input: RescheduleInput): RescheduleResult {
  const { tripId, delayMinutes } = input;
  const changes: RescheduleResult['changes'] = [];
  const warnings: string[] = [];
  const conflicts: string[] = [];

  console.log(`[TwinTrip TripEngine] Rescheduling trip ${tripId} with ${delayMinutes}min delay from node ${input.fromNodeId}`);

  // === Step 1: 基础重排 — 所有后续节点 start_time += delayMinutes ===
  // TODO: 实际从 DB 加载节点数据

  // === Step 2: 检测宝宝作息冲突 ===
  // 宝宝 8 个月作息窗口:
  // - nap 11:00-12:30 (±30min 缓冲)
  // - 喂奶每 3.5 小时
  // - 夜间 20:00-06:30 强制不安排

  if (delayMinutes > 60) {
    conflicts.push('延误超过 60 分钟，可能与宝宝 nap 时间冲突');
  }

  // === Step 3: 冲突处理 ===
  // 策略 A: 缩短当前活动
  // 策略 B: 跳过非核心节点
  // 策略 C: 推荐附近替代

  // === Step 4: 生成结果 ===
  warnings.push(`行程已自动顺延 ${delayMinutes} 分钟`);

  return {
    ok: true,
    tripId,
    originalNodes: 0,
    rescheduledNodes: 0,
    changes,
    warnings,
    conflicts,
  };
}

/**
 * 检测两个宝宝的时间重叠窗口
 */
export function findOverlappingWindows(
  babyARoutines: Array<{ event: string; start: number; duration: number }>,
  babyBRoutines: Array<{ event: string; start: number; duration: number }>,
  eventType: 'awake' | 'feed' | 'nap'
): Array<{ start: number; end: number }> {
  // 计算每个宝宝的事件时间线，返回两者的交集
  // 数字表示一天中的分钟数 (0-1440)
  return [];
}
