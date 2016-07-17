# rgrid

用于实现常见的表格控件，基于riot实现。主要由几个组件构成：

* rtable 核心控件，主要实现表格展示
* pagination 分页控件
* query_config 查询条件控件
* dataset 结果集处理控件
* rgrid 将上述控件结合起来

## 安装说明

rgrid 除了依赖于 riot 外，还需要jquery，所以在使用前还需要安装这两个依赖库。本库并不自带，所以
可以考虑使用bower来安装：

```
bower install jquery riot
```

示例代码装默认上述包安装在 rgrid 目录的 bower_components 下。

源码目前放在src目录下，需要通过riot对其进行编译。为了编译可以先安装riot（这个和bower不一样）：

```
npm install riot
```

然后进入 src 执行：

```
riot -w *.tag ../dist
```

## 开发说明

目前功能还比较简单，性能上也不是特别理想，但是我会不断完善，也希望有能力的朋友帮我一起完善

## rtable

本rtable参考了目前几个riot grid的实现，特别是 https://github.com/crisward/riot-grid2
中关于大数据的处理以及固定列及表头的实现。

目前已经以及计划支持以下功能：

[X] 大总数支持。只在页面显示必要的字段，以提高加载速度
[X] 基于数据驱动。因此使用dataset，它是从vis这个库借鉴而来，但是添加了象tree，多字段排序等功能
[X] 多行表头。支持简单的定义形式
[X] 左侧固定列
[X] 表头可以浮动
[ ] 表头可以拖拽
[X] 自动撑满。只在初始化时，当未给出width值时，自动使用剩余长度
[ ] 动态调整可显示列
[ ] 序号显示
[X] 自定义按钮
[ ] 支持调整大小
[ ] checkbox 支持
[ ] 上下文菜单
[X] 单元格自定义渲染
[ ] 行自定义样式
[ ] 选中，支持单选，多选，不选。可以使用checkbox选
[ ] 在线编辑
[ ] 树支持
[ ] 排序支持

## 演示代码

在 examples 下
