/**
 * Checklist Engine — 智能物品清单计算引擎
 *
 * 核心：双胞胎数量自动计算 + 冗余系数 + 场景模板
 */

interface GenerateChecklistInput {
  templateId?: string;
  scene?: 'park' | 'beach' | 'road_trip' | 'flight' | 'visit' | 'urban';
  babyCount: number;
  tripHours: number;
}

interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  single_qty: number;
  unit: string;
  suggested_qty: number;
  actual_qty: number;
  mandatory: boolean;
  notes?: string;
}

interface GenerateChecklistResult {
  ok: boolean;
  templateName: string;
  babyCount: number;
  tripHours: number;
  redundancyFactor: number;
  totalItems: number;
  mandatoryItems: number;
  totalSuggestedUnits: number;
  items: ChecklistItem[];
}

/**
 * 冗余系数计算
 * 出行时长越长，冗余系数越高
 */
export function calculateRedundancy(tripHours: number): number {
  if (tripHours <= 2) return 1.1;
  if (tripHours <= 4) return 1.3;
  if (tripHours <= 8) return 1.5;
  return 1.8;
}

/**
 * 生成场景模板（默认公园游）
 */
function getDefaultTemplate(): Array<Omit<ChecklistItem, 'suggested_qty' | 'actual_qty'>> {
  return [
    { id: 'c1', name: '纸尿裤', category: 'diaper', single_qty: 4, unit: '片', mandatory: true },
    { id: 'c2', name: '奶瓶', category: 'feeding', single_qty: 2, unit: '个', mandatory: true },
    { id: 'c3', name: '奶粉', category: 'feeding', single_qty: 2, unit: '瓶', mandatory: true },
    { id: 'c4', name: '水杯', category: 'feeding', single_qty: 2, unit: '个', mandatory: true },
    { id: 'c5', name: '口水巾/纱布', category: 'feeding', single_qty: 6, unit: '条', mandatory: true },
    { id: 'c6', name: '湿巾', category: 'diaper', single_qty: 2, unit: '包', mandatory: true },
    { id: 'c7', name: '护臀膏', category: 'diaper', single_qty: 1, unit: '管', mandatory: true },
    { id: 'c8', name: '换洗衣物', category: 'clothes', single_qty: 2, unit: '套', mandatory: true },
    { id: 'c9', name: '遮阳帽', category: 'clothes', single_qty: 1, unit: '顶', mandatory: true },
    { id: 'c10', name: '推车', category: 'gear', single_qty: 1, unit: '辆', mandatory: true },
    { id: 'c11', name: '退热贴', category: 'medicine', single_qty: 2, unit: '贴', mandatory: true },
    { id: 'c12', name: '碘伏棉片', category: 'medicine', single_qty: 4, unit: '片', mandatory: true },
  ];
}

/**
 * 🔑 核心：根据参数生成实际带量清单
 */
export function generateChecklist(input: GenerateChecklistInput): GenerateChecklistResult {
  const { babyCount, tripHours } = input;
  const redundancyFactor = calculateRedundancy(tripHours);
  const template = getDefaultTemplate();

  const items: ChecklistItem[] = template.map(t => {
    // 基础计算: 单人用量 × 宝宝数 × 冗余系数
    let qty = Math.ceil(t.single_qty * babyCount * redundancyFactor);

    // === 特殊规则 ===
    if (t.id === 'c1') {
      // 纸尿裤: 额外 +2 片防突发
      qty += 2;
    }
    if (t.id === 'c3') {
      // 奶粉: 向上取整到整瓶
      qty = Math.ceil(qty);
    }
    if (t.id === 'c11' || t.id === 'c12') {
      // 应急药: 固定 +1 份（双胞胎的安全冗余）
      qty += babyCount;
    }

    return {
      ...t,
      suggested_qty: qty,
      actual_qty: qty,
    };
  });

  const mandatoryItems = items.filter(i => i.mandatory);
  const totalSuggestedUnits = items.reduce((sum, i) => sum + i.suggested_qty, 0);

  return {
    ok: true,
    templateName: input.scene ? `场景:${input.scene}` : '默认模板',
    babyCount,
    tripHours,
    redundancyFactor,
    totalItems: items.length,
    mandatoryItems: mandatoryItems.length,
    totalSuggestedUnits,
    items,
  };
}
