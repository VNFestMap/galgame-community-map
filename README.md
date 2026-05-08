<div align="center">

# 🗺️ 全国 Galgame 同好会地图

### 中日高校视觉小说同好会 · 可视化地图导航

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg)](https://developer.mozilla.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-f9a03c.svg)](https://d3js.org/)

**[🌐 在线访问](https://www.map.vnfest.top)** &nbsp;|&nbsp;
**[📖 使用指南](#)** &nbsp;|&nbsp;
**[🐛 报告问题](https://github.com/kokubunshu/china-visualnovelcircle-maps/issues)**

</div>

---

## ✨ 功能特点

<table align="center">
<tr>
<td width="50%">

### 🗺️ 地图相关
- 中国/日本地图一键切换
- 点击省份/县查看同好会
- 地图缩放拖拽
- 数字徽章显示数量

</td>
<td width="50%">

### 🔍 搜索筛选
- 组织名/群号搜索
- 高校同好会/地区联合筛选
- 按成立时间排序
- 按名称/类型排序

</td>
</tr>
<tr>
<td width="50%">

### 📅 内容管理
- 活动日历展示
- 刊物投稿信息
- 中日双语切换
- 深色/浅色主题

</td>
<td width="50%">

### 👑 管理员
- 同好会增删改查
- 活动审核管理
- 刊物信息管理
- 提交审核后台

</td>
</tr>
</table>

---

## 🚀 快速开始

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/kokubunshu/china-visualnovelcircle-maps.git
cd china-visualnovelcircle-maps

# 2. 复制配置文件
cp config.example.php config.php

# 3. 启动服务
php -S localhost:8000
```

### 访问地址

- 主页：http://localhost:8000
- 同好会提交：http://localhost:8000/submit.html
- 活动提交：http://localhost:8000/submit_event.html
- 审核后台：http://localhost:8000/admin/submissions.html

---

## 📁 目录结构

```
china-visualnovelcircle-maps/
├── 📁 admin/          # 管理后台
├── 📁 api/            # API 接口
├── 📁 css/            # 样式文件
├── 📁 data/           # JSON 数据
├── 📁 images/         # 图片资源
├── 📁 js/             # JavaScript
├── 📄 index.html      # 主页面
├── 📄 submit.html     # 提交同好会
└── 📄 submit_event.html # 提交活动
```

---

## 📖 使用说明

### 普通用户

1. 打开网站，默认显示中国地图
2. 点击任意省份，右侧显示同好会列表
3. 使用搜索框搜索组织名称或群号
4. 点击「日本」按钮切换到日本地图
5. 点击「活动日历」查看活动
6. 点击「刊物投稿」查看刊物

### 管理员

1. 连续点击「重置」按钮 6 次，开启开发者模式
2. 点击右下角 👑 按钮，输入密码
3. 进入管理员模式后，可编辑同好会
4. 访问 `/admin/submissions.html` 审核提交
5. 访问 `/admin/submissions_event.html` 审核活动

---

## 📡 API 文档

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/clubs.php` | GET | 获取中国同好会 |
| `/api/clubs_japan.php` | GET | 获取日本同好会 |
| `/api/events.php` | GET/POST | 活动管理 |
| `/api/publications.php` | CRUD | 刊物管理 |
| `/api/submit.php` | POST | 提交同好会 |
| `/api/submit_event.php` | POST | 提交活动 |

> 管理操作需携带 `X-Admin-Token` 头

---

## 🛠️ 技术栈

<p align="center">
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" />
<img src="https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white" />
</p>

---

## 📊 数据统计

| 地区 | 同好会数量 |
|------|-----------|
| 🇨🇳 中国 | 220+ |
| 🇯🇵 日本 | 26+ |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

```bash
git checkout -b feature/xxx
git commit -m "add feature xxx"
git push origin feature/xxx
```

---

## 📄 许可证

本项目基于 **GPLv3** 协议开源。

```
Copyright © 2024-2025 Galgame Map Contributors
```

---

## 🙏 致谢

- 地图数据：[china-bandori-maps](https://github.com/HELPMEEADICE/china-bandori-maps)
- 地图库：[D3.js](https://d3js.org/)

---

<div align="center">

**Made with ❤️ for Galgame Community**

</div>
