# Changelog

## [1.4.0] - 2026-05-11

### 新增
- 海外同好会独立为国家模式（`State.currentCountry = 'overseas'`），不再归属于中国
- 海外模式不渲染地图，直接显示同好会列表

### 修改
- 同好会卡片布局重构：头像左上对齐，全宽分割线，联系信息/外部链接左下角排列
- 默认排序改为 视觉小说学园祭(vnfest) → 地区高校联合(region) → 高校同好会(school)

### 修复
- 日本地图 `TypeError: d is undefined` 崩溃，`.each()` 回调改用 `this.id` 代替数据绑定 `d.id`
- 日本同好会数量气泡不显示（上述崩溃导致回调提前返回）
- 海外同好会列表空白（`provinceGroupsMap` 缺少 '海外' 键时回退到 `bandoriRows` 过滤）

### 杂项
- `.gitignore` 分类整理，补充常见忽略模式
