# 城更智算舱 V1

面向政府、文旅主管部门和平台公司的文旅存量空间投前决策原型。产品采用八步引导式工作区，将客户项目资料、集团历史数据、工程与投资规则及 AI 推理组织为可追溯的诊断和方案。

## 八步流程

`项目录入 → 数据补全 → 空间诊断 → 工程造价 → 投资测算 → 三案选择 → 视觉深化 → 报告交付`

三案位于分析与测算之后。客户确认方案前，系统不会显示默认推荐；确认后才更新视觉深化和打印报告。

## 目录结构

- `index.html`：八步工作区和语义化页面容器。
- `styles.css`：桌面、移动端与 A4 打印样式。
- `app.js`：工作流状态、渲染和浏览器交互。
- `data.mjs`：本地演示数据、字段定义和初始状态。
- `analysis.mjs`：造价公式、方案区间、准入规则和 Provider 接口。
- `workbook.mjs`：本地 `.xlsx` 解析与字段映射。
- `storage.mjs`：带版本号的本地草稿持久化。
- `assets/项目基础数据模板.xlsx`：客户下载填写的真实 Excel 模板。
- `scripts/generate_project_template.py`：可复现生成 Excel 模板。
- `tests/`：计算、Excel、流程、安全和结构测试。

## 本地启动

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

访问 `http://127.0.0.1:5173/`。

## 测试

```bash
node --test tests/*.test.mjs
```

重新生成 Excel 模板：

```bash
python3 scripts/generate_project_template.py
```

## 集团数据与 AI 接口

V1 默认使用 `LocalAnalysisProvider` 和脱敏演示数据，不发起网络请求。后续服务端接入应实现与 `RemoteAnalysisProvider` 一致的 `analyze(project)` 契约，并返回：

- 带知识库、规则和模型版本的 `AnalysisRun`。
- 每项结论均含 `EvidenceReference` 的诊断结果。
- 经规则和数值校验的三套候选方案。

浏览器和大模型不得直接连接集团生产数据库。集团数据应先经过采集、映射、清洗、脱敏、审核和版本发布，再由分析服务按权限检索。客户数据默认项目隔离，不自动进入集团案例库，也不用于模型训练。
