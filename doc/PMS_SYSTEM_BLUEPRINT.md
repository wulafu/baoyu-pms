# 民宿 PMS 系统开发蓝图与详细需求规格说明书

| 文档类型     | 系统设计规格书                           |
| :----------- | :--------------------------------------- |
| **目标系统** | 类宝寓 PMS (全渠道民宿管理系统)          |
| **版本**     | V1.0 (架构设计版)                        |
| **适用对象** | 产品经理、系统架构师、后端开发、前端开发 |

---

## 1. 系统建设目标

构建一套支持**多渠道直连**、**移动端优先**、**深度集成微信生态**的 SaaS 化民宿管理系统。核心解决房东在多平台运营时的“库存同步”与“多端操作”痛点。

---

## 2. 系统逻辑架构设计

```mermaid
graph TD
    Client_C[C端住客: 微信小程序/H5]
    Client_B[B端房东: App/企微/Web后台]

    subgraph "API Gateway (网关层)"
        Auth[鉴权中心]
        RateLimit[限流熔断]
    end

    subgraph "Core Services (核心服务层)"
        Svc_Room[房源服务]
        Svc_Order[订单服务]
        Svc_Stock[库存中心 (Redis)]
        Svc_Channel[渠道直连引擎 (核心)]
        Svc_Finance[财务服务]
        Svc_Notify[消息通知服务]
    end

    subgraph "Data Layer (数据层)"
        DB_Main[(MySQL - 业务数据)]
        DB_Cache[(Redis - 房态缓存)]
        MQ[(RabbitMQ - 异步消息)]
    end

    subgraph "External Interfaces (外部接口)"
        OTA_API[OTA 平台: Airbnb/携程/美团]
        Wx_API[微信生态: 支付/模板消息]
        IoT_API[IoT 设备: 智能门锁]
    end

    Client_C --> Gateway
    Client_B --> Gateway
    Gateway --> Svc_Order
    Gateway --> Svc_Room

    Svc_Order --> Svc_Stock
    Svc_Stock <--> DB_Cache
    Svc_Stock --> MQ
    MQ --> Svc_Channel
    Svc_Channel <--> OTA_API
```

---

## 3. 详细功能模块规格 (Feature Specs)

### 3.1 房态日历中心 (PMS Core)

这是系统的“心脏”，必须保证数据的绝对实时性和准确性。

- **功能描述**：
  - **聚合日历**：在一个网格视图中显示所有房源未来 30-90 天的预订状态。
  - **拖拽排房**：支持拖动订单色块修改房间或日期（仅限未锁单）。
  - **状态图例**：空房、已预订（区分渠道颜色）、维修/自用、待入住、已入住、待保洁。
- **技术要求**：
  - **接口响应**：日历加载速度 < 500ms（需采用 Redis BitMap 或专门的日历表结构优化查询）。
  - **并发控制**：使用乐观锁或 Redis 分布式锁防止多人同时操作同一房间。

### 3.2 渠道直连引擎 (Channel Manager)

这是系统最复杂的技术难点，涉及与第三方平台的双向同步。

- **功能描述**：
  - **账号授权**：支持 OAuth2.0 或 Cookie 维持（针对无开放 API 的平台）。
  - **映射配置**：将 PMS 本地房型 ID 与 OTA 平台房型 ID 建立绑定关系。
  - **上行同步 (PMS -> OTA)**：本地改价、关房、落单后，自动推送到所有绑定渠道。
  - **下行同步 (OTA -> PMS)**：监听 OTA 订单 Webhook 或定时轮询，抓取新订单。
- **开发难点**：
  - **抓取策略**：对于无官方 API 的平台（如部分海外小众平台），可能需要开发爬虫（Spider）进行模拟登录和轮询，需解决验证码和 IP 封禁问题。
  - **队列机制**：同步任务必须异步化。使用 RabbitMQ/Kafka 处理“库存扣减”消息，确保高并发下不丢消息。

### 3.3 订单管理系统 (OMS)

- **功能描述**：
  - **全生命周期管理**：待支付 -> 待确认 -> 待入住 -> 在住 -> 已离店 -> 已取消。
  - **人工补单**：支持房东手工录入线下订单（Walk-in）。
  - **入住凭证**：生成动态二维码或数字核销码。
- **数据模型 (Order 表关键字段)**：
  - `order_id` (主键)
  - `source_channel` (来源: Airbnb/Meituan/Direct...)
  - `external_order_id` (外部订单号)
  - `room_id` (关联房间)
  - `check_in_date` / `check_out_date`
  - `guest_info` (JSON: 姓名, 证件)
  - `payment_status`

### 3.4 微信微店 (Direct Booking)

- **功能描述**：
  - **房源展示**：轮播图、设施标签、地图导航。
  - **日历选房**：与 PMS 库存实时打通。
  - **微信一键登录**：获取用户 OpenID，建立会员档案。
  - **分销裂变**：生成带参数的推广海报，记录分销关系（一级/二级分销）。

---

## 4. 数据库模型设计概念 (ER Diagram Concept)

### 核心表结构

1.  **`merchant` (商户表)**: 存储房东信息、会员等级、过期时间。
2.  **`room` (房间表)**: 房型名称、基础价格、最大入住人数、设施列表。
3.  **`room_stock` (库存日历表)**:
    - 核心设计：每一行代表`room_id` + `date` 的状态。
    - 字段：`room_id`, `biz_date` (日期), `status` (0:空, 1:订, 2:闭), `price` (当日价格), `order_id` (占用订单)。
4.  **`channel_mapping` (渠道映射表)**:
    - `local_room_id` <--> `ota_channel_code` + `ota_room_id`。
5.  **`sync_log` (同步日志表)**: 记录每一次库存变更推送的结果，用于排查“撞单”原因。

---

## 5. 技术栈推荐 (Tech Stack)

### 后端 (Backend)

- **语言**：Java (Spring Boot) 或 Go (Gin/Echo) —— 适合高并发和复杂业务逻辑。
- **框架**：Spring Cloud Alibaba (微服务架构，适合后期扩展) 或 单体模块化架构 (初期 MVP)。

### 前端 (Frontend)

- **B 端 (房东)**：Flutter 或 React Native (一套代码生成 iOS/Android)，Uni-app (覆盖微信小程序)。
- **C 端 (住客)**：微信小程序原生开发或 Uni-app。

### 中间件 & 基础设施

- **数据库**：MySQL 8.0 (业务数据), MongoDB (存储日志和复杂的 JSON 配置)。
- **缓存**：Redis (必须，用于存储实时房态 BitMap)。
- **消息队列**：RabbitMQ (处理订单异步解耦和渠道同步任务)。
- **定时任务**：XXL-JOB (处理定时抓取、夜审、提醒)。

---

## 6. 开发路线图 (Roadmap)

### 第一阶段：MVP (最小可行性产品) - 周期 2 个月

- 完成房源录入与管理。
- 实现核心房态日历（仅支持手动录入订单）。
- 完成微信小程序端的房东管理后台。
- **关键交付**：房东可以扔掉纸质账本，用手机记账和管房。

### 第二阶段：直连与自动化 - 周期 3 个月

- 对接主流 OTA (携程、美团、Airbnb) 的直连 API。
- 实现库存自动同步引擎。
- 开发微信模板消息通知。
- **关键交付**：解决“撞单”痛点，实现自动化关房。

### 第三阶段：私域与增长 - 周期 2 个月

- 开发微店预订系统。
- 对接智能门锁接口。
- 上线财务报表与经营分析。
- **关键交付**：帮助房东建立私域流量，降低 OTA 佣金依赖。
