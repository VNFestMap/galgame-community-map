```markdown
# 🗺️ 全国 Galgame 同好会地图

> 可视化展示中国和日本高校 Galgame/视觉小说同好会分布的地图网站

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4.svg)](https://php.net)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg)](https://developer.mozilla.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-f9a03c.svg)](https://d3js.org/)

**在线访问：** https://www.map.vnfest.top

---

## 功能

| 功能 | 说明 |
|------|------|
| 中国地图 | 点击省份查看同好会 |
| 日本地图 | 点击都道府县查看同好会 |
| 搜索筛选 | 支持名称/群号/学校搜索 |
| 类型分类 | 高校同好会/地区联合/学园祭 |
| 活动日历 | 查看和添加活动 |
| 刊物投稿 | 查看刊物信息 |
| 中日双语 | 界面语言切换 |
| 深色模式 | 浅色/深色主题 |
| 管理员模式 | 增删改查 |
| 移动端适配 | 支持手机平板 |

---

## 快速开始

```bash
# 克隆项目
git clone https://github.com/kokubunshu/china-visualnovelcircle-maps.git
cd china-visualnovelcircle-maps

# 复制配置
cp config.example.php config.php

# 启动服务
php -S localhost:8000
```

访问 `http://localhost:8000`

---

## 目录结构

```
china-visualnovelcircle-maps/
├── admin/           管理后台
├── api/             API接口
├── css/             样式文件
├── data/            JSON数据
├── images/          图片
├── js/              JavaScript
├── index.html       主页
├── submit.html      提交同好会
└── submit_event.html 提交活动
```

---

## 管理员使用

1. 连续点击「重置」按钮 6 次
2. 点击右下角 👑 按钮
3. 输入密码（默认 ciallo）
4. 开始管理

### 审核后台

- 同好会审核：`/admin/submissions.html`
- 活动审核：`/admin/submissions_event.html`

---

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/clubs.php` | GET | 获取中国同好会 |
| `/api/clubs_japan.php` | GET | 获取日本同好会 |
| `/api/events.php` | GET/POST | 活动管理 |
| `/api/publications.php` | GET/POST/PUT/DELETE | 刊物管理 |
| `/api/submit.php` | POST | 提交同好会 |
| `/api/submit_event.php` | POST | 提交活动 |

---

## 技术栈

- HTML5 / CSS3
- JavaScript ES6+
- D3.js v7
- PHP 7.4+
- JSON

---

## 数据统计

| 地区 | 数量 |
|------|------|
| 中国同好会 | 220+ |
| 日本同好会 | 26+ |

---

## 许可证

GPLv3

---

## 致谢

- 地图数据：[china-bandori-maps](https://github.com/HELPMEEADICE/china-bandori-maps)
- 地图库：[D3.js](https://d3js.org/)

---

**Made with ❤️ for Galgame Community**
```
