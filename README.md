<div align="center">

```
 ██╗   ██╗ ███╗  ██╗ ███████╗ ███████╗ ███████╗ ████████╗
 ██║   ██║ ████╗ ██║ ██╔════╝ ██╔════╝ ██╔════╝ ╚══██╔══╝
 ██║   ██║ ██╔██╗██║ █████╗   █████╗   ███████╗    ██║
 ╚██╗ ██╔╝ ██║╚████║ ██╔══╝   ██╔══╝   ██╔════╝    ██║
  ╚████╔╝  ██║ ╚███║ ██║      ███████╗ ███████╗    ██║
   ╚═══╝   ╚═╝  ╚══╝ ╚═╝      ╚══════╝ ╚══════╝    ╚═╝
```

# Galgame 同好会地图

### 中日高校视觉小说社团 · 可视化导航与社群平台

[![GPLv3](https://img.shields.io/badge/license-GPLv3-blue?style=flat-square)](LICENSE)
[![PHP](https://img.shields.io/badge/php-8.x-777bb4?style=flat-square&logo=php)](https://php.net)
[![JS](https://img.shields.io/badge/js-ES6+-f7df1e?style=flat-square&logo=javascript)](https://developer.mozilla.org/)
[![D3](https://img.shields.io/badge/d3.js-7.9-f9a03c?style=flat-square&logo=d3.js)](https://d3js.org/)

🌐 **[map.vnfest.top](https://www.map.vnfest.top)**

`🇨🇳 232 同好会  ·  🇯🇵 27 サークル  ·  ZH ⇄ JA 双语  ·  Dark / Light 主题`

</div>

---

## 这是什么

面向 **中国 × 日本 高校 Galgame / 视觉小说同好会** 的交互式社群地图。以 SVG 矢量地图为入口，串联社团发现、成员管理、活动日历、刊物投稿、GalOnly 出展申请整套场景。

```
发现社团 → 申请加入 → 参与活动 → 投稿刊物 → 出展 GalOnly
```

---

## 功能模块

| | 模块 | 说明 |
|---|------|------|
| 🗺️ | **地图** | D3.js 中国 34 省 + 日本 47 都道府县，点击钻取 |
| 🔍 | **搜索** | 名称 / 群号 / 学校检索，类型筛选，四维排序 |
| 👤 | **账号** | bcrypt 注册登录 · QQ / Discord OAuth2 · 头像裁剪 |
| 🏛️ | **社团** | 加入/退出/角色 · 绑定码邀请 · 联系方式权限 |
| 📅 | **日历** | 月历 + 列表双视图 · 活动弹窗 · 报名/取消 |
| 📖 | **刊物** | 投稿 → 6 段进度追踪 · 封面图 |
| 🎟️ | **GalOnly** | 高校出展申请 → 7 人投票审批 → 状态追踪 |
| ⭐ | **推荐榜** | Bangumi 数据 · 每社最多 12 部 · 评分 + 封面 |
| 💬 | **留言板** | 社团留言/评价 · 管理删除 |
| 📚 | **Wiki** | 同好会维基编辑器 · 动态索引页 · 图片比例控制 |
| 🔔 | **通知** | 全局通知 · 公告系统 · 社团消息 |
| 👑 | **后台** | 审核审批 · 社团管理 · 绑定码 · 推荐榜 · Wiki |
| 🌏 | **双语** | 中文 / 日本語 ~200 键 |
| 🎨 | **主题** | 深色 / 浅色 · 玻璃拟态 |

---

## 快速开始

```bash
git clone https://github.com/kokubunshu/china-galgame-maps.git
cd china-galgame-maps

cp config.example.php config.php   # 编辑数据库、OAuth 信息
php scripts/migrate.php            # 初始化数据库
php -S localhost:8000              # 启动开发服务器
```

> PHP 8.0+ · SQLite (默认) / MySQL · Apache mod_rewrite

---

## 角色权限

| 权限 | visitor | member | manager | rep | super |
|------|:---:|:---:|:---:|:---:|:---:|
| 浏览地图/搜索 | ● | ● | ● | ● | ● |
| 申请加入社团 | ● | ● | — | — | — |
| 查看内部联系方式 | — | ● | ● | ● | ● |
| 审核成员申请 | — | — | ● | ● | ● |
| 编辑社团信息 | — | — | ● | ● | ● |
| 管理推荐榜/留言 | — | — | ● | ● | ● |
| 编辑 Wiki | — | — | ● | ● | ● |
| 转让负责人 | — | — | — | ● | ● |
| 全局管理 | — | — | — | — | ● |

---

## 技术栈

| 层 | 选型 |
|---|------|
| 前端 | Vanilla JS ES6+ · CSS Custom Properties · D3.js v7 |
| 后端 | PHP 8.x (零框架) · PDO 双驱动 |
| 数据库 | SQLite (默认) / MySQL |
| 认证 | PHP Session · QQ OAuth2 · Discord OAuth2 · bcrypt (cost=12) |
| 图片 | Cropper.js (前端) · GD (后端) |
| 地图 | SVG GeoJSON · D3 geoMercator |
| 移动端 | Capacitor Android APK · Electron Windows EXE |
| 许可 | GPLv3 |

---

## 项目结构

```
├── index.html                    # SPA 主入口
├── feedback.html                 # 反馈建议
├── admin/
│   ├── club_manager.html         # 社团管理面板
│   ├── wiki_editor.html          # Wiki 编辑器
│   ├── reviews.html              # 审核中心 (含反馈管理)
│   └── ...
├── api/                          # 20 个 PHP 接口
│   ├── auth.php                  # 认证 (bcrypt + OAuth2 + 邮箱验证)
│   ├── clubs.php / clubs_japan.php
│   ├── membership.php / events.php
│   ├── wiki.php                  # Wiki 编辑/生成/图片上传
│   ├── feedback.php              # 反馈管理
│   └── ...
├── includes/                     # auth · db · oauth · notifications
├── js/
│   ├── app.js                    # 主逻辑 + i18n
│   ├── app-core.js               # 公共配置/工具
│   ├── calendar.js               # 活动日历
│   └── china.js / japan.js       # SVG 地图数据
├── wiki/                         # 同好会维基子系统
│   ├── index.html                # 索引页 (渐进增强)
│   ├── content/                  # 各校内容源 (JSON)
│   ├── pages/                    # 生成页面
│   └── library/                  # 文档库
├── data/                         # JSON 数据库 + 上传目录
├── scripts/                      # 构建 · 迁移 · 测试
└── Galgame_events/               # GalOnly 专属页
```

---

## 更新日志

### v1.6.3 — Wiki 子系统与平台增强 `2026-05-15`

**🆕 Wiki 子系统** — 可视化编辑器 + 动态索引页 + 内容生成管线 + 图片宽高比控制（6 档）
**🔐 邮箱验证** — 注册需 6 位验证码，5 分钟过期
**📋 反馈系统** — 用户提交 + 管理后台处理
**🔧 权限增强** — `canManageClubInCountry()` 中日分区 · 事件去重 (flock) · 构建重构 (共享路径模块)

### v1.6.2 — 管理后台 UI 修繕

修复神器榜面板 Grid 对齐 · 搜索框溢出 · 推荐榜视觉调整

### v1.6.1 — 地图/列表双模式

地图 ↔ 列表切换 · ~60 日文翻译键 · 管理后台 VN 暗色主题重设计 · APK 打包

### v1.6.0 — 同好会系统增强

绑定码 · Bangumi 推荐榜 · 留言板 · 通知公告

### v1.5.0 — 用户面板与 GalOnly

GalOnly 7 人投票 · VN 风格账号面板 · 活动报名

---

## 相关项目

- [china-bandori-maps](https://github.com/HELPMEEADICE/china-bandori-maps) — 原始地图数据参考

<br>

<div align="center">

```
  このプロジェクトは、世界中のギャルゲーファンをつなぐ架け橋となることを目指しています。
  This project aims to be a bridge connecting galgame fans across China, Japan, and beyond.

                              VNFest  ·  v1.6.3  ·  GPLv3
```

</div>
