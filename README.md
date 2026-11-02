# Subway Studio

以 Subway 为灵感的三明治搭配互动网页：选面包 → 加主料 → 加蔬菜 → 加酱料，每一层实时显示卡路里；支持同一款食材加多份（例如双份酱料）、2D 俯视 / Three.js 3D 工作台、烤制效果、6/12 英寸、打包动画、搭配卡 PNG、社区分享与点赞、购物车与模拟支付；深色 / 浅色主题，中文 / English。

## 技术栈

- React 19 + Vite + TypeScript + Tailwind CSS v4
- Three.js + @react-three/fiber + @react-three/drei（3D 工作台）
- Motion（动画）、Zustand（状态）、Lucide（图标）
- Supabase（食材营养表、社区搭配、点赞 RPC、Realtime、示例订单）

## 本地运行

```sh
npm install
npm run dev
```

打开 http://localhost:5173 。

`.env` 需要：

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

没有 `.env` 或表不存在时自动进入「本地模式」：搭配、点赞、订单保存在浏览器本地。

## Supabase

在 `supabase/migrations/` 下有两份 SQL，按顺序在 SQL Editor 里执行即可：

1. `0001_subway_studio.sql`：`subway_ingredients`（营养与价格）、`subway_creations`（社区搭配）、`subway_like()` RPC、Realtime 发布、种子数据
2. `0002_subway_orders.sql`：`subway_orders`（购物车结算后的示例订单，`payment = 'demo'`）

所有表启用 RLS：匿名可读、可插入，点赞只能通过 RPC +1。

## 图片素材

`public/assets/` 下的两张透明图集在页面加载时按格切片（按 alpha 边界自动裁剪并居中），同时生成 2D 精灵与 3D 贴图。烧烤酱、甜辣酱由芥末酱贴图按色调重新着色。

## 说明

所有价格、营养数据与支付都是示例，不接收真实订单，也不会扣款。

## 线上地址

- 网站：https://frozenheart123.github.io/subway-studio/
- 源码：https://github.com/frozenheart123/subway-studio

部署方式：`npm run deploy` 会构建并把 `dist/` 推到 `gh-pages` 分支（需要本地 `.env`，因为 Supabase 地址与 publishable key 在构建时内联）。
