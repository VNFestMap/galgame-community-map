<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ██╗   ██╗ ███╗  ██║ ███████╗ ███████╗ ███████╗ ████████╗     ║
║   ██║   ██║ ████╗ ██║ ██╔════╝ ██╔════╝ ██╔════╝ ╚══██╔══╝     ║
║   ██║   ██║ ██╔██╗██║ █████╗   █████╗   ███████╗    ██║        ║
║   ╚██╗ ██╔╝ ██║╚████║ ██╔══╝   ██╔══╝   ██╔════╝    ██║        ║
║    ╚████╔╝  ██║ ╚███║ ██║      ███████╗ ███████╗    ██║        ║
║     ╚═══╝   ╚═╝  ╚══╝ ╚═╝      ╚══════╝ ╚══════╝    ╚═╝        ║
║                                                                  ║
║        ┌───────────────────────────────────────┐                 ║
║        │  🗺️ 全国 Galgame 同好会マップ           │                 ║
║        │  China × Japan × Visual Novel Clubs    │                 ║
║        └───────────────────────────────────────┘                 ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

# 🗺️ VNFest — Galgame 同好会地图

### 中日高校视觉小说社团 · 可视化导航与社群平台

<br/>

[![License](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge&logo=gnu)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4?style=for-the-badge&logo=php)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JS-ES6+-f7df1e?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/)
[![D3](https://img.shields.io/badge/D3.js-7.9-f9a03c?style=for-the-badge&logo=d3.js)](https://d3js.org/)

<br/>

🌐 **[map.vnfest.top](https://www.map.vnfest.top)**

<br/>

```
      ┌───────────────────────────────────────────────────┐
      │  🇨🇳 232 同好会  ·  🇯🇵 27 サークル  ·  計 259 団体    │
      │    ZH ⇄ JA 双语  ·  Dark/Light 双主题  ·  OSS       │
      └───────────────────────────────────────────────────┘
```

</div>

---

## ✦ 这是什么？

一个面向 **中国 × 日本 高校 Galgame / 视觉小说同好会** 的交互式社群地图平台。以 SVG 矢量地图为入口，串联**社团发现、成员管理、活动日历、刊物投稿、GalOnly 出展申请**整套场景——既是地图导航，也是社团运营面板。

```
发现社团  →  申请加入  →  参与活动  →  投稿刊物  →  出展 GalOnly
   │              │            │             │              │
   ▼              ▼            ▼             ▼              ▼
 地图搜索    绑定码 / 审核   日历报名    状态追踪    7人投票审核
```

---

## ✦ 一句话概览

| 模块 | 你用它做什么 |
|------|-------------|
| 🗺️ **地图** | D3.js 中国34省 + 日本47都道府县，点击钻取社团列表 |
| 🔍 **搜索** | 名称 / 群号 / 学校多维度检索，类型筛选 + 四个维度排序 |
| 👤 **账号** | 注册登录（bcrypt）、QQ / Discord OAuth2、头像裁剪上传 |
| 🏛️ **社团** | 加入/退出/角色体系、绑定码邀请、联系方式权限控制 |
| 📅 **日历** | 月历+列表双视图、活动详情弹窗、报名/取消、多日跨月 |
| 📖 **刊物** | 社团出版物投稿、6段进度追踪（企划→发布）、封面图 |
| 🎟️ **GalOnly** | 高校出展申请 → 7人投票审批 → 状态追踪 → 重审机制 |
| 🔔 **通知** | 全局通知下拉、公告系统、社团内互动消息 |
| ⭐ **推荐榜** | Bangumi 数据对接，每社最多12部作品推荐（评分+封面） |
| 💬 **留言板** | 社团页面留言/评价，管理员可管理删除 |
| 👑 **后台** | 审核审批、社团管理、绑定码生成、推荐榜编辑、公告发布 |
| 🌏 **双语** | 中文 / 日本語 一键切换，~200 翻译键全覆盖 |
| 🎨 **主题** | 深色/浅色 跟随系统，玻璃拟态 + 渐变动效 |

---

## ✦ 快速开始

```bash
git clone https://github.com/kokubunshu/china-galgame-maps.git
cd china-galgame-maps

# 1) 配置
cp config.example.php config.php     # 编辑数据库、OAuth 等信息

# 2) 初始化数据库
php scripts/migrate.php

# 3) 启动
php -S localhost:8000
```

> **环境**: PHP 8.0+ · SQLite (默认) / MySQL · Apache mod_rewrite

---

## ✦ 架构一览

```
                  ┌──────────────┐
                  │  index.html  │  ← SPA 主入口
                  └──────┬───────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌───────────┐
    │ 中国地图  │  │ 日本地图  │  │ 列表视图   │   ← D3.js SVG 渲染
    │ china.js │  │ japan.js │  │ (Grid)    │
    └────┬─────┘  └────┬─────┘  └─────┬─────┘
         │             │              │
         └──────┬──────┘              │
                ▼                     ▼
         ┌─────────────┐    ┌────────────────┐
         │  社团详情    │    │ 搜索/筛选/排序   │
         │  成员/推荐   │    │ (全量内存索引)   │
         └──────┬──────┘    └────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  API          Auth        Data
 (PHP)    (Session+OAuth)  (JSON+SQLite)
```

```
admin/club_manager.html ─── 社团管理后台（独立, VN 主题）
submit*.html ─── 提交页（独立, 表单）
Galgame_events/* ─── GalOnly 专属区（独立）
```

---

## ✦ 角色体系

```
visitor (0) ──→ member (1) ──→ manager (2) ──→ representative (3)
                                                     │
                                              super_admin (4)
                                              (全局管理, is_audit 审核)
```

| 你可以… | visitor | member | manager | rep | super |
|---------|:------:|:------:|:-------:|:---:|:-----:|
| 浏览地图/搜索 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 申请加入社团 | ✅ | ✅ | - | - | - |
| 查看内部联系方式 | - | ✅ | ✅ | ✅ | ✅ |
| 审核成员申请 | - | - | ✅ | ✅ | ✅ |
| 编辑社团信息 | - | - | ✅ | ✅ | ✅ |
| 生成绑定码 | - | - | ✅ | ✅ | ✅ |
| 管理推荐榜/留言 | - | - | ✅ | ✅ | ✅ |
| 转让负责人 | - | - | - | ✅ | ✅ |
| 全局管理 | - | - | - | - | ✅ |

---

## ✦ 目录

```
├── index.html               # 主地图页 (SPA)
├── admin/
│   ├── club_manager.html    # 社团管理面板 (VN 暗色主题)
│   ├── reviews.html         # 提交审核中心
│   ├── Galonly_audit.html   # GalOnly 出展审批
│   └── events.php           # 活动审批
├── api/                     # 18 个 PHP 接口
│   ├── auth.php             # 认证 (bcrypt + QQ + Discord OAuth2)
│   ├── clubs.php / clubs_japan.php
│   ├── membership.php       # 社团成员 CRUD
│   ├── events.php           # 活动 + 报名
│   ├── publications.php / manuscripts.php
│   ├── galonly.php          # GalOnly 申请 + 投票审核
│   ├── bangumi_proxy.php    # Bangumi API 缓存代理
│   ├── club_codes.php       # 绑定码
│   ├── club_comments.php    # 留言板
│   ├── club_recommendations.php  # 推荐榜
│   ├── announcements.php / notifications.php
│   ├── avatar.php / club_avatar.php
│   └── submit.php / submit_event.php / submit_publication.php
├── includes/                # PHP 核心库
│   ├── auth.php             # 角色与权限
│   ├── db.php               # PDO (SQLite / MySQL 双驱动)
│   ├── oauth_qq.php / oauth_discord.php
│   └── notifications.php / audit.php / rate_limit.php
├── js/
│   ├── app.js               # 主逻辑 + i18n (~200 翻译键)
│   ├── calendar.js          # 活动日历 (月历/列表/报名)
│   ├── china.js             # 中国 34 省 SVG Path
│   └── japan.js             # 日本 47 都道府県 SVG Path
├── css/styles.css           # 全局样式 (玻璃态 + 多主题)
├── data/                    # JSON 数据库 + SQLite + 上传目录
├── Galgame_events/          # GalOnly 专属页面
├── scripts/                 # 迁移 / 种子 / 重置工具
└── docs/                    # 设计文档 & 原型
```

---

## ✦ API

| Endpoint | Method | 说明 |
|----------|:------:|------|
| `api/clubs.php` | GET | 中国同好会列表 |
| `api/clubs_japan.php` | GET | 日本同好会リスト |
| `api/events.php` | GET/POST | 活动 + 报名/取消 |
| `api/auth.php` | GET/POST | 登录/注册/OAuth |
| `api/membership.php` | GET/POST | 申请/审核/角色变更 |
| `api/galonly.php` | GET/POST | 出展申请/审核/投票 |
| `api/publications.php` | CRUD | 刊物管理 |
| `api/manuscripts.php` | CRUD | 稿件管理 |
| `api/bangumi_proxy.php` | GET | Bangumi 搜索/详情(缓存) |
| `api/club_codes.php` | CRUD | 绑定码生成/使用/撤销 |
| `api/club_comments.php` | CRUD | 留言板 |
| `api/club_recommendations.php` | CRUD | 推荐榜管理 |
| `api/announcements.php` | CRUD | 公告发布 |
| `api/notifications.php` | GET/POST | 通知推送/已读 |
| `api/avatar.php` | POST | 头像上传 + Cropper |
| `api/club_avatar.php` | POST | 社团头像上传 |
| `api/submit.php` | POST | 同好会提交 |
| `api/toggle_visibility.php` | POST | 可见性切换 |

---

## ✦ 技术栈

| 层 | 选型 |
|---:|------|
| 前端 | Vanilla JS (ES6+) · CSS Custom Properties · D3.js v7 |
| 后端 | PHP 8.x (零框架) · PDO 双驱动 |
| 数据库 | SQLite (默认) / MySQL |
| 认证 | PHP Session · QQ OAuth2 · Discord OAuth2 · bcrypt (cost=12) |
| 图片 | Cropper.js (前端裁剪) · GD (后端处理) |
| 地图 | SVG GeoJSON · D3 geoMercator 投影 |
| 移动端 | Capacitor (Android APK) |
| 许可 | GPLv3 |

---

## ✦ 更新日志

### v1.6.2 — 管理后台 UI 修繕

**🔧 修复**
- **神器榜面板对齐**：修复推荐榜左右两栏 `.section-card` 在 Grid 中的 `margin-top` 错位问题
- **搜索框溢出**：修复 Bangumi 搜索输入框在窄容器中超出边界 (`min-width:0` + `max-width`)

**🎨 优化**
- 神器榜推荐图表视觉调整

---

### v1.6.1 — 地图/列表双模式与日文国际化补全

**✨ 新功能**
- **地图 ↔ 列表双模式**：完整列表视图，三分区布局（信息栏 + 地区索引 + 同好会网格）
- **模式切换**：顶部栏 + 列表视图双向同步
- **APK 打包**：Capacitor 配置 + Android 构建脚本

**🌐 日文国际化补全**
- ~60 个新增日文翻译键，列表模式全键日中双配
- 角色名/用户面板/成员管理/收藏页全量覆盖

**🎨 管理后台视觉重设计**
- club_manager.html 全面换装 VN/Galgame 暗色主题
- 暗色/亮色双套设计系统 · 玻璃拟态面板 · 粉/青/金/紫四色强调

---

### v1.6.0 — 同好会系统增强与通知公告

**✨ 绑定码 · 推荐榜 · 留言板 · 通知公告**
- 绑定码加入系统（生成/使用/限量/过期）
- Bangumi API 对接神器推荐榜（搜索+评分+12格展示）
- 社团留言板 CRUD
- 全局通知 + 公告发布系统

---

### v1.5.0 — 用户面板与 GalOnly 高校通道

**✨ GalOnly · 用户面板 · 活动报名**
- GalOnly 高校出展申请 + 7人投票审核 + 驳回重审
- VN 风格账号面板（头像/昵称/签名/图鉴收集）
- 活动报名/取消 + 多日跨月活动

---

## ✦ 相关项目

- [china-bandori-maps](https://github.com/HELPMEEADICE/china-bandori-maps) — 原始地图数据参考

<br/>

---

<br/>

<div align="center">

```
   ✦                                                              ✦
       このプロジェクトは、世界中のギャルゲーファンをつなぐ
              架け橋となることを目指しています。
       
       This project aims to be a bridge connecting
          galgame fans across China, Japan, and beyond.

   ✦                                                              ✦
```

<br/>

### Made with ❤️ for the Visual Novel Community

<br/>

```
   ╔═══════════════════════════════════════════════════╗
   ║  VNFest  ·  v1.6.2  ·  259 Clubs  ·  GPLv3      ║
   ╚═══════════════════════════════════════════════════╝
```

</div>
