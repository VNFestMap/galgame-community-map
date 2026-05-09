<div align="center">

# 🗺️ 全国 Galgame 同好会地图

### 中日高校视觉小说同好会 · 可视化地图导航

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg)](https://developer.mozilla.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-f9a03c.svg)](https://d3js.org/)

**🌐 [map.vnfest.top](https://www.map.vnfest.top)**

</div>

---

## 简介

全国 Galgame 同好会地图是一个面向中日高校视觉小说同好会的交互式导航平台。通过中国省份地图和日本都道府县地图，直观展示各地同好会的分布情况，提供搜索、筛选、活动日历、刊物管理等综合功能。

---

## 功能

**🗺️ 地图导航**
- 中国/日本地图一键切换，省份/都道府县点击查看
- D3.js 矢量渲染，支持缩放拖拽
- 数字徽章显示各地同好会数量

**🔍 搜索筛选**
- 组织名/群号搜索
- 高校同好会 / 地区联合 / VNFest 类型筛选
- 按名称、注册时间等多种排序

**👤 用户系统**
- 用户名/密码注册登录（bcrypt 加密）
- QQ 互联 / Discord OAuth2 登录
- 邮箱绑定与验证
- 个人头像上传（Cropper.js）

**🎪 同好会管理**
- 同好会详情与成员列表
- 成员申请与审核流程
- 角色体系：成员 → 管理员 → 负责人
- 联系方式可见性控制

**📅 活动日历**
- 月历视图展示活动
- 活动详情弹窗（海报、简介、链接）
- 管理员增删改

**📖 刊物管理**
- 状态追踪：写作中 / 规划中 / 编辑中 / 发布中 / 已完成
- 封面图上传，投稿联系方式

**📝 提交系统**
- 同好会信息提交
- 活动信息提交
- 刊物投稿提交

**👑 管理后台**
- 同好会增删改查（超级管理员）
- 提交审核（同好会 / 活动 / 刊物）
- 成员管理（审核、角色变更、踢出）
- 数据统计面板

**🎨 界面**
- 深色/浅色主题（跟随系统）
- 多主题配色（红/蓝/绿/紫/橙）
- 中日双语切换
- 移动端适配

---

## 快速开始

### 环境要求

- PHP 8.0+
- SQLite（默认）或 MySQL
- Apache（mod_rewrite）或 Nginx
- QQ 互联 / Discord 开发者账号（OAuth 可选）

### 安装

```bash
# 1. 克隆项目
git clone https://github.com/kokubunshu/china-galgame-maps.git
cd china-galgame-maps

# 2. 配置环境
cp config.example.php config.php
# 编辑 config.php 填写数据库、OAuth 等配置

# 3. 初始化数据库
php scripts/migrate.php

# 4. 启动开发服务器
php -S localhost:8000
```

### 访问地址

| 页面 | 地址 |
|------|------|
| 主页 | `http://localhost:8000` |
| 同好会提交 | `submit.html` |
| 活动提交 | `submit_event.html` |
| 刊物投稿 | `submit_publication.html` |
| 审核后台 | `admin/reviews.html` |
| 同好会管理 | `admin/club_manager.html` |

---

## 目录结构

```
├── admin/              # 管理后台页面
│   ├── club_manager.html      # 同好会管理面板
│   ├── reviews.html           # 审核中心
│   ├── events.php             # 活动审核
│   ├── submissions.html       # 同好会提交审核
│   └── submissions_event.html # 活动提交审核
├── api/                # API 接口
│   ├── auth.php               # 用户认证（登录/注册/OAuth）
│   ├── clubs.php              # 中国同好会 CRUD
│   ├── clubs_japan.php        # 日本同好会 CRUD
│   ├── membership.php         # 成员管理
│   ├── events.php             # 活动管理
│   ├── publications.php       # 刊物管理
│   ├── avatar.php             # 头像上传
│   ├── submit.php             # 同好会提交
│   ├── submit_event.php       # 活动提交
│   └── submit_publication.php # 刊物投稿
├── css/
│   └── styles.css             # 全局样式
├── data/               # 数据文件
│   ├── clubs.json             # 中国同好会数据
│   ├── clubs_japan.json       # 日本同好会数据
│   ├── events.json            # 活动数据
│   ├── publications.json      # 刊物数据
│   ├── submissions.json       # 待审核提交
│   └── galgame.db             # SQLite 数据库
├── images/             # 图片资源
├── includes/           # PHP 核心库
│   ├── auth.php               # 认证与角色管理
│   ├── db.php                 # 数据库连接（SQLite + MySQL）
│   ├── oauth_qq.php           # QQ OAuth2
│   ├── oauth_discord.php      # Discord OAuth2
│   ├── audit.php              # 审计日志
│   └── rate_limit.php         # 频率限制
├── js/                 # 前端脚本
│   ├── app.js                 # 主应用逻辑
│   ├── calendar.js            # 活动日历
│   ├── china.js               # 中国地图 GeoJSON
│   └── japan.js               # 日本地图 GeoJSON
├── scripts/            # 命令行工具
│   ├── migrate.php            # 数据库迁移
│   └── seed_superadmin.php    # 创建超级管理员
├── index.html          # 主页面
├── submit.html         # 同好会提交页
├── submit_event.html   # 活动提交页
└── submit_publication.html # 刊物投稿页
```

---

## API 概览

| 端点 | 方法 | 说明 |
|------|------|------|
| `api/clubs.php` | GET | 获取中国同好会列表 |
| `api/clubs_japan.php` | GET | 获取日本同好会列表 |
| `api/events.php` | GET/POST | 活动读取/管理 |
| `api/publications.php` | GET/POST/PUT/DELETE | 刊物 CRUD |
| `api/auth.php` | GET/POST | 认证（含 OAuth） |
| `api/membership.php` | GET/POST | 成员申请/审核 |
| `api/submit.php` | POST | 提交同好会 |
| `api/toggle_visibility.php` | POST | 切换可见性 |

> 管理操作需要对应角色权限（super_admin / representative / manager）。

---

## 角色体系

| 角色 | 级别 | 说明 |
|------|------|------|
| visitor | 0 | 注册用户 |
| member | 1 | 同好会成员 |
| manager | 2 | 管理员（审核成员、编辑信息） |
| representative | 3 | 负责人（同好会最高权限） |
| super_admin | 4 | 超级管理员（全局管理） |

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | HTML5 / CSS3（Custom Properties）/ Vanilla JS |
| 后端 | PHP 8.x（无框架） |
| 数据库 | SQLite / MySQL（PDO） |
| 地图 | D3.js v7（SVG GeoJSON） |
| 认证 | Session + QQ OAuth2 + Discord OAuth2 |
| 密码 | bcrypt（cost 12） |
| 图片裁剪 | Cropper.js |
| 许可证 | GPLv3 |

---

## 数据统计

| 地区 | 同好会 |
|------|--------|
| 🇨🇳 中国 | 220+ |
| 🇯🇵 日本 | 26+ |
| **合计** | **246+** |

---

## 相关项目

- [china-bandori-maps](https://github.com/HELPMEEADICE/china-bandori-maps) — 原始地图数据参考

---

<div align="center">

**Made with ❤️ for Galgame Community**

</div>
