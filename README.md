# 🗺️ 全国 Galgame / 视觉小说同好会地图

> 一个可视化的中日高校 Galgame / 视觉小说同好会分布地图，帮助同好快速找到身边的组织。

[![许可证](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-f9a03c.svg)](https://d3js.org/)

[🌐 在线访问](https://www.map.vnfest.top) | [📖 使用指南](#) | [🐛 报告问题](https://github.com/kokubunshu/china-visualnovelcircle-maps/issues)

---

## 📌 项目简介

本项目是一个可视化的**全国（含日本）Galgame / 视觉小说高校同好会分布地图**，旨在帮助同好快速找到身边的组织，促进同好会之间的交流与合作。

### ✨ 主要特性

- 🗺️ **双图切换** - 支持中国地图和日本地图，一键切换
- 🔍 **智能搜索** - 支持组织名称、群号、学校的模糊搜索
- 📂 **分类筛选** - 按「高校同好会」「地区高校联合」「视觉小说学园祭」分类查看
- 📊 **多维度排序** - 支持按成立时间、名称、类型排序
- 📅 **活动日历** - 展示同好会活动，支持管理员添加/编辑/删除
- 📖 **刊物投稿** - 展示各同好会刊物信息，支持投稿入口
- 🌐 **多语言支持** - 中文/日语双语切换
- 👑 **管理员模式** - 支持同好会/活动/刊物的增删改查
- 📱 **移动端适配** - 完美支持手机和平板访问
- 🌓 **深色模式** - 跟随系统或手动切换

---

## 🚀 快速开始

### 环境要求

- PHP 7.4 或更高版本
- Web 服务器（Apache/Nginx）
- 现代浏览器（Chrome/Firefox/Safari/Edge）

### 本地部署

```bash
# 1. 克隆项目
git clone https://github.com/kokubunshu/china-visualnovelcircle-maps.git
cd china-visualnovelcircle-maps

# 2. 复制配置文件
cp config.example.php config.php

# 3. 编辑配置（修改管理员密码）
# 打开 config.php，修改 ADMIN_TOKEN

# 4. 启动 PHP 服务器
php -S localhost:8000

# 5. 访问浏览器
# http://localhost:8000

使用 Docker
# 使用 PHP 官方镜像
docker run -d -p 8000:8000 -v "$PWD":/var/www/html php:8.2-apache

📁 项目结构
china-visualnovelcircle-maps/
├── admin/                      # 管理后台
│   ├── submissions.html        # 同好会审核
│   └── submissions_event.html  # 活动审核
├── api/                        # API 接口
│   ├── clubs.php               # 中国同好会 API
│   ├── clubs_japan.php         # 日本同好会 API
│   ├── events.php              # 活动 API
│   ├── publications.php        # 刊物 API
│   ├── submit.php              # 同好会提交 API
│   ├── submit_event.php        # 活动提交 API
│   └── test.php                # API 测试
├── assets/                     # 静态资源
├── css/                        # 样式文件
│   └── styles.css
├── data/                       # 数据存储
│   ├── clubs.json              # 中国同好会数据
│   ├── clubs_japan.json        # 日本同好会数据
│   ├── events.json             # 活动数据
│   ├── publications.json       # 刊物数据
│   ├── submissions.json        # 同好会提交（待审核）
│   └── submissions_event.json  # 活动提交（待审核）
├── images/                     # 图片资源
│   ├── VNF.png
│   └── qrcode.webp
├── js/                         # JavaScript 文件
│   ├── app.js                  # 核心逻辑
│   ├── calendar.js             # 日历模块
│   ├── china.js                # 中国地图库
│   ├── japan.js                # 日本地图库
│   └── asia.js                 # 亚洲地图库
├── .env.example                # 环境变量模板
├── .gitignore                  # Git 忽略规则
├── .htaccess                   # Apache 配置
├── .user.ini                   # PHP 配置
├── config.example.php          # 配置模板
├── index.html                  # 主页面
├── submit.html                 # 同好会提交页面
├── submit_event.html           # 活动提交页面
├── LICENSE                     # GPLv3 许可证
└── README.md                   # 项目说明

📖 使用指南
普通用户
浏览地图 - 点击省份/县查看同好会列表

搜索筛选 - 使用搜索框和筛选器快速定位

查看详情 - 点击同好会查看联系方式、简介等信息

提交信息 - 通过「提交同好会信息」添加新组织

添加活动 - 通过「添加活动信息」分享活动

查看日历 - 查看各同好会活动安排

刊物投稿 - 查看同好会刊物和投稿信息

管理员
开启开发者模式 - 连续点击「重置」按钮 6 次

进入管理员模式 - 点击右下角 👑 按钮，输入密码

添加/编辑/删除 - 可直接在地图上编辑同好会信息

审核提交 - 访问 /admin/submissions.html 审核同好会

审核活动 - 访问 /admin/submissions_event.html 审核活动

管理刊物 - 在管理员模式下添加刊物信息

🔧 配置说明
管理员密码
编辑 config.php 文件：

php
<?php
define('ADMIN_TOKEN', 'your_secure_password_here');
?>
文件权限
bash
# 设置 JSON 数据文件可写
chmod 666 data/*.json
📡 API 文档
端点	方法	说明
/api/clubs.php	GET	获取中国同好会
/api/clubs_japan.php	GET	获取日本同好会
/api/events.php	GET/POST	获取/保存活动
/api/publications.php	GET/POST/PUT/DELETE	刊物 CRUD
/api/submit.php	POST	提交同好会
/api/submit_event.php	POST	提交活动
所有 POST/PUT/DELETE 请求需要 X-Admin-Token 头。

🛠️ 技术栈
技术	用途
HTML5 / CSS3	页面结构与样式
JavaScript (ES6+)	核心交互逻辑
D3.js v7	地图绘制与交互
PHP 7.4+	后端 API
JSON	数据存储
📊 数据统计
地区	同好会数量
中国	220+
日本	26+
活动	持续更新
刊物	持续更新
🤝 贡献指南
欢迎提交 Issue 和 Pull Request！

如何贡献
Fork 本项目

创建功能分支 (git checkout -b feature/AmazingFeature)

提交更改 (git commit -m 'Add some AmazingFeature')

推送到分支 (git push origin feature/AmazingFeature)

开启 Pull Request

📄 许可证
本项目基于 GPLv3 许可证开源。

text
Copyright (C) 2024-2025 Galgame Map Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
🙏 致谢
地图数据来源于 china-bandori-maps

基于 D3.js 可视化库

感谢所有提交信息的同好会成员

📞 联系方式
项目主页：https://www.map.vnfest.top

反馈群：扫码加入（网站首页）

GitHub：kokubunshu/china-visualnovelcircle-maps

Made with ❤️ for Galgame Community

text

## 使用方法

1. 将上面的内容复制
2. 在项目根目录打开 `README.md` 文件
3. 粘贴替换原有内容
4. 保存

## 推送更新

```bash
git add README.md
git commit -m "docs: 更新 README.md"
git push origin main:master
