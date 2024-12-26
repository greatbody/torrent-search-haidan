# 海胆-QBit 接口

一个用于在 haidan.video 搜索视频并使用 qBittorrent 下载的网页界面。该工具为 haidan.video 和 qBittorrent 提供了无缝集成，便于种子管理。

## 功能特性
- 在 haidan.video 上即时搜索视频
- 显示完整的种子信息：
  - 视频名称和详细信息
  - 种子大小和做种数
  - 免费/优惠状态
  - 标签和分类
- 自动处理下载链接
- 直接集成 qBittorrent
- 基于分类的种子组织
- 清爽的响应式界面
- 安全的凭证处理

## 安装设置

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
   - 在后端目录中将 `.env.example` 复制为 `.env`
   - 必需的配置项：
     - `HAIDAN_COOKIE`: 你的 haidan.video cookie
     - `QBITTORRENT_URL`: 你的 qBittorrent WebUI 地址
     - `QBITTORRENT_USERNAME`: qBittorrent WebUI 用户名
     - `QBITTORRENT_PASSWORD`: qBittorrent WebUI 密码

3. 启动开发服务器：
```bash
npm run dev
```
这将同时启动前端和后端服务器。

## 技术栈
- 前端：
  - React
  - TypeScript
  - Vite
  - 现代响应式 CSS 设计
- 后端：
  - Node.js
  - Express
  - TypeScript
  - 敏感数据加密处理
- 集成：
  - qBittorrent WebUI API
  - haidan.video 网页抓取

## 开发说明
- 前端运行在 `http://localhost:5173`
- 后端 API 服务运行在 `http://localhost:3000`
- 通过 npm scripts 管理并发开发服务器
