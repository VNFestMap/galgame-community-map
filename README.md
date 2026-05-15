<div align="center">

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║      ██╗   ██╗███╗   ██╗███████╗███████╗███████╗████████╗           ║
║      ██║   ██║████╗  ██║██╔════╝██╔════╝██╔════╝╚══██╔══╝           ║
║      ██║   ██║██╔██╗ ██║█████╗  █████╗  ███████╗   ██║              ║
║      ╚██╗ ██╔╝██║╚██╗██║██╔══╝  ██╔══╝  ╚════██║   ██║              ║
║       ╚████╔╝ ██║ ╚████║██║     ███████╗███████║   ██║              ║
║        ╚═══╝  ╚═╝  ╚═══╝╚═╝     ╚══════╝╚══════╝   ╚═╝              ║
║                                                                      ║
║              Visual Novel Festival · Galgame Circle Map              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

# VNFest Galgame 同好会地图

### 中日高校 Galgame / 视觉小说同好会导航与社群管理平台

[![Version](https://img.shields.io/badge/version-1.6.4-e74c3c?style=for-the-badge)](package.json)
[![License](https://img.shields.io/badge/license-GPLv3-355c9b?style=for-the-badge)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9-f9a03c?style=for-the-badge&logo=d3.js&logoColor=white)](https://d3js.org/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=111)](https://developer.mozilla.org/)

**地图导航 · 同好会资料库 · 成员管理 · 活动日历 · 刊物投稿 · 中日双语 Wiki**

</div>

---

## 目录

- [项目简介](#项目简介)
- [1.6.4 更新摘要](#164-更新摘要)
- [功能总览](#功能总览)
- [系统结构](#系统结构)
- [项目结构](#项目结构)
- [运行与检查](#运行与检查)
- [上传清单](#上传清单)
- [隐私与安全](#隐私与安全)
- [License](#license)

---

## 项目简介

**VNFest Galgame 同好会地图** 是一个围绕 Galgame / 视觉小说同好会构建的互动地图与社群管理平台。

它以地图为入口，把中国省份、日本都道府县、海外同好会、社团资料、成员审核、Wiki、活动日历和刊物投稿串在一起。普通用户可以快速找到附近或感兴趣的同好会；社团负责人可以维护资料、审核成员、发布活动；超级管理员可以进行全站级别的审核与维护。

项目设计目标不是做一个冷冰冰的目录，而是做一个在线的视觉小说校园祭：

```text
发现社团 → 查看资料 → 申请加入 → 参与活动 → 共建 Wiki → 延续创作
```

---

## 1.6.4 更新摘要

这一版主要围绕 **资料准确性、Wiki 内容能力、后台管理和隐私安全** 展开。

| 模块 | 更新 |
| --- | --- |
| 同好会资料 | 支持一个同好会绑定多个省份，例如四川 / 重庆都能显示同一个组织 |
| 编辑体验 | 再次编辑同好会时，会从已有内容继续修改，不再出现空白回填 |
| 成员管理 | 恢复同好会管理页中超级管理员专属的全站成员信息模块 |
| 列表渲染 | 修复 `japanSet is not defined` 导致列表模式异常的问题 |
| Wiki 编辑器 | 支持二级标题、三级标题和更多结构化内容模块 |
| Wiki 双语 | Wiki 页面开始支持中文 / 日文内容切换 |
| Wiki 保存 | 修复编辑保存后可能把 Wiki 首页 HTML 回退的问题 |
| 后端隐私 | 登录重新生成 Session ID，验证码不再回传，第三方平台 ID 不直接暴露给前端 |
| 测试 | 新增后端隐私契约测试，并接入 `npm run check` |

---

## 功能总览

<table>
<tr>
<td width="50%">

### 地图与资料库

- 中国省份地图
- 日本都道府县地图
- 海外同好会入口
- 地图模式 / 列表模式切换
- 省份索引、搜索、筛选和排序
- 多省份绑定，同一社团可出现在多个地区

### 同好会管理

- 社团资料编辑
- 头像、简介、学校、地区、联系方式维护
- 加入申请与成员审核
- 负责人 / 管理员 / 超级管理员权限层级
- 超级管理员全站成员信息查看

### 账号系统

- 本地注册与登录
- 邮箱验证码
- QQ / Discord 绑定状态
- 用户头像与个人资料
- Session 与隐私安全加固

</td>
<td width="50%">

### Wiki 系统

- 可视化 Wiki 编辑器
- 中文 / 日文内容切换
- 标题、段落、图片、信息卡、时间线、外链
- 静态页面生成
- 同好会详情页直达 Wiki

### 活动与刊物

- 活动日历
- 活动报名与取消
- 刊物投稿
- 刊物进度追踪
- GalOnly 相关申请与审核

### 后台与运营

- 同好会管理后台
- 活动、刊物、GalOnly 审核
- 公告与通知
- 反馈管理
- 隐私安全契约测试

</td>
</tr>
</table>

---

## 系统结构

```text
                         ┌──────────────────────┐
                         │      index.html       │
                         │   主页面 / 地图入口   │
                         └───────────┬──────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
       │  地图与列表  │        │  同好会详情  │        │  Wiki 页面   │
       │ D3 / Vanilla │        │ 成员 / 申请  │        │ 中日双语内容 │
       └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │        PHP API        │
                         │  auth / clubs / wiki  │
                         └───────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
                 JSON 数据        SQLite/MySQL      上传目录
```

---

## 项目结构

```text
.
├── admin/                 管理后台页面
├── api/                   PHP API
├── css/                   前端样式
├── data/                  运行数据目录，生产数据不应上传
├── includes/              PHP 公共模块
├── js/                    前端脚本
├── scripts/               构建、生成与契约测试脚本
├── wiki/                  Wiki 内容、静态页面与样式
├── uploads/               用户上传目录
├── images/                站点图片资源
├── index.html             主入口
├── config.example.php     配置模板
├── package.json           Node 脚本与客户端构建配置
└── README.md
```

---

## 运行与检查

本项目部署细节依赖实际服务器环境，这里只保留必要命令。

```bash
npm install
cp config.example.php config.php
php -S localhost:8000
```

检查项目状态：

```bash
npm run check
```

生成 Wiki 静态页：

```bash
npm run wiki:build
```

---

## 上传清单

### 可以上传

代码、模板、测试脚本和 Wiki 生成内容可以进入仓库：

```text
admin/
api/
css/
includes/
js/
scripts/
wiki/index.html
wiki/index.json
wiki/wiki.css
wiki/content/*.json
wiki/pages/*.html
images/
index.html
feedback.html
submit*.html
config.example.php
.env.example
.gitignore
README.md
package.json
package-lock.json
```

### 不要上传

这些内容可能包含密钥、生产数据、用户隐私、上传文件或本地构建产物：

```text
config.php
.env*
.user.ini
node_modules/
dist/
www/
android/
data/clubs.json
data/clubs_japan.json
data/*.db
data/register_email_codes.json
data/feedback.json
data/submissions*.json
data/avatars/*
data/club_avatars/*
data/event_images/*
data/publication_images/*
wiki/uploads/*
docs/frontend-design-demo.html
docs/superpowers/
```

发布前建议：

```bash
git status --short
git status --ignored --short
npm run check
```

---

## 隐私与安全

- 不提交 `config.php`、`.env`、数据库、验证码文件和用户上传内容。
- 不向前端返回 `qq_openid`、`discord_id` 或验证码调试字段。
- 登录时重新生成 Session ID，降低会话固定风险。
- 旧管理员 Token 只允许通过 `X-Admin-Token` 请求头传递。
- 超级管理员成员信息模块仅面向 `super_admin` 开放。

---

## License

本项目基于 [GPLv3](LICENSE) 发布。

<div align="center">

**VNFest · Visual Novel Festival**

愿每一个同好会都能被找到。

</div>
