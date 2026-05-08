# 🗺️ 全国 Galgame 同好会地图

> 一个可视化展示中国和日本高校 Galgame / 视觉小说同好会分布的地图网站

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg)](https://developer.mozilla.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-f9a03c.svg)](https://d3js.org/)

**在线访问：** [https://www.map.vnfest.top](https://www.map.vnfest.top)

---

## 📌 项目简介

本项目是一个可视化地图，用于展示中国各省、日本各县的 Galgame / 视觉小说高校同好会组织信息，帮助同好快速找到身边的组织。

## ✨ 主要功能

| 功能 | 说明 |
|------|------|
| 中国地图 | 点击省份查看该地区同好会列表 |
| 日本地图 | 点击都道府县查看该地区同好会列表 |
| 双图切换 | 中国/日本地图一键切换 |
| 搜索筛选 | 支持组织名称、群号、学校搜索 |
| 类型分类 | 高校同好会 / 地区联合 / 学园祭 |
| 活动日历 | 查看和添加同好会活动 |
| 刊物投稿 | 查看同好会刊物信息 |
| 中日双语 | 界面支持中文和日语切换 |
| 深色模式 | 支持浅色/深色主题切换 |
| 管理员模式 | 同好会/活动/刊物的增删改查 |
| 移动端适配 | 支持手机和平板访问 |

---

## 🚀 快速开始

### 环境要求

- PHP 7.4 或更高版本
- Web 服务器（Apache/Nginx）
- 现代浏览器

### 本地安装

```bash
# 1. 克隆项目
git clone https://github.com/kokubunshu/china-visualnovelcircle-maps.git
cd china-visualnovelcircle-maps

# 2. 复制配置文件
cp config.example.php config.php

# 3. 修改管理员密码（编辑 config.php）
vim config.php

# 4. 设置数据文件权限
chmod 666 data/*.json

# 5. 启动 PHP 内置服务器
php -S localhost:8000
浏览器访问 http://localhost:8000 即可。

📁 目录结构
text
china-visualnovelcircle-maps/
│
├── admin/                    # 管理后台
│   ├── submissions.html      # 同好会审核
│   └── submissions_event.html # 活动审核
│
├── api/                      # API 接口
│   ├── clubs.php             # 中国同好会 API
│   ├── clubs_japan.php       # 日本同好会 API
│   ├── events.php            # 活动 API
│   ├── publications.php      # 刊物 API
│   ├── submit.php            # 同好会提交 API
│   └── submit_event.php      # 活动提交 API
│
├── css/                      # 样式文件
│   └── styles.css
│
├── data/                     # 数据存储（JSON）
│   ├── clubs.json            # 中国同好会数据
│   ├── clubs_japan.json      # 日本同好会数据
│   ├── events.json           # 活动数据
│   ├── publications.json     # 刊物数据
│   ├── submissions.json      # 同好会提交（待审核）
│   └── submissions_event.json # 活动提交（待审核）
│
├── images/                   # 图片资源
│   ├── VNF.png
│   └── qrcode.webp
│
├── js/                       # JavaScript 文件
│   ├── app.js                # 核心逻辑
│   ├── calendar.js           # 日历模块
│   ├── china.js              # 中国地图库
│   ├── japan.js              # 日本地图库
│   └── asia.js               # 亚洲地图库
│
├── index.html                # 主页面
├── submit.html               # 同好会提交页面
├── submit_event.html         # 活动提交页面
├── config.example.php        # 配置模板
├── .env.example              # 环境变量模板
├── .gitignore                # Git 忽略配置
├── LICENSE                   # GPLv3 许可证
└── README.md                 # 项目说明
📖 使用指南
普通用户
打开网站，默认显示中国地图

点击任意省份，右侧显示该地区同好会列表

使用搜索框搜索组织名称或群号

使用筛选器按类型查看

点击「日本」按钮切换日本地图

点击「活动日历」查看同好会活动

点击「刊物投稿」查看刊物信息

点击「提交同好会信息」添加新组织

点击「添加活动信息」分享活动

管理员
连续点击地图右下角「重置」按钮 6 次，开启开发者模式

点击右下角 👑 按钮，输入管理员密码

进入管理员模式后，可在地图上直接编辑同好会

访问 /admin/submissions.html 审核用户提交的同好会

访问 /admin/submissions_event.html 审核用户提交的活动

在管理员模式下可添加/编辑/删除刊物

📡 API 接口
接口	方法	说明
/api/clubs.php	GET	获取所有中国同好会
/api/clubs_japan.php	GET	获取所有日本同好会
/api/events.php	GET	获取所有活动
/api/events.php	POST	保存活动（需管理员）
/api/publications.php	GET	获取所有刊物
/api/publications.php	POST	添加刊物（需管理员）
/api/publications.php	PUT	更新刊物（需管理员）
/api/publications.php	DELETE	删除刊物（需管理员）
/api/submit.php	POST	提交同好会申请
/api/submit_event.php	POST	提交活动申请
管理员 API 需要在请求头中添加 X-Admin-Token: your_password

🛠️ 技术栈
前端： HTML5、CSS3、JavaScript (ES6+)

地图库： D3.js v7

后端： PHP 7.4+

数据存储： JSON 文件

📊 数据统计
项目	数量
中国同好会	220+
日本同好会	26+
活动数量	持续更新
刊物数量	持续更新
📄 许可证
本项目基于 GNU General Public License v3.0 开源协议。

text
Copyright (C) 2024-2025 Galgame Map Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
🙏 致谢
地图数据基于 china-bandori-maps

可视化库 D3.js

感谢所有提交和贡献的同好会成员

📞 联系方式
项目主页：https://www.map.vnfest.top

GitHub：https://github.com/kokubunshu/china-visualnovelcircle-maps

反馈群：扫描网站首页二维码

Made with ❤️ for Galgame Community
