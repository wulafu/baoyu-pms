# 宝寓PMS 后端 API 接口文档

## 基础信息
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

---

## 1. 认证模块 (Auth)

### 1.1 注册/登录
`POST /auth/register`
用于创建新用户（模拟微信登录）。

**请求参数**:
```json
{
  "nickname": "Host Alice",
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "id": 1,
  "openid": "...",
  "nickname": "Host Alice",
  "role": "host",
  "token": "..."
}
```

---

## 2. 房源与房间 (Properties & Rooms)

### 2.1 获取房源列表
`GET /properties`

### 2.2 创建房间
`POST /rooms`

**请求参数**:
```json
{
  "property_id": 1,
  "name": "海景大床房",
  "base_price": 500,
  "max_guests": 2
}
```

---

## 3. 房态管理 (Calendar & Stock)

### 3.1 获取房态日历
`GET /rooms/:id/calendar`

**Query 参数**:
- `start_date`: 开始日期 (YYYY-MM-DD)
- `end_date`: 结束日期 (YYYY-MM-DD)

**响应示例**:
```json
{
  "data": [
    {
      "biz_date": "2025-01-01",
      "status": "available", // available | booked | blocked
      "price": 500
    },
    ...
  ]
}
```

### 3.2 手动改房态/改价
`PUT /rooms/:id/stock`

**请求参数**:
```json
{
  "date": "2025-01-01",
  "status": "blocked", // 可选: available | blocked
  "price": 600         // 可选: 修改当日价格
}
```

---

## 4. 订单管理 (Orders)

### 4.1 创建订单
`POST /orders`

**请求参数**:
```json
{
  "user_id": 1,
  "room_id": 1,
  "check_in_date": "2025-01-01",
  "check_out_date": "2025-01-03",
  "nights": 2,
  "total_amount": 1000,
  "guest_info": { "name": "张三", "phone": "138..." }
}
```

### 4.2 更新订单状态
`PUT /orders/:id/status`

**请求参数**:
```json
{
  "status": "checked_in" // confirmed | checked_in | checked_out | cancelled
}
```
> **注意**: 状态改为 `cancelled` 会自动释放库存。

---

## 5. 渠道管理 (Channels)

### 5.1 配置渠道映射
`POST /channels/mappings`

**请求参数**:
```json
{
  "property_id": 1,
  "channel_code": "airbnb", // airbnb | ctrip
  "channel_name": "Airbnb",
  "local_room_id": "1",
  "channel_room_id": "ab_888",
  "sync_enabled": true
}
```

---

## 6. 经营报表 (Reports)

### 6.1 获取看板数据
`GET /reports/dashboard`

**响应示例**:
```json
{
  "data": {
    "today": {
      "check_ins": 5,
      "check_outs": 2
    },
    "month": {
      "revenue": 12000,
      "occupancy_rate": "65.5"
    }
  }
}
```
