<div align="center">

# 🗺️ 全国 Galgame 同好会地图

### 中日高校视觉小说同好会 · 可视化地图导航

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg)](https://developer.mozilla.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-f9a03c.svg)](https://d3js.org/)

[**🌐 在线访问**](https://www.map.vnfest.top) &nbsp;|&nbsp;
[**📖 使用指南**](#) &nbsp;|&nbsp;
[**🐛 报告问题**](https://github.com/kokubunshu/china-visualnovelcircle-maps/issues)

</div>

---

## 📌 项目简介

> 一个可视化的**中国 + 日本**高校 Galgame / 视觉小说同好会分布地图，帮助同好快速找到身边的组织。

### ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🗺️ **双图切换** | 中国地图 / 日本地图，一键切换 |
| 🔍 **智能搜索** | 支持组织名、群号、学校模糊搜索 |
| 📂 **分类筛选** | 高校同好会 / 地区联合 / 学园祭 |
| 📅 **活动日历** | 展示活动，支持管理员增删改查 |
| 📖 **刊物投稿** | 展示同好会刊物信息 |
| 🌐 **多语言** | 中文 / 日语 双语切换 |
| 👑 **管理员模式** | 同好会/活动/刊物 完整管理 |
| 📱 **移动端** | 完美适配手机和平板 |
| 🌓 **深色模式** | 跟随系统或手动切换 |

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/kokubunshu/china-visualnovelcircle-maps.git
cd china-visualnovelcircle-maps

# 2. 复制配置文件
cp config.example.php config.php

# 3. 编辑配置文件，修改管理员密码
vim config.php

# 4. 启动 PHP 服务器
php -S localhost:8000
然后浏览器打开 http://localhost:8000 即可访问。

📁 项目结构
text
china-visualnovelcircle-maps/
├── 📁 admin/          # 管理后台
├── 📁 api/            # API 接口
├── 📁 css/            # 样式文件
├── 📁 data/           # JSON 数据存储
├── 📁 images/         # 图片资源
├── 📁 js/             # JavaScript 脚本
├── 📄 index.html      # 主页面
├── 📄 submit.html     # 同好会提交
├── 📄 submit_event.html # 活动提交
└── 📄 config.example.php # 配置模板
📡 API 端点
端点	方法	说明
/api/clubs.php	GET	获取中国同好会
/api/clubs_japan.php	GET	获取日本同好会
/api/events.php	GET/POST	获取/保存活动
/api/publications.php	GET/POST/PUT/DELETE	刊物管理
/api/submit.php	POST	提交同好会申请
/api/submit_event.php	POST	提交活动申请
POST/PUT/DELETE 请求需要携带 X-Admin-Token 头

🛠️ 技术栈
技术	用途
HTML5 / CSS3	页面结构与样式
JavaScript (ES6+)	核心交互逻辑
D3.js v7	地图绘制与交互
PHP 7.4+	后端 API
JSON	数据存储
📊 数据统计
地区	数量
🇨🇳 中国同好会	220+
🇯🇵 日本同好会	26+
📅 活动	持续更新
📖 刊物	持续更新
🤝 贡献
欢迎提交 Issue 和 Pull Request！

bash
git checkout -b feature/YourFeature
git commit -m "Add YourFeature"
git push origin feature/YourFeature
📄 许可证
本项目基于 GPLv3 许可证开源。

text
Copyright (C) 2024-2025 Galgame Map Contributors
🙏 致谢
地图数据基于 china-bandori-maps

可视化库 D3.js

<div align="center">
Made with ❤️ for Galgame Community

⬆ 回到顶部

</div> ```
