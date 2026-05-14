<div align="center">

```
                    ╔═══════════════════════════════════════╗
                    ║                                       ║
                    ║   ██╗   ██╗ ███╗  ██╗ ███████╗       ║
                    ║   ██║   ██║ ████╗ ██║ ██╔════╝       ║
                    ║   ██║   ██║ ██╔██╗██║ █████╗         ║
                    ║   ╚██╗ ██╔╝ ██║╚████║ ██╔══╝         ║
                    ║    ╚████╔╝  ██║ ╚███║ ██║            ║
                    ║     ╚═══╝   ╚═╝  ╚══╝ ╚═╝            ║
                    ║                                       ║
                    ║     🎌 Visual Novel Festival · 视觉小说学园祭              ║
                    ║     中日高校 Galgame 同好会マップ   ║
                    ║                                       ║
                    ╚═══════════════════════════════════════╝
```

# VNFest — Visual Novel Festival

### 视觉小说学园祭 · 中日高校 Galgame 同好会マップ

<br>

[![GPLv3](https://img.shields.io/badge/license-GPLv3-blue?style=for-the-badge&logo=gnuprivacyguard&logoColor=white)](LICENSE)
[![PHP 8.x](https://img.shields.io/badge/PHP-8.x-777bb4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JS-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org)
[![D3.js](https://img.shields.io/badge/D3.js-7.9-f9a03c?style=for-the-badge&logo=d3.js&logoColor=white)](https://d3js.org)
[![SQLite](https://img.shields.io/badge/SQLite-003b57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)

<br>

🌐 **[map.vnfest.top](https://www.map.vnfest.top)** &nbsp;·&nbsp; 📧 **support@vnfest.top**

<br>

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   🇨🇳  232 中国同好会  ·  🇯🇵  27 日本サークル  ·  合計 259 団体       │
│                                                                  │
│   🎌  Visual Novel Festival · 視覚小説学園祭 · GPLv3               │
│   🌏  ZH ⇄ JA 双语  ·  🌙  双主题  ·  🔐  5 级权限  ·  📡  20 API    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

</div>

<br>

---

## ✦ 目录

- [项目简介](#-项目简介)
- [功能总览](#-功能总览)
- [快速开始](#-快速开始)
- [角色与权限](#-角色与权限)
- [系统架构](#-系统架构)
- [项目结构](#-项目结构)
- [API 参考](#-api-参考)
- [技术栈](#-技术栈)
- [部署指南](#-部署指南)
- [更新日志](#-更新日志)
- [贡献指南](#-贡献指南)
- [相关项目](#-相关项目)

---

## ✦ 项目简介

### 这是什么？

**VNFest**（**V**isual **N**ovel **Fest**ival / 视觉小说学园祭）是一个面向 **中国 × 日本 高校 Galgame / 视觉小说同好会** 的交互式社群地图平台。

它以 **SVG 矢量地图** 为核心入口，覆盖中国 34 个省级行政区与日本 47 个都道府县。用户可以在地图上点击钻取、搜索过滤，找到自己学校的同好会；社团管理者可以在独立后台面板中运营自己的社团——从成员审核到活动发布，从刊物投稿到 GalOnly 出展申请，形成闭环。

```
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  🔍 发现  │ →  │  ✋ 加入  │ →  │  📅 活动  │ →  │  📖 刊物  │ →  │  🎟️ 出展 │
  │  社团     │    │  社团     │    │  参与     │    │  投稿     │    │  GalOnly │
  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
       │               │               │               │               │
       ▼               ▼               ▼               ▼               ▼
  D3.js 地图      绑定码 / 审核    日历 / 报名     6 段进度追踪     7 人投票审批
```

### 设计理念

> **学园祭**（がくえんさい）—— 日本校园里一年一度的文化节，社团展示、创作发表、同好交流。VNFest 将这种精神搬到线上：不是做一个冷冰冰的目录，而是做一个有温度的、永不落幕的视觉小说学园祭。

- **地图即首页** —— 可视化是第一印象，降低认知门槛
- **零框架依赖** —— 前端纯 Vanilla JS，后端零框架 PHP，极致轻量
- **离线可用** —— 支持 Capacitor Android APK 和 Electron Windows EXE 打包
- **社区驱动** —— 社团数据由社团管理者自行维护，Wiki 内容众包编写

---

## ✦ 功能总览

<table>
<tr>
<td width="50%">

### 🗺️ 地图与搜索
- **中国地图**：34 省 SVG GeoJSON，点击省份钻取社团列表
- **日本地图**：47 都道府県 SVG，独立数据源
- **多维度搜索**：名称 / 群号 / 学校 / 地区，实时过滤
- **四维排序**：按时间 / 名称 / 学校 / 地区排序
- **类型筛选**：高校社团 / 社会社团 / 全部

### 👤 账户系统
- **本地注册**：邮箱 + 6 位验证码（5 分钟过期），bcrypt 密码哈希 (cost=12)
- **OAuth2 登录**：QQ 互联 / Discord OAuth2
- **头像系统**：Cropper.js 前端裁剪 + GD 后端处理
- **用户面板**：VN 风格，昵称 / 签名 / 收藏社团

### 🏛️ 社团管理
- **加入/退出**：申请 → 审核 → 通过流程
- **绑定码系统**：社团生成邀请码，限量 / 有效期 / 撤销
- **联系方式权限**：公开 / 成员可见，精细控制
- **社团头像**：独立上传与裁剪

</td>
<td width="50%">

### 📅 活动日历
- **月历视图**：D3.js 渲染，多日跨月活动
- **列表视图**：时间线展示
- **活动详情弹窗**：信息完整呈现
- **报名/取消**：一键 RSVP，人数追踪

### 📖 刊物与投稿
- **社团出版物投稿**：封面图 + 详细信息
- **6 段进度追踪**：企划 → 制作 → 校对 → 印刷 → 发布 → 完结
- **状态可视化**：管理后台一目了然

### 🎟️ GalOnly 出展
- **高校通道申请**：专属表单
- **7 人投票审批**：通过/驳回/重审机制
- **状态追踪**：申请者实时查看进度
- **专属页面**：Galgame_events/ 独立展区

### ⭐ 推荐榜 · 留言 · Wiki
- **推荐榜**：Bangumi API 对接，搜索+评分，每社 12 部
- **留言板**：社团留言/评价 CRUD，管理员可管理
- **Wiki 系统**：可视化编辑器，图片比例控制(6 档)，自动页面生成

### 👑 管理后台
- **VN 暗色主题**：粉/青/金/紫四色强调，玻璃拟态
- **审核中心**：成员 / 活动 / 刊物 / GalOnly / 反馈 五合一
- **社团编辑器**：全字段管理 + Wiki 编辑入口
- **通知公告**：全局推送，已读追踪

</td>
</tr>
</table>

---

## ✦ 快速开始

### 环境要求

| 依赖 | 版本 | 说明 |
|------|:----:|------|
| PHP | ≥ 8.0 | CLI + 内置服务器 |
| SQLite | 3.x | 默认数据库（零配置） |
| 或 MySQL | 5.7+ | 生产环境可选 |
| Composer | 2.x | PHP 依赖（可选） |
| Node.js | ≥ 18 | APK / EXE 打包（可选） |

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/kokubunshu/china-galgame-maps.git
cd china-galgame-maps

# 2. 创建配置文件
cp config.example.php config.php
# 编辑 config.php —— 填写数据库路径、QQ/Discord OAuth ID/Secret、SMTP 邮箱配置

# 3. 初始化数据库
php scripts/migrate.php

# 4. 启动开发服务器
php -S localhost:8000

# 5. 打开浏览器
# http://localhost:8000
```

### Docker（推荐生产环境）

```bash
docker build -t vnfest .
docker run -d -p 8080:80 -v $(pwd)/data:/var/www/html/data vnfest
```

### 打包移动端 / 桌面端

```bash
# Android APK (Capacitor)
npm run build:apk

# Windows EXE (Electron)
npm run build:exe
```

---

## ✦ 角色与权限

系统内置 **5 级角色**，从游客到超级管理员逐级递进：

```
  visitor (0)  ──→  member (1)  ──→  manager (2)  ──→  representative (3)
                                                                │
                                                         super_admin (4)
                                                      (全局审核 + 系统管理)
```

<details>
<summary><b>📋 完整权限矩阵（点击展开）</b></summary>
<br>

| 操作 | visitor | member | manager | rep | super |
|------|:---:|:---:|:---:|:---:|:---:|
| 浏览地图 / 搜索社团 | ● | ● | ● | ● | ● |
| 注册 / 登录 / OAuth | ● | ● | ● | ● | ● |
| 申请加入社团 | ● | ● | — | — | — |
| 查看内部联系方式 (QQ等) | — | ● | ● | ● | ● |
| 查看社团成员列表 | — | ● | ● | ● | ● |
| 活动报名 / 取消 | — | ● | ● | ● | ● |
| 审核成员申请 | — | — | ● | ● | ● |
| 编辑社团信息 | — | — | ● | ● | ● |
| 生成 / 撤销绑定码 | — | — | ● | ● | ● |
| 编辑 Wiki 页面 | — | — | ● | ● | ● |
| 管理推荐榜 | — | — | ● | ● | ● |
| 管理留言板 | — | — | ● | ● | ● |
| 发布活动 / 刊物 | — | — | ● | ● | ● |
| 转让社团负责人 | — | — | — | ● | ● |
| 提交 GalOnly 出展 | — | — | — | ● | ● |
| 全局审核审批 | — | — | — | — | ● |
| 全局管理所有社团 | — | — | — | — | ● |
| 发布全局公告 | — | — | — | — | ● |
| 管理反馈建议 | — | — | — | — | ● |

</details>

---

## ✦ 系统架构

```
                         ┌──────────────────────┐
                         │     index.html        │
                         │     SPA 主入口         │
                         │  (Vanilla JS + D3.js) │
                         └──────────┬───────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
  ┌──────────────┐        ┌──────────────┐        ┌──────────────────┐
  │   china.js   │        │   japan.js   │        │   calendar.js    │
  │  中国34省地图  │        │  日本47都道府県 │        │  活动日历          │
  │  D3 GeoJSON  │        │  D3 GeoJSON  │        │  月历 + 列表       │
  └──────┬───────┘        └──────┬───────┘        └────────┬─────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌──────────┐
              │ app.js  │  │app-core │  │  i18n   │
              │ 主逻辑   │  │公共工具  │  │~200 翻译键│
              └────┬────┘  └─────────┘  └──────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
 ┌───────┐   ┌─────────┐   ┌──────────┐
 │  API  │   │  Auth   │   │   Data   │
 │ 20 个  │   │Session  │   │  JSON    │
 │ PHP   │   │OAuth2   │   │  SQLite  │
 │ 接口  │   │bcrypt   │   │  上传文件  │
 └───────┘   └─────────┘   └──────────┘
```

<details>
<summary><b>🔍 数据流详解（点击展开）</b></summary>
<br>

**页面加载**
1. `index.html` 加载 → 初始化 `app-core.js` (CONFIG + Utils)
2. 检测 `country` 参数 → 加载 `china.js` 或 `japan.js`
3. `fetch('api/clubs.php')` → 全量社团数据 → 内存索引
4. D3.js 绑定 SVG 地图 → `click` → `mouseover` → 钻取

**社团详情**
1. 点击社团卡片 → `openClubDetail(clubId, country)`
2. Modal 加载：基本信息 + 成员列表 + 推荐榜 + 留言板 + Wiki 链接
3. 权限检查：`canManageClubInCountry()` → 显示/隐藏管理按钮

**数据写入**
1. 前端表单 → `POST api/*.php` → PHP `$_SESSION` 认证
2. `requireAdmin()` / `canManageClubInCountry()` 权限校验
3. JSON 文件写入 (`file_put_contents` + `LOCK_EX`)
4. 需要时同步更新 SQLite (membership / codes)

</details>

---

## ✦ 项目结构

```
VNFest/
│
├── index.html                       # 🏠 SPA 主入口 — 地图、搜索、列表
├── feedback.html                    # 📋 用户反馈建议提交页
│
├── admin/                           # 👑 管理后台 (独立页面)
│   ├── club_manager.html            #   社团管理面板 (VN 暗色主题)
│   ├── wiki_editor.html             #   Wiki 可视化编辑器
│   ├── reviews.html                 #   审核中心 (成员/活动/刊物/GalOnly/反馈)
│   ├── events.php                   #   活动审批
│   ├── Galonly_audit.html           #   GalOnly 出展投票审批
│   └── submissions_event.html       #   活动提交审核
│
├── api/                             # 📡 REST API (PHP, 20 个接口)
│   ├── auth.php                     #   认证 — 注册(邮箱验证) / 登录 / OAuth2
│   ├── clubs.php                    #   中国同好会 CRUD
│   ├── clubs_japan.php              #   日本同好会 CRUD
│   ├── membership.php               #   社团成员 — 申请 / 审核 / 角色 / 退出
│   ├── events.php                   #   活动 — 创建 / 列表 / 报名 / 去重
│   ├── publications.php             #   刊物 — CRUD + 状态追踪
│   ├── manuscripts.php              #   稿件 — 附属刊物的投稿管理
│   ├── galonly.php                  #   GalOnly — 申请 / 投票 / 审核
│   ├── bangumi_proxy.php            #   Bangumi API 缓存代理
│   ├── club_codes.php               #   绑定码 — 生成 / 使用 / 撤销
│   ├── club_comments.php            #   留言板 — CRUD
│   ├── club_recommendations.php     #   推荐榜 — Bangumi 搜索 + 管理
│   ├── announcements.php            #   公告 — 发布 / 列表
│   ├── notifications.php            #   通知 — 推送 / 已读
│   ├── avatar.php                   #   用户头像 — 上传 / Cropper
│   ├── club_avatar.php              #   社团头像 — 上传 / 中日分区
│   ├── wiki.php                     #   Wiki — 编辑 / 生成 / 图片上传
│   ├── feedback.php                 #   反馈 — 提交 / 管理
│   ├── submit.php                   #   同好会提交
│   ├── submit_event.php             #   活动提交
│   └── submit_publication.php       #   刊物提交
│
├── includes/                        # 📚 PHP 核心库
│   ├── auth.php                     #   角色权限 + canManageClubInCountry()
│   ├── db.php                       #   PDO 封装 (SQLite / MySQL 双驱动)
│   ├── oauth_qq.php                 #   QQ 互联 OAuth2
│   ├── oauth_discord.php            #   Discord OAuth2
│   ├── notifications.php            #   通知系统
│   ├── audit.php                    #   审核逻辑
│   └── rate_limit.php               #   频率限制
│
├── js/                              # 🎨 前端 JavaScript (Vanilla, ES6+)
│   ├── app.js                       #   主逻辑 — 渲染 / 事件 / i18n (~200 键)
│   ├── app-core.js                  #   公共模块 — CONFIG / Utils / 路径解析
│   ├── calendar.js                  #   活动日历 — 月历 / 列表 / 报名
│   ├── china.js                     #   中国 34 省 SVG GeoJSON Path
│   └── japan.js                     #   日本 47 都道府県 SVG GeoJSON Path
│
├── css/
│   └── styles.css                   #   全局样式 — 玻璃拟态 + 暗色/亮色主题
│
├── wiki/                            # 📚 同好会维基子系统
│   ├── index.html                   #   Wiki 索引页 (渐进增强架构)
│   ├── wiki.css                     #   Wikipedia 风格样式表
│   ├── index.json                   #   页面清单 (PHP API 自动维护)
│   ├── feature-slots.json           #   8 个扩展位预留
│   ├── content/                     #   各校 Wiki 内容源 (JSON)
│   │   ├── china-26.json            #     西北民族大学
│   │   ├── china-79.json            #     华中科技大学
│   │   ├── china-94.json            #     江苏大学
│   │   ├── china-114.json           #     盐城工学院
│   │   └── china-117.json           #     淮安大学
│   ├── pages/                       #   生成的静态 Wiki 页面
│   ├── library/                     #   文档库
│   │   ├── index.json               #     文档索引
│   │   └── wiki-writing-guide.html  #     编写说明
│   └── uploads/                     #   用户上传图片 (gitignored)
│
├── data/                            # 💾 数据存储
│   ├── clubs.json                   #   中国同好会数据 (gitignored)
│   ├── clubs_japan.json             #   日本同好会数据 (gitignored)
│   ├── events.json                  #   活动数据
│   ├── publications.json            #   刊物数据
│   ├── submissions*.json            #   提交数据 (gitignored)
│   ├── avatars/                     #   用户头像上传
│   ├── club_avatars/                #   社团头像上传
│   └── event_images/                #   活动图片上传
│
├── Galgame_events/                  # 🎟️ GalOnly 专属页面
│   ├── galgameonly_list.html        #   出展社团列表
│   └── Shanghai_Galonly_submit.html #   上海 GalOnly 参展申请
│
├── scripts/                         # 🔧 工具脚本
│   ├── migrate.php                  #   数据库迁移
│   ├── build-apk.mjs                #   Android APK 打包
│   ├── build-exe.mjs                #   Windows EXE 打包
│   ├── frontend-paths.mjs           #   路径重写 (共享模块)
│   ├── generate-wiki-pages.mjs      #   Wiki 页面批量生成
│   ├── health-check.mjs             #   系统健康检查
│   ├── set_contact_visibility.php   #   联系方式可见性批量设置
│   └── test-*.mjs                   #   测试套件 (6 个)
│
├── .gitignore                       #   Git 忽略规则
├── config.example.php               #   配置文件模板
├── package.json                     #   Node.js 构建配置
├── LICENSE                          #   GPLv3
└── README.md                        #   📄 本文件
```

---

## ✦ API 参考

### 认证与用户

| Endpoint | Method | Auth | 说明 |
|----------|:------:|:----:|------|
| `api/auth.php?action=register_local` | POST | — | 邮箱注册 (需验证码) |
| `api/auth.php?action=send_register_code` | POST | — | 发送邮箱验证码 (6位/5分钟) |
| `api/auth.php?action=login` | POST | — | 账号密码登录 |
| `api/auth.php?action=qq_login` | GET | — | QQ OAuth2 回调 |
| `api/auth.php?action=discord_login` | GET | — | Discord OAuth2 回调 |
| `api/auth.php?action=me` | GET | Session | 当前用户信息 |
| `api/avatar.php` | POST | Session | 头像上传 + 裁剪 |

### 社团与成员

| Endpoint | Method | Auth | 说明 |
|----------|:------:|:----:|------|
| `api/clubs.php` | GET | — | 中国同好会列表 |
| `api/clubs_japan.php` | GET | — | 日本同好会リスト |
| `api/membership.php?action=apply` | POST | Session | 申请加入社团 |
| `api/membership.php?action=review` | POST | Manager+ | 审核成员申请 |
| `api/membership.php?action=list` | GET | Member+ | 查看成员列表 |
| `api/club_codes.php?action=generate` | POST | Manager+ | 生成绑定码 |
| `api/club_codes.php?action=redeem` | POST | Session | 使用绑定码加入 |
| `api/club_avatar.php` | POST | Manager+ | 社团头像上传 |
| `api/club_comments.php` | CRUD | Member+ | 留言板 |
| `api/club_recommendations.php` | CRUD | Manager+ | 推荐榜管理 |

### 活动 · 刊物 · GalOnly

| Endpoint | Method | Auth | 说明 |
|----------|:------:|:----:|------|
| `api/events.php?action=list` | GET | — | 活动列表 |
| `api/events.php?action=add` | POST | Admin | 创建活动 (去重+锁) |
| `api/events.php?action=register` | POST | Session | 活动报名/取消 |
| `api/publications.php` | CRUD | Manager+ | 刊物管理 |
| `api/manuscripts.php` | CRUD | Manager+ | 稿件管理 |
| `api/galonly.php?action=apply` | POST | Rep+ | 出展申请 |
| `api/galonly.php?action=vote` | POST | Admin | 投票审批 |
| `api/bangumi_proxy.php` | GET | — | Bangumi 搜索代理 |

### Wiki · 反馈 · 通知

| Endpoint | Method | Auth | 说明 |
|----------|:------:|:----:|------|
| `api/wiki.php?action=get&club_key=china-XX` | GET | Manager+ | 获取 Wiki 内容 |
| `api/wiki.php?action=save` | POST | Manager+ | 保存 + 生成页面 + 重建索引 |
| `api/wiki.php?action=upload` | POST | Manager+ | Wiki 图片上传 |
| `api/feedback.php?action=submit` | POST | Session | 提交反馈 |
| `api/feedback.php?action=save` | POST | Admin | 管理反馈状态 |
| `api/announcements.php` | CRUD | Admin | 公告管理 |
| `api/notifications.php` | GET/POST | Session | 通知推送/已读 |

---

## ✦ 技术栈

<table>
<tr>
<td width="33%">

### 🖥️ 前端
```
Vanilla JavaScript (ES6+)
    │
    ├── D3.js v7.9
    │   ├── SVG GeoJSON 地图
    │   ├── geoMercator 投影
    │   └── 日历热力图
    │
    ├── CSS Custom Properties
    │   ├── 深色/亮色主题
    │   ├── 玻璃拟态面板
    │   └── 响应式布局
    │
    ├── Cropper.js
    │   └── 头像裁剪
    │
    └── Zero Dependencies
        └── 无框架，纯手写
```

</td>
<td width="33%">

### ⚙️ 后端
```
PHP 8.x (零框架)
    │
    ├── PDO 数据库抽象
    │   ├── SQLite (默认)
    │   └── MySQL (可选)
    │
    ├── 认证
    │   ├── PHP Session
    │   ├── bcrypt (cost=12)
    │   └── QQ / Discord OAuth2
    │
    ├── 图片处理
    │   └── GD Library
    │
    └── 邮件
        └── PHP mail() / SMTP
```

</td>
<td width="33%">

### 📦 打包与部署
```
桌面端 / 移动端
    │
    ├── Capacitor
    │   └── Android APK
    │
    ├── Electron
    │   └── Windows EXE
    │
    ├── Docker
    │   └── Apache + PHP-FPM
    │
    └── 传统部署
        └── Apache mod_rewrite
```

</td>
</tr>
</table>

| 分类 | 选型 | 备注 |
|------|------|------|
| 语言 | PHP 8.x + JavaScript ES6+ | 零框架，零构建步骤 |
| 数据库 | SQLite 3.x (默认) / MySQL 5.7+ | PDO 双驱动，无缝切换 |
| 地图 | D3.js v7 + SVG GeoJSON | Mercator 投影，交互式钻取 |
| 认证 | Session + QQ OAuth2 + Discord OAuth2 | bcrypt cost=12 |
| 图片 | Cropper.js (前端) + GD (后端) | 头像/社团图/活动图 |
| 邮件 | PHP mail() / SMTP | 验证码发送 |
| 移动端 | Capacitor 5.x | Android APK |
| 桌面端 | Electron 28.x | Windows EXE (thin-client) |
| 容器 | Docker + Apache 2.4 | PHP-FPM |
| 许可 | GPLv3 | 自由使用，保留署名 |

---

## ✦ 部署指南

### 方案一：Apache 生产部署

```bash
# 1. 上传文件到服务器
rsync -av --exclude 'data/uploads' --exclude '.git' ./ user@host:/var/www/vnfest/

# 2. 配置 Apache VirtualHost
<VirtualHost *:80>
    ServerName map.vnfest.top
    DocumentRoot /var/www/vnfest
    <Directory /var/www/vnfest>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    # PHP 8.x
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/run/php/php8.2-fpm.sock|fcgi://localhost"
    </FilesMatch>
</VirtualHost>

# 3. 创建配置
cp config.example.php config.php
nano config.php  # 填写数据库路径、OAuth 密钥、SMTP 等

# 4. 设置权限
chmod -R 755 /var/www/vnfest
chmod -R 777 /var/www/vnfest/data
chmod -R 777 /var/www/vnfest/wiki/uploads
```

### 方案二：Docker

```dockerfile
FROM php:8.2-apache
RUN apt-get update && apt-get install -y \
    libsqlite3-dev libpng-dev libjpeg-dev libwebp-dev \
    && docker-php-ext-install pdo pdo_sqlite gd
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html/data
RUN chown -R www-data:www-data /var/www/html/wiki/uploads
```

```bash
docker build -t vnfest .
docker run -d -p 80:80 \
  -v $(pwd)/data:/var/www/html/data \
  -v $(pwd)/config.php:/var/www/html/config.php \
  vnfest
```

### 方案三：开发模式

```bash
# 最简单的方式，无需 Apache/Nginx
php -S 0.0.0.0:8000

# 访问 http://localhost:8000
```

---

## ✦ 更新日志

<details open>
<summary><b>v1.6.3</b> — Wiki 子系统与平台增强 · <code>2026-05-15</code></summary>
<br>

**🆕 Wiki 子系统（全新）**
- Wiki 可视化编辑器 (`admin/wiki_editor.html`)：信息框 / 章节 / 图片 / 参考资料
- 图片宽高比控制：6 档可选 (16:10 / 16:9 / 4:3 / 1:1 / 3:4 / 自由)
- 动态索引页 (`wiki/index.html`)：渐进增强架构，按国家→地区分组，搜索过滤
- PHP 内容管线 (`api/wiki.php`)：校验 → 存储 → 生成 HTML → 重建 index
- 5 所高校已填写 Wiki 内容，文档库上线

**🔐 安全增强**
- 注册邮箱验证码：6 位数字，5 分钟过期，已用标记
- `.gitignore` 加固：排除核心同好会数据、验证码、反馈数据、Wiki 上传图片
- Git 解除追踪 5 个含隐私数据文件

**📋 反馈系统**
- 用户反馈提交页 (`feedback.html`)
- 管理后台反馈处理标签页 (`admin/reviews.html`)

**🔧 架构增强**
- `canManageClubInCountry()` 中日分区权限管理
- 事件去重：服务端 ID 生成 + `flock` 文件锁
- 构建脚本重构：共享路径重写模块 (`frontend-paths.mjs`)
- 公共模块提取：`js/app-core.js` (CONFIG + Utils)
- README.md 重新设计

</details>

<details>
<summary><b>v1.6.2</b> — 管理后台 UI 修繕</summary>
<br>

**修复**：神器榜面板 Grid 对齐 · 搜索框溢出
**优化**：推荐榜视觉调整

</details>

<details>
<summary><b>v1.6.1</b> — 地图/列表双模式与日文国际化补全</summary>
<br>

**新功能**：地图 ↔ 列表切换 · APK 打包
**日文**：~60 新增翻译键，全量覆盖
**UI**：管理后台 VN 暗色主题重设计

</details>

<details>
<summary><b>v1.6.0</b> — 同好会系统增强与通知公告</summary>
<br>

绑定码加入系统 · Bangumi 推荐榜 · 留言板 · 通知公告

</details>

<details>
<summary><b>v1.5.0</b> — 用户面板与 GalOnly 高校通道</summary>
<br>

GalOnly 7 人投票 · VN 风格账号面板 · 活动报名/取消 · 多日跨月活动

</details>

---

## ✦ 贡献指南

### 参与方式

- 🐛 **报告 Bug**：通过反馈页 (`feedback.html`) 或 GitHub Issues 提交
- 💡 **功能建议**：同上，描述使用场景和期望效果
- 📝 **Wiki 编辑**：社团管理者可直接在后台编辑本校 Wiki 页面
- 🔧 **代码贡献**：Fork → Branch → PR，保持代码风格一致

### 代码风格

- **PHP**：PSR-12，零框架，`file_put_contents` + `flock` 写 JSON
- **JavaScript**：ES6+ Vanilla，`'use strict'` 隐含，`const`/`let`，`() => {}`
- **CSS**：Custom Properties，BEM 风格命名，无预处理器

### 分支策略

```
main          ← 稳定版本，tag 标记
  ├── feat/*  ← 功能分支
  ├── fix/*   ← 修复分支
  └── chore/* ← 杂务分支
```

---

## ✦ 相关项目

| 项目 | 说明 |
|------|------|
| [china-bandori-maps](https://github.com/HELPMEEADICE/china-bandori-maps) | 原始地图数据参考，BanG Dream! 社群地图 |
| [Bangumi](https://bangumi.tv) | 游戏评分数据来源，推荐榜 API 对接 |
| [D3.js](https://d3js.org) | 数据驱动文档，地图与日历的渲染引擎 |

---

<div align="center">

<br>

```
                         ══════════════════════════════
                           Visual Novel Festival
                             視覚小説学園祭

                         世界中のギャルゲーファンを
                        つなぐ、年に一度の学園祭へ。

                            A school festival
                     connecting galgame fans across
                     China, Japan, and beyond — all year round.
                         ══════════════════════════════
```

<br>

[![VNFest](https://img.shields.io/badge/VNFest-v1.6.3-e91e63?style=for-the-badge)](https://map.vnfest.top)
[![GPLv3](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge)](LICENSE)
[![Made with ❤️](https://img.shields.io/badge/Made_with-❤️-ff69b4?style=for-the-badge)](https://github.com/kokubunshu/china-galgame-maps)

<br>

`🎌 Visual Novel Festival — 視覚小説学園祭 — Made with ❤️`

</div>
