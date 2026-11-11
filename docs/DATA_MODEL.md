# Data Model

> **版本**: v0.1
> **日期**: 2026-11-11

---

## ER 图概览

```
Family ──< Baby          (一对多)
  │
  └──< Trip ──< TripNode      (一对多: 家庭→行程→行程节点)
  │
  └──< ChecklistTemplate      (一对多)
  │
  └──< Checklist ──< ChecklistItem  (一对多: 清单→清单项)
```

---

## 1. Family（家庭）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | string | 家庭名称，如 "王家" |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

```sql
CREATE TABLE family (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. User（用户 — 爸爸妈妈）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| family_id | UUID | 关联家庭 |
| openid | string | 微信 openid（唯一）|
| nickname | string | 昵称 |
| role | enum | 'father' / 'mother' / 'other' |
| avatar_url | string | 头像 |

```sql
CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES family(id),
  openid VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('father', 'mother', 'other')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Baby（宝宝档案）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| family_id | UUID | 关联家庭 |
| name | string | 宝宝小名，如 "大宝" |
| nickname | string | 全名 |
| gender | enum | 'M' / 'F' |
| birthday | date | 出生日期 |
| height_cm | float | 身高（cm）|
| weight_kg | float | 体重（kg）|
| allergies | string[] | 过敏史 |
| blood_type | string | 血型 |
| avatar_url | string | 头像 |

```sql
CREATE TABLE baby (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES family(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  nickname VARCHAR(100),
  gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
  birthday DATE NOT NULL,
  height_cm FLOAT,
  weight_kg FLOAT,
  allergies TEXT[],
  blood_type VARCHAR(5),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. BabyRoutine（宝宝作息模板）

每个宝宝一份，用于行程规划时的时间冲突检测。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| baby_id | UUID | 关联宝宝 |
| event_type | enum | 'feed'（喂奶）/'nap'（睡觉）/'bath'（洗澡）/'play'（玩耍）|
| start_time | time | 开始时间 |
| duration_min | int | 持续时长（分钟）|
| buffer_before_min | int | 开始前缓冲 |
| buffer_after_min | int | 结束后缓冲 |

```sql
CREATE TABLE baby_routine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID REFERENCES baby(id) ON DELETE CASCADE,
  event_type VARCHAR(20) CHECK (event_type IN ('feed', 'nap', 'bath', 'play')),
  start_time TIME NOT NULL,
  duration_min INTEGER NOT NULL,
  buffer_before_min INTEGER DEFAULT 0,
  buffer_after_min INTEGER DEFAULT 5
);

-- 示例数据（8个月宝宝典型作息）
-- 6:30 起床 (play, 60min)
-- 8:00 喂早餐 (feed, 30min)
-- 10:30 上午 nap (nap, 90min)
-- 12:00 午饭 (feed, 30min)
-- 14:00 下午 nap (nap, 120min)
-- 16:30 加餐 (feed, 20min)
-- 18:00 晚饭 (feed, 30min)
-- 20:00 睡前 nap (nap, 12*60min) → 实际是夜间睡眠
```

## 5. Trip（行程）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| family_id | UUID | 关联家庭 |
| title | string | 行程名称，如 "周六奥森公园游" |
| start_date | date | 开始日期 |
| end_date | date | 结束日期 |
| location_from | jsonb | 起点（经纬度 + 地址）|
| status | enum | 'draft' / 'planned' / 'in_progress' / 'completed' / 'cancelled' |
| notes | text | 备注 |
| created_by | UUID | 创建者 |

```sql
CREATE TABLE trip (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES family(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location_from JSONB,
  status VARCHAR(20) CHECK (status IN ('draft', 'planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES "user"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 6. TripNode（行程节点）

行程中的每个具体活动点。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| trip_id | UUID | 关联行程 |
| order_index | int | 顺序 |
| title | string | 节点名称，如 "奥森公园" |
| node_type | enum | 'travel'（路途）/'activity'（活动）/'feed'（喂奶）/'nap'（睡觉）/'meal'（吃饭）/'rest'（休息）/'emergency'（应急）|
| start_window_start | datetime | 时间窗开始 |
| start_window_end | datetime | 时间窗结束 |
| duration_min | int | 停留时长 |
| location | jsonb | 经纬度 + 地址 |
| map_poi_id | string | 腾讯地图 POI ID |
| distance_km | float | 距上一个节点距离 |
| travel_time_min | int | 交通时间 |
| conflict_flag | boolean | 是否与宝宝作息冲突 |
| conflict_details | jsonb | 冲突详情 |
| status | enum | 'pending' / 'in_progress' / 'completed' / 'skipped' |

```sql
CREATE TABLE trip_node (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trip(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  node_type VARCHAR(20) CHECK (node_type IN ('travel', 'activity', 'feed', 'nap', 'meal', 'rest', 'emergency')),
  start_window_start TIMESTAMP WITH TIME ZONE,
  start_window_end TIMESTAMP WITH TIME ZONE,
  duration_min INTEGER,
  location JSONB,
  map_poi_id VARCHAR(100),
  distance_km FLOAT,
  travel_time_min INTEGER,
  conflict_flag BOOLEAN DEFAULT FALSE,
  conflict_details JSONB,
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 7. ChecklistTemplate（物品清单模板）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | string | 模板名，如 "周末公园游" |
| scene | enum | 'park' / 'beach' / 'road_trip' / 'flight' / 'visit' / 'urban' |
| is_system | boolean | 系统预设 vs 用户自定义 |
| family_id | UUID | 用户自定义时关联家庭 |

## 8. ChecklistItem（清单项）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| template_id | UUID | 关联模板 |
| name | string | 物品名称，如 "纸尿裤" |
| category | enum | 'feeding'（喂奶）/'diaper'（换尿布）/'clothes'（衣物）/'medicine'（药品）/'gear'（装备）/'other' |
| single_qty | int | 单人用量 |
| unit | string | 单位（片、瓶、条）|
| is_mandatory | boolean | 是否必带 |
| min_hours | float | 出行时长阈值（≥此时长才显示）|
| notes | text | 备注 |

## 9. Checklist（实际使用的清单）

用户从模板生成的具体清单，关联某个 Trip。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| trip_id | UUID | 关联行程 |
| template_id | UUID | 来源模板 |
| baby_count | int | 宝宝数量（用于计算 ×N）|
| hours | float | 预计出行时长 |

## 10. ChecklistInstance（清单实例项 — 计算后的实际带量）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| checklist_id | UUID | 关联清单 |
| item_id | UUID | 关联模板项 |
| suggested_qty | int | 系统建议带量（已×N + 冗余）|
| actual_qty | int | 实际带量 |
| packed | boolean | 是否已打包 |

---

## 索引策略

```sql
-- 高频查询索引
CREATE INDEX idx_baby_family ON baby(family_id);
CREATE INDEX idx_routine_baby ON baby_routine(baby_id);
CREATE INDEX idx_trip_family ON trip(family_id, start_date);
CREATE INDEX idx_trip_node_trip ON trip_node(trip_id, order_index);
CREATE INDEX idx_checklist_trip ON checklist(trip_id);
CREATE INDEX idx_checklist_instance_checklist ON checklist_instance(checklist_id);
```
