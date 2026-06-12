# 城更智算舱 V0

本目录集中存放创新赛 Web 原型的开发文件。

## 目录结构

- `index.html`：单页产品入口。
- `styles.css`：界面样式与响应式布局。
- `app.js`：样例数据、交互与本地测算逻辑。
- `tests/`：结构和约束测试。
- `docs/superpowers/`：产品规格与实施计划。
- `design-system/`：界面设计规范。

## 本地启动

在 `dev` 目录执行：

```bash
python3 -m http.server 5173 --bind 0.0.0.0
```

浏览器访问：

```text
http://127.0.0.1:5173/
```

## 运行测试

```bash
node --test tests/dashboard-v0.test.mjs
```

V0 使用本地样例数据，不连接真实 AI、地图或外部数据 API。
